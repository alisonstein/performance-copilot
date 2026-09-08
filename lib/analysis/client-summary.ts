import { formatBRL, formatChangePct, formatNumber, formatNumberOrDash } from "@/lib/analysis/metrics";
import { getPrimaryResultCost, getPrimaryResultCount, PRIMARY_RESULT_NOUN } from "@/lib/analysis/primary-result";
import type { CampaignMetrics, GroupedMetrics, MetricsTotals, PrimaryResultType } from "@/types/domain";

/**
 * Texto em linguagem simples, pensado para ser enviado direto ao cliente
 * final (sem jargão técnico de mídia paga).
 *
 * Mantida por compatibilidade com o fluxo original (resultado genérico via
 * `conversions`). Para análises com "resultado principal" definido (conversas,
 * leads, compras...), use buildClientSummaryV2.
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

/**
 * Versão estendida: considera o "resultado principal" da análise (conversas,
 * leads, compras, cadastros ou visualizações de página), inclui o alcance
 * quando disponível, destaca o conjunto/campanha com melhor desempenho e
 * aponta o principal ponto de atenção — sempre com base apenas nos dados do
 * próprio período (nunca inventa comparação sem dado para sustentar).
 */
export function buildClientSummaryV2(
  totals: MetricsTotals,
  primaryResultType: PrimaryResultType,
  standoutGroup: GroupedMetrics | null,
  attentionGroup: GroupedMetrics | null
): string {
  const noun = PRIMARY_RESULT_NOUN[primaryResultType];
  const resultCount = getPrimaryResultCount(totals, primaryResultType) ?? 0;
  const resultCost = getPrimaryResultCost(totals, primaryResultType);

  const reachClause =
    totals.reach !== null ? `alcançaram ${formatNumberOrDash(totals.reach)} pessoas e ` : "investiram " + formatBRL(totals.spend) + " e ";

  const sentences: string[] = [
    `No período analisado, as campanhas ${reachClause}geraram ${formatNumber(resultCount)} ${noun.plural}${
      resultCost !== null ? `, com custo médio de ${formatBRL(resultCost)} por ${noun.singular}` : ""
    }.`,
  ];

  if (standoutGroup && resultCount > 0) {
    const standoutCount = getPrimaryResultCount(standoutGroup, primaryResultType) ?? 0;
    const standoutCost = getPrimaryResultCost(standoutGroup, primaryResultType);
    const share = (standoutCount / resultCount) * 100;

    if (standoutCount > 0 && share >= 5) {
      const label = standoutGroup.adsetName
        ? `o conjunto "${standoutGroup.adsetName}"`
        : `a campanha "${standoutGroup.campaignName}"`;

      let costClause = "";
      if (standoutCost !== null && resultCost !== null && resultCost > 0) {
        const diffPct = ((standoutCost - resultCost) / resultCost) * 100;
        if (diffPct < -1) {
          costClause = ` com custo ${formatChangePct(Math.abs(diffPct))} abaixo da média`;
        }
      }

      sentences.push(
        `${label.charAt(0).toUpperCase()}${label.slice(1)} foi responsável por ${share.toLocaleString("pt-BR", {
          maximumFractionDigits: 0,
        })}% d${noun.plural.startsWith("a") ? "as" : "os"} ${noun.plural}${costClause}.`
      );
    }
  }

  if (attentionGroup) {
    const attentionLabel = attentionGroup.adsetName
      ? `conjunto "${attentionGroup.adsetName}"`
      : `campanha "${attentionGroup.campaignName}"`;

    const attentionCost = getPrimaryResultCost(attentionGroup, primaryResultType);
    if (attentionCost !== null && resultCost !== null && resultCost > 0 && attentionCost > resultCost) {
      const diffPct = ((attentionCost - resultCost) / resultCost) * 100;
      sentences.push(
        `O principal ponto de atenção está no ${attentionLabel}, com custo por ${noun.singular} ${formatChangePct(
          diffPct
        )} em relação à média do período.`
      );
    } else if (attentionCost === null && attentionGroup.spend > 0) {
      sentences.push(
        `O principal ponto de atenção está no ${attentionLabel}, que consumiu ${formatBRL(
          attentionGroup.spend
        )} sem gerar ${noun.plural} registradas.`
      );
    }
  }

  return sentences.join(" ");
}
