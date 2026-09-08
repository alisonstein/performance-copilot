// ============================================================================
// analysis-engine.ts
//
// Motor de diagnóstico determinístico (baseado em regras, sem IA). Roda
// sempre — mesmo sem OPENAI_API_KEY configurada — e serve tanto como
// resultado final (fallback) quanto como insumo estruturado para a camada
// de IA (lib/ai/ai-service.ts), que enriquece esse diagnóstico com
// linguagem natural.
//
// Tom: o produto é um copiloto, não substitui o gestor. Por isso as
// descrições usam linguagem sugestiva ("vale investigar", "considere
// avaliar") em vez de comandos ("pause", "escale").
// ============================================================================

import { aggregateTotals, computeCampaignMetrics, formatBRL, formatPercent, formatRoas } from "@/lib/analysis/metrics";
import type {
  AlertItem,
  AnalysisEngineResult,
  CampaignMetrics,
  NormalizedCampaignRow,
  OpportunityItem,
  Severity,
} from "@/types/domain";

const CPA_ABOVE_AVERAGE_THRESHOLD = 1.4; // 40% acima da média
const CPA_BELOW_AVERAGE_THRESHOLD = 0.7; // 30% abaixo da média
const CPC_ABOVE_AVERAGE_THRESHOLD = 1.4;
const CPM_ABOVE_AVERAGE_THRESHOLD = 1.4; // 40% acima da média da conta
const LOW_CTR_THRESHOLD = 1; // %
const HIGH_FREQUENCY_THRESHOLD = 4;
const MAX_ITEMS_PER_CATEGORY = 8;

const SEVERITY_RANK: Record<Severity, number> = { high: 0, medium: 1, low: 2 };

export function runAnalysisEngine(rows: NormalizedCampaignRow[]): AnalysisEngineResult {
  const campaigns = rows.map(computeCampaignMetrics);
  const totals = aggregateTotals(rows);

  const alerts: AlertItem[] = [];
  const opportunities: OpportunityItem[] = [];

  if (totals.impressions > 0 && totals.ctr < LOW_CTR_THRESHOLD) {
    alerts.push({
      title: "CTR geral baixo",
      severity: "medium",
      description: `O CTR médio do período foi de ${formatPercent(
        totals.ctr
      )}. Vale investigar se os criativos estão perdendo força com o público.`,
    });
  }

  for (const campaign of campaigns) {
    if (campaign.spend > 0 && campaign.conversions === 0) {
      alerts.push({
        title: "Campanha sem conversões",
        severity: "high",
        description: `"${campaign.campaignName}" consumiu ${formatBRL(
          campaign.spend
        )} sem gerar conversões registradas no período. Vale investigar o funil dessa campanha.`,
      });
    }

    if (totals.cpa > 0 && campaign.conversions > 0 && campaign.cpa > totals.cpa * CPA_ABOVE_AVERAGE_THRESHOLD) {
      alerts.push({
        title: "CPA acima da média",
        severity: "medium",
        description: `"${campaign.campaignName}" está com CPA de ${formatBRL(
          campaign.cpa
        )}, bem acima da média do período (${formatBRL(
          totals.cpa
        )}). Considere investigar segmentação e criativos.`,
      });
    }

    if (totals.cpc > 0 && campaign.clicks > 0 && campaign.cpc > totals.cpc * CPC_ABOVE_AVERAGE_THRESHOLD) {
      alerts.push({
        title: "CPC elevado",
        severity: "low",
        description: `"${campaign.campaignName}" tem CPC de ${formatBRL(
          campaign.cpc
        )}, acima da média do período (${formatBRL(
          totals.cpc
        )}). Pode ser interessante avaliar a concorrência e a qualidade do anúncio.`,
      });
    }

    if (totals.cpa > 0 && campaign.conversions > 0 && campaign.cpa < totals.cpa * CPA_BELOW_AVERAGE_THRESHOLD) {
      opportunities.push({
        title: "Eficiência acima da média",
        description: `"${campaign.campaignName}" apresenta CPA de ${formatBRL(
          campaign.cpa
        )}, entre os mais eficientes do período (média de ${formatBRL(
          totals.cpa
        )}). Considere testar um aumento gradual de verba.`,
      });
    }

    if (totals.roas > 0 && campaign.revenue > 0 && campaign.roas > totals.roas) {
      opportunities.push({
        title: "ROAS acima da média",
        description: `"${campaign.campaignName}" tem ROAS de ${formatRoas(
          campaign.roas
        )}, acima da média do período (${formatRoas(
          totals.roas
        )}). Há sinal de bom retorno sobre o investimento nessa campanha.`,
      });
    }

    if (campaign.frequency !== null && campaign.frequency > HIGH_FREQUENCY_THRESHOLD) {
      alerts.push({
        title: "Frequência alta",
        severity: "medium",
        description: `"${campaign.campaignName}" está com frequência de ${campaign.frequency.toLocaleString(
          "pt-BR",
          { maximumFractionDigits: 1 }
        )}. Há sinal de possível saturação de audiência — vale investigar a renovação de criativos.`,
      });
    }

    if (totals.cpm > 0 && campaign.impressions > 0 && campaign.cpm > totals.cpm * CPM_ABOVE_AVERAGE_THRESHOLD) {
      alerts.push({
        title: "CPM acima da média",
        severity: "low",
        description: `"${campaign.campaignName}" tem CPM de ${formatBRL(
          campaign.cpm
        )}, acima da média da conta (${formatBRL(
          totals.cpm
        )}). Pode ser interessante avaliar a segmentação de público dessa campanha.`,
      });
    }
  }

  const rankedAlerts = [...alerts]
    .sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity])
    .slice(0, MAX_ITEMS_PER_CATEGORY);

  const rankedOpportunities = opportunities.slice(0, MAX_ITEMS_PER_CATEGORY);

  const bestCampaigns = rankCampaigns(campaigns, "best");
  const attentionCampaigns = rankCampaigns(campaigns, "attention", totals.cpa);

  return {
    totals,
    campaigns,
    bestCampaigns,
    attentionCampaigns,
    alerts: rankedAlerts,
    opportunities: rankedOpportunities,
  };
}

export function rankCampaigns(
  campaigns: CampaignMetrics[],
  mode: "best" | "attention",
  averageCpa = 0
): CampaignMetrics[] {
  if (mode === "best") {
    return [...campaigns]
      .filter((c) => c.conversions > 0)
      .sort((a, b) => a.cpa - b.cpa)
      .slice(0, 5);
  }

  return [...campaigns]
    .filter((c) => c.spend > 0 && (c.conversions === 0 || (averageCpa > 0 && c.cpa > averageCpa * 1.2)))
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 5);
}
