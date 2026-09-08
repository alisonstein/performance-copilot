import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AnalysisResultView } from "@/components/dashboard/AnalysisResultView";
import { rankCampaigns } from "@/lib/analysis/analysis-engine";
import { compareTotals } from "@/lib/analysis/compare";
import { formatMonthYear } from "@/lib/format-date";
import { requireUser } from "@/lib/supabase/auth";
import type { AlertItem, CampaignMetrics, MetricsTotals, OpportunityItem, RecommendationItem } from "@/types/domain";
import type { Platform } from "@/types/database";

export const metadata: Metadata = {
  title: "Resultado da Análise",
};

interface AnalysisPageProps {
  params: Promise<{ id: string }>;
}

export default async function AnalysisResultPage({ params }: AnalysisPageProps) {
  const { id } = await params;
  const { supabase, user } = await requireUser();

  const { data: analysis } = await supabase
    .from("analyses")
    .select(
      "id, client_id, platform, start_date, end_date, file_name, total_spend, impressions, clicks, ctr, cpc, cpm, conversions, cpa, revenue, roas, clients(name)"
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!analysis) {
    notFound();
  }

  const clientName = (analysis as unknown as { clients: { name: string } | null }).clients?.name ?? "Cliente";

  const [{ data: items }, { data: aiAnalysis }, { data: previousAnalysis }] = await Promise.all([
    supabase
      .from("analysis_items")
      .select("campaign_name, adset_name, ad_name, spend, impressions, clicks, ctr, cpc, cpm, conversions, cpa, revenue, roas")
      .eq("analysis_id", analysis.id),
    supabase
      .from("ai_analysis")
      .select("diagnosis, alerts, opportunities, recommendations, executive_summary, source")
      .eq("analysis_id", analysis.id)
      .maybeSingle(),
    supabase
      .from("analyses")
      .select("id, start_date, end_date, total_spend, impressions, clicks, ctr, cpc, cpm, conversions, cpa, revenue, roas")
      .eq("client_id", analysis.client_id)
      .eq("user_id", user.id)
      .eq("platform", analysis.platform)
      .lt("start_date", analysis.start_date)
      .order("start_date", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const campaigns: CampaignMetrics[] = (items ?? []).map((item) => ({
    campaignName: item.campaign_name,
    adsetName: item.adset_name,
    adName: item.ad_name,
    spend: Number(item.spend),
    impressions: Number(item.impressions),
    clicks: Number(item.clicks),
    conversions: Number(item.conversions),
    revenue: Number(item.revenue),
    ctr: Number(item.ctr),
    cpc: Number(item.cpc),
    cpm: Number(item.cpm),
    cpa: Number(item.cpa),
    roas: Number(item.roas),
  }));

  const totals: MetricsTotals = {
    spend: Number(analysis.total_spend),
    impressions: Number(analysis.impressions),
    clicks: Number(analysis.clicks),
    ctr: Number(analysis.ctr),
    cpc: Number(analysis.cpc),
    cpm: Number(analysis.cpm),
    conversions: Number(analysis.conversions),
    cpa: Number(analysis.cpa),
    revenue: Number(analysis.revenue),
    roas: Number(analysis.roas),
  };

  const bestCampaigns = rankCampaigns(campaigns, "best");
  const attentionCampaigns = rankCampaigns(campaigns, "attention", totals.cpa);

  let comparison = null;
  let previousPeriodLabel: string | null = null;
  if (previousAnalysis) {
    const previousTotals: MetricsTotals = {
      spend: Number(previousAnalysis.total_spend),
      impressions: Number(previousAnalysis.impressions),
      clicks: Number(previousAnalysis.clicks),
      ctr: Number(previousAnalysis.ctr),
      cpc: Number(previousAnalysis.cpc),
      cpm: Number(previousAnalysis.cpm),
      conversions: Number(previousAnalysis.conversions),
      cpa: Number(previousAnalysis.cpa),
      revenue: Number(previousAnalysis.revenue),
      roas: Number(previousAnalysis.roas),
    };
    comparison = compareTotals(totals, previousTotals);
    previousPeriodLabel = formatMonthYear(previousAnalysis.start_date);
  }

  const aiResult = aiAnalysis
    ? {
        diagnosis: aiAnalysis.diagnosis ?? "",
        executiveSummary: aiAnalysis.executive_summary ?? "",
        alerts: (aiAnalysis.alerts ?? []) as AlertItem[],
        opportunities: (aiAnalysis.opportunities ?? []) as OpportunityItem[],
        recommendations: (aiAnalysis.recommendations ?? []) as RecommendationItem[],
        source: aiAnalysis.source,
      }
    : {
        diagnosis: "Diagnóstico indisponível para esta análise.",
        executiveSummary: "",
        alerts: [] as AlertItem[],
        opportunities: [] as OpportunityItem[],
        recommendations: [] as RecommendationItem[],
        source: "rules" as const,
      };

  return (
    <AnalysisResultView
      clientName={clientName}
      platform={analysis.platform as Platform}
      startDate={analysis.start_date}
      endDate={analysis.end_date}
      fileName={analysis.file_name}
      totals={totals}
      campaigns={campaigns}
      bestCampaigns={bestCampaigns}
      attentionCampaigns={attentionCampaigns}
      aiResult={aiResult}
      comparison={comparison}
      previousPeriodLabel={previousPeriodLabel}
    />
  );
}
