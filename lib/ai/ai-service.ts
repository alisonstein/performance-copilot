import "server-only";
import { runAnalysisEngine } from "@/lib/analysis/analysis-engine";
import { formatBRL, formatNumber, formatPercent, formatRoas } from "@/lib/analysis/metrics";
import { getPrimaryResultCost, getPrimaryResultCount, PRIMARY_RESULT_NOUN } from "@/lib/analysis/primary-result";
import { OpenAiProvider } from "@/lib/ai/openai-provider";
import type { AiCampaignSummary, AiProvider } from "@/lib/ai/provider";
import type { Platform } from "@/types/database";
import type {
  AiAnalysisResult,
  AnalysisEngineResult,
  CampaignMetrics,
  NormalizedCampaignRow,
  PrimaryResultType,
  RecommendationItem,
} from "@/types/domain";

const MAX_CAMPAIGNS_SENT_TO_AI = 30;

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function roundNullable(value: number | null): number | null {
  return value === null ? null : round2(value);
}

function buildCampaignSummaries(
  engineResult: AnalysisEngineResult,
  primaryResultType: PrimaryResultType
): AiCampaignSummary[] {
  return [...engineResult.campaigns]
    .sort((a, b) => b.spend - a.spend)
    .slice(0, MAX_CAMPAIGNS_SENT_TO_AI)
    .map((c) => ({
      campaignName: c.campaignName,
      adName: c.adName,
      spend: round2(c.spend),
      ctr: round2(c.ctr),
      cpa: round2(c.cpa),
      roas: round2(c.roas),
      conversions: round2(c.conversions),
      frequency: roundNullable(c.frequency),
      primaryResultCount: getPrimaryResultCount(c, primaryResultType),
      primaryResultCost: roundNullable(getPrimaryResultCost(c, primaryResultType)),
    }));
}

function pickTopCreative(campaigns: CampaignMetrics[], primaryResultType: PrimaryResultType): CampaignMetrics | null {
  const withResults = campaigns.filter((c) => (getPrimaryResultCount(c, primaryResultType) ?? 0) > 0);
  if (withResults.length === 0) return null;
  return [...withResults].sort((a, b) => {
    const costA = getPrimaryResultCost(a, primaryResultType) ?? Number.POSITIVE_INFINITY;
    const costB = getPrimaryResultCost(b, primaryResultType) ?? Number.POSITIVE_INFINITY;
    return costA - costB;
  })[0];
}

function pickWorstCreative(campaigns: CampaignMetrics[]): CampaignMetrics | null {
  const withSpend = campaigns.filter((c) => c.spend > 0 && c.conversions === 0);
  if (withSpend.length === 0) return null;
  return [...withSpend].sort((a, b) => b.spend - a.spend)[0];
}

/**
 * Diagnóstico e resumo executivo construídos a partir das próprias regras
 * determinísticas — usado quando a OPENAI_API_KEY não está configurada ou
 * quando a chamada à IA falha por qualquer motivo. O sistema nunca deve
 * quebrar por causa de uma indisponibilidade externa.
 */
function ruleBasedFallback(
  engineResult: AnalysisEngineResult,
  clientName: string,
  primaryResultType: PrimaryResultType
): AiAnalysisResult {
  const { totals, alerts, opportunities, campaigns } = engineResult;
  const noun = PRIMARY_RESULT_NOUN[primaryResultType];
  const resultCount = getPrimaryResultCount(totals, primaryResultType) ?? totals.conversions;
  const resultCost = getPrimaryResultCost(totals, primaryResultType);

  const executiveSummary = `No período analisado, ${clientName} ${
    totals.reach !== null ? `alcançou ${formatNumber(totals.reach)} pessoas e ` : ""
  }gerou ${formatNumber(resultCount)} ${noun.plural}${
    resultCost !== null ? `, com custo médio de ${formatBRL(resultCost)} por ${noun.singular}` : ""
  }. O CTR médio foi de ${formatPercent(totals.ctr)} e o ROAS de ${formatRoas(totals.roas)}.`;

  const diagnosisParts: string[] = [
    `O período somou ${formatBRL(totals.spend)} de investimento, ${formatNumber(
      totals.impressions
    )} impressões e ${formatNumber(totals.clicks)} cliques, resultando em CTR de ${formatPercent(
      totals.ctr
    )} e CPC médio de ${formatBRL(totals.cpc)}.`,
  ];

  const topCreative = pickTopCreative(campaigns, primaryResultType);
  const worstCreative = pickWorstCreative(campaigns);

  if (topCreative) {
    const label = topCreative.adName ? `"${topCreative.adName}"` : `"${topCreative.campaignName}"`;
    diagnosisParts.push(
      `O criativo ${label} concentra o melhor custo por ${noun.singular} da conta, com CTR de ${formatPercent(
        topCreative.ctr
      )}.`
    );
  }

  if (worstCreative) {
    const label = worstCreative.adName ? `"${worstCreative.adName}"` : `"${worstCreative.campaignName}"`;
    diagnosisParts.push(
      `O criativo ${label} já consumiu ${formatBRL(worstCreative.spend)} sem gerar ${noun.plural} — vale revisar mensagem, oferta ou continuidade.`
    );
  }

  if (alerts.length > 0) {
    diagnosisParts.push(
      `Foram identificados ${alerts.length} ponto(s) que vale a pena investigar, com destaque para: ${alerts
        .slice(0, 3)
        .map((a) => a.title.toLowerCase())
        .join(", ")}.`
    );
  } else {
    diagnosisParts.push("Não foram identificados sinais de alerta relevantes no período com base nas regras aplicadas.");
  }

  if (opportunities.length > 0) {
    diagnosisParts.push(
      `Também há sinais de oportunidade, como: ${opportunities
        .slice(0, 3)
        .map((o) => o.title.toLowerCase())
        .join(", ")}.`
    );
  }

  const recommendations: RecommendationItem[] = [
    ...opportunities.slice(0, 3).map((o) => ({
      title: o.title,
      description: `${o.description} Pode ser interessante avaliar um aumento gradual de investimento nesse ponto.`,
      priority: "medium" as const,
    })),
    ...alerts
      .filter((a) => a.severity === "high")
      .slice(0, 3)
      .map((a) => ({
        title: a.title,
        description: `${a.description} Vale investigar antes de decidir os próximos passos.`,
        priority: "high" as const,
      })),
  ];

  return {
    diagnosis: diagnosisParts.join(" "),
    alerts,
    opportunities,
    recommendations,
    executiveSummary,
    source: "rules",
  };
}

export interface GenerateAnalysisParams {
  clientName: string;
  platform: Platform;
  startDate: string;
  endDate: string;
  primaryResultType: PrimaryResultType;
  rows: NormalizedCampaignRow[];
}

export interface GenerateAnalysisOutput {
  aiResult: AiAnalysisResult;
  engineResult: AnalysisEngineResult;
}

/**
 * Orquestra o diagnóstico: sempre roda o motor de regras primeiro; depois,
 * se houver OPENAI_API_KEY configurada, tenta enriquecer com a IA. Qualquer
 * falha na IA (chave ausente, erro de rede, resposta fora do formato
 * esperado) faz o serviço retornar o resultado baseado em regras — o upload
 * de CSV nunca falha por causa da IA.
 */
export async function generateAiAnalysis(params: GenerateAnalysisParams): Promise<GenerateAnalysisOutput> {
  const engineResult = runAnalysisEngine(params.rows);
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[ai-service] OPENAI_API_KEY não configurada. Usando análise local baseada em regras.");
    }
    return {
      aiResult: ruleBasedFallback(engineResult, params.clientName, params.primaryResultType),
      engineResult,
    };
  }

  try {
    const provider: AiProvider = new OpenAiProvider(apiKey);
    const content = await provider.generateAnalysis({
      clientName: params.clientName,
      platform: params.platform,
      startDate: params.startDate,
      endDate: params.endDate,
      primaryResultType: params.primaryResultType,
      totals: engineResult.totals,
      campaignSummaries: buildCampaignSummaries(engineResult, params.primaryResultType),
      ruleBasedAlerts: engineResult.alerts,
      ruleBasedOpportunities: engineResult.opportunities,
    });

    return {
      aiResult: { ...content, source: "ai" },
      engineResult,
    };
  } catch (error) {
    console.error("[ai-service] Falha ao gerar análise com IA — usando fallback local.", error);
    return {
      aiResult: ruleBasedFallback(engineResult, params.clientName, params.primaryResultType),
      engineResult,
    };
  }
}
