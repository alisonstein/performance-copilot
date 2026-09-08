import { NextResponse } from "next/server";
import Papa from "papaparse";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { normalizeCsvRows } from "@/lib/csv/csv-normalizer";
import { generateAiAnalysis } from "@/lib/ai/ai-service";
import { MAX_CSV_FILE_SIZE_BYTES } from "@/lib/constants";

export const runtime = "nodejs";

const metadataSchema = z
  .object({
    clientId: z.string().uuid("Cliente inválido."),
    platform: z.enum(["meta_ads", "google_ads"], { message: "Selecione uma plataforma válida." }),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inicial inválida."),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data final inválida."),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: "A data inicial não pode ser depois da data final.",
    path: ["startDate"],
  });

export async function POST(request: Request) {
  let supabase;
  let userId: string;

  try {
    supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Sessão expirada. Faça login novamente." }, { status: 401 });
    }
    userId = user.id;
  } catch {
    return NextResponse.json({ error: "Não foi possível validar sua sessão. Tente novamente." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Não foi possível ler os dados enviados." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Selecione um arquivo CSV para continuar." }, { status: 400 });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "O arquivo está vazio." }, { status: 400 });
  }

  if (file.size > MAX_CSV_FILE_SIZE_BYTES) {
    return NextResponse.json({ error: "O arquivo excede o limite de 10 MB." }, { status: 413 });
  }

  if (!file.name.toLowerCase().endsWith(".csv")) {
    return NextResponse.json({ error: "Envie um arquivo no formato .csv." }, { status: 400 });
  }

  const parsedMetadata = metadataSchema.safeParse({
    clientId: formData.get("clientId"),
    platform: formData.get("platform"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });

  if (!parsedMetadata.success) {
    return NextResponse.json(
      { error: parsedMetadata.error.issues[0]?.message ?? "Dados inválidos." },
      { status: 400 }
    );
  }

  const { clientId, platform, startDate, endDate } = parsedMetadata.data;

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("id, name")
    .eq("id", clientId)
    .eq("user_id", userId)
    .maybeSingle();

  if (clientError || !client) {
    return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  }

  let csvText: string;
  try {
    csvText = await file.text();
  } catch {
    return NextResponse.json({ error: "Não foi possível ler o conteúdo do arquivo." }, { status: 400 });
  }

  const parsedCsv = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    delimitersToGuess: [",", ";", "\t", "|"],
  });

  const normalized = normalizeCsvRows(parsedCsv.data);

  if (!normalized.ok) {
    return NextResponse.json({ error: normalized.message }, { status: 422 });
  }

  let aiResult;
  let engineResult;
  try {
    const generated = await generateAiAnalysis({
      clientName: client.name,
      platform,
      startDate,
      endDate,
      rows: normalized.rows,
    });
    aiResult = generated.aiResult;
    engineResult = generated.engineResult;
  } catch (error) {
    console.error("[POST /api/analysis] Falha ao gerar diagnóstico", error);
    return NextResponse.json(
      { error: "Não foi possível gerar o diagnóstico. Tente novamente em instantes." },
      { status: 500 }
    );
  }

  const { totals } = engineResult;

  const { data: analysis, error: insertAnalysisError } = await supabase
    .from("analyses")
    .insert({
      user_id: userId,
      client_id: clientId,
      platform,
      start_date: startDate,
      end_date: endDate,
      file_name: file.name,
      status: "completed",
      total_spend: totals.spend,
      impressions: totals.impressions,
      clicks: totals.clicks,
      ctr: totals.ctr,
      cpc: totals.cpc,
      cpm: totals.cpm,
      conversions: totals.conversions,
      cpa: totals.cpa,
      revenue: totals.revenue,
      roas: totals.roas,
    })
    .select("id")
    .single();

  if (insertAnalysisError || !analysis) {
    console.error("[POST /api/analysis] Falha ao salvar análise", insertAnalysisError);
    return NextResponse.json({ error: "Não foi possível salvar a análise. Tente novamente." }, { status: 500 });
  }

  const analysisId = analysis.id;

  const itemsPayload = engineResult.campaigns.map((campaign) => ({
    analysis_id: analysisId,
    campaign_name: campaign.campaignName,
    adset_name: campaign.adsetName,
    ad_name: campaign.adName,
    spend: campaign.spend,
    impressions: campaign.impressions,
    clicks: campaign.clicks,
    ctr: campaign.ctr,
    cpc: campaign.cpc,
    cpm: campaign.cpm,
    conversions: campaign.conversions,
    cpa: campaign.cpa,
    revenue: campaign.revenue,
    roas: campaign.roas,
    raw_data: campaign as unknown as Record<string, unknown>,
  }));

  const { error: itemsError } = await supabase.from("analysis_items").insert(itemsPayload);

  const { error: aiInsertError } = await supabase.from("ai_analysis").insert({
    analysis_id: analysisId,
    diagnosis: aiResult.diagnosis,
    alerts: aiResult.alerts,
    opportunities: aiResult.opportunities,
    recommendations: aiResult.recommendations,
    executive_summary: aiResult.executiveSummary,
    source: aiResult.source,
  });

  if (itemsError || aiInsertError) {
    console.error("[POST /api/analysis] Falha ao salvar detalhes da análise", itemsError, aiInsertError);
    await supabase.from("analyses").update({ status: "failed" }).eq("id", analysisId);
    return NextResponse.json(
      { error: "A análise foi processada, mas houve uma falha ao salvar os detalhes. Tente novamente." },
      { status: 500 }
    );
  }

  return NextResponse.json({ analysisId }, { status: 201 });
}
