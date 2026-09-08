import "server-only";
import OpenAI from "openai";
import { aiAnalysisContentSchema, type AiAnalysisContentParsed } from "@/lib/ai/types";
import type { AiAnalysisRequest, AiProvider } from "@/lib/ai/provider";

const DEFAULT_MODEL = "gpt-4o-mini";

const PRIMARY_RESULT_PROMPT_LABEL: Record<string, string> = {
  conversations: "conversas iniciadas (mensagens/WhatsApp)",
  leads: "leads",
  purchases: "compras",
  registrations: "cadastros",
  landing_page_views: "visualizações de página de destino",
  other: "conversões (resultado genérico do arquivo)",
};

const SYSTEM_PROMPT = `Você é um analista de mídia paga sênior atuando como copiloto de gestores de tráfego. Analise os dados fornecidos sem inventar métricas — use apenas os valores recebidos no JSON do usuário.

Gere: diagnóstico, alertas, oportunidades, recomendações e um resumo executivo.

O campo "resultadoPrincipal" do JSON indica o que este gestor está otimizando nesta análise (ex.: conversas iniciadas, leads, compras). Enquadre o diagnóstico e o resumo executivo em torno desse resultado.

O campo "campanhas" traz uma linha por anúncio/criativo (campo "anuncio", quando presente, é o nome do criativo específico; "campanha" é a campanha à qual ele pertence), com CTR, CPA, frequência e o resultado principal de cada um. Use isso para comentar sobre os criativos que mais se destacam e os que menos performam — SEMPRE com base em métricas de performance (CTR, custo por resultado, volume, frequência), NUNCA alegando que um criativo é "feio", "ruim" ou "de baixa qualidade" por estética. Exemplo de tom aceitável: "Os criativos Video 03 e Static 07 concentram os melhores resultados da conta, com CTR 31% superior à média." Exemplo de alerta aceitável: "O criativo Static 02 já consumiu R$ 418 sem gerar conversas — vale revisar mensagem, oferta ou continuidade."

Regras de tom (muito importantes):
- Nunca dê ordens diretas como "pause imediatamente", "escale imediatamente" ou "essa campanha/esse criativo está errado".
- Use linguagem sugestiva: "vale investigar", "considere testar", "os dados sugerem", "há sinal de", "pode ser interessante avaliar".
- Este software é um copiloto: ele apoia a decisão do gestor, não a substitui.
- Responda somente em português do Brasil, em tom direto e profissional, sem exageros.

Responda ESTRITAMENTE em um único objeto JSON, sem markdown e sem texto fora do JSON, no formato:
{
  "diagnosis": "string",
  "alerts": [{ "title": "string", "description": "string", "severity": "low" | "medium" | "high" }],
  "opportunities": [{ "title": "string", "description": "string" }],
  "recommendations": [{ "title": "string", "description": "string", "priority": "low" | "medium" | "high" }],
  "executiveSummary": "string"
}`;

function buildUserPrompt(request: AiAnalysisRequest): string {
  return JSON.stringify({
    cliente: request.clientName,
    plataforma: request.platform === "meta_ads" ? "Meta Ads" : "Google Ads",
    periodo: { inicio: request.startDate, fim: request.endDate },
    resultadoPrincipal: PRIMARY_RESULT_PROMPT_LABEL[request.primaryResultType] ?? request.primaryResultType,
    totais: request.totals,
    campanhas: request.campaignSummaries.map((c) => ({
      campanha: c.campaignName,
      anuncio: c.adName,
      investimento: c.spend,
      ctr: c.ctr,
      cpa: c.cpa,
      roas: c.roas,
      conversoes: c.conversions,
      frequencia: c.frequency,
      resultadoPrincipal: c.primaryResultCount,
      custoPorResultadoPrincipal: c.primaryResultCost,
    })),
    alertasJaDetectadosPorRegras: request.ruleBasedAlerts,
    oportunidadesJaDetectadasPorRegras: request.ruleBasedOpportunities,
  });
}

export class OpenAiProvider implements AiProvider {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(apiKey: string, model: string = process.env.OPENAI_MODEL ?? DEFAULT_MODEL) {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async generateAnalysis(request: AiAnalysisRequest): Promise<AiAnalysisContentParsed> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(request) },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Resposta vazia da IA.");
    }

    const parsedJson: unknown = JSON.parse(content);
    return aiAnalysisContentSchema.parse(parsedJson);
  }
}
