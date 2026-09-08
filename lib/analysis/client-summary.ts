import { formatBRL, formatNumber } from "@/lib/analysis/metrics";
import type { CampaignMetrics, MetricsTotals } from "@/types/domain";

/**
 * Texto em linguagem simples, pensado para ser enviado direto ao cliente
 * final (sem jargão técnico de mídia paga).
 */
export function buildClientSummary(totals: MetricsTotals, bestCampaign: CampaignMetrics | null): string {
  const base = `No período analisado, as campanhas investiram ${formatBRL(
    totals.spend
  )} e geraram ${formatNumber(totals.conversions)} conversões, com custo médio de ${formatBRL(
    totals.cpa
  )} por resultado.`;

  if (!bestCampaign || bestCampaign.conversions === 0) {
    return base;
  }

  return `${base} Em relação à eficiência, a campanha "${bestCampaign.campaignName}" se destacou, com custo por resultado de ${formatBRL(
    bestCampaign.cpa
  )} — abaixo da média do período.`;
}
