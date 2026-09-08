// ============================================================================
// creative-ranking.ts
// Rankings de criativos (nível de anúncio) usados na aba Criativos: os 5
// melhores por custo/volume/CTR/investimento, e os 5 que merecem atenção.
// O "resultado" considerado respeita o resultado principal escolhido na
// análise (conversas, leads, compras, cadastros, LPV ou o genérico
// "conversões").
// ============================================================================

import { getPrimaryResultCost, getPrimaryResultCount } from "@/lib/analysis/primary-result";
import type { CampaignMetrics, CreativeRankingResult, PrimaryResultType } from "@/types/domain";

const TOP_N = 5;
const MIN_RESULTS_FOR_COST_RANKING = 1;
const ATTENTION_SPEND_THRESHOLD = 50;
const ATTENTION_CPA_MULTIPLIER = 1.3; // 30% acima da média
const ATTENTION_LOW_CTR = 1; // %
const ATTENTION_HIGH_FREQUENCY = 4;

function buildAttentionList(
  creatives: CampaignMetrics[],
  primaryResultType: PrimaryResultType,
  accountAverageCost: number
): CampaignMetrics[] {
  const flagged = new Set<CampaignMetrics>();

  for (const creative of creatives) {
    const resultCount = getPrimaryResultCount(creative, primaryResultType) ?? 0;
    const resultCost = getPrimaryResultCost(creative, primaryResultType);

    if (creative.spend >= ATTENTION_SPEND_THRESHOLD && resultCount === 0) {
      flagged.add(creative);
      continue;
    }
    if (accountAverageCost > 0 && resultCost !== null && resultCost > accountAverageCost * ATTENTION_CPA_MULTIPLIER) {
      flagged.add(creative);
      continue;
    }
    if (creative.impressions > 0 && creative.ctr < ATTENTION_LOW_CTR) {
      flagged.add(creative);
      continue;
    }
    if (creative.frequency !== null && creative.frequency > ATTENTION_HIGH_FREQUENCY) {
      flagged.add(creative);
    }
  }

  return Array.from(flagged)
    .sort((a, b) => b.spend - a.spend)
    .slice(0, TOP_N);
}

/**
 * @param accountAverageCost custo médio por resultado principal da conta
 * inteira (ex.: totals.cpa, ou getPrimaryResultCost(totals, primaryResultType)).
 * Usado para decidir o que está "acima da média".
 */
export function rankCreatives(
  creatives: CampaignMetrics[],
  primaryResultType: PrimaryResultType,
  accountAverageCost: number
): CreativeRankingResult {
  const withResult = creatives.map((creative) => ({
    creative,
    resultCount: getPrimaryResultCount(creative, primaryResultType) ?? 0,
    resultCost: getPrimaryResultCost(creative, primaryResultType),
  }));

  const byLowestCostPerResult = withResult
    .filter((entry) => entry.resultCount >= MIN_RESULTS_FOR_COST_RANKING && entry.resultCost !== null)
    .sort((a, b) => (a.resultCost as number) - (b.resultCost as number))
    .slice(0, TOP_N)
    .map((entry) => entry.creative);

  const byHighestVolume = [...withResult]
    .sort((a, b) => b.resultCount - a.resultCount)
    .slice(0, TOP_N)
    .map((entry) => entry.creative);

  const byHighestCtr = [...creatives]
    .filter((creative) => creative.impressions > 0)
    .sort((a, b) => b.ctr - a.ctr)
    .slice(0, TOP_N);

  const byHighestSpend = [...creatives].sort((a, b) => b.spend - a.spend).slice(0, TOP_N);

  const needsAttention = buildAttentionList(creatives, primaryResultType, accountAverageCost);

  return { byLowestCostPerResult, byHighestVolume, byHighestCtr, byHighestSpend, needsAttention };
}
