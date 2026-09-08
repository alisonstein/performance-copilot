// ============================================================================
// aggregate.ts
// Agrupa itens no nível de anúncio (CampaignMetrics) por campanha ou por
// conjunto de anúncios, somando as métricas e recalculando as razões a
// partir dos totais do grupo — usado pelas abas Campanhas e Conjuntos.
// ============================================================================

import {
  calculateCostPerResult,
  calculateCpa,
  calculateCpc,
  calculateCpm,
  calculateCtr,
  calculateFrequency,
  calculateRoas,
  sumNullable,
} from "@/lib/analysis/metrics";
import type { CampaignMetrics, CampaignStatus, GroupedMetrics } from "@/types/domain";

function mergeStatus(statuses: Array<CampaignStatus | null>): CampaignStatus | null {
  const known = statuses.filter((status): status is CampaignStatus => status !== null);
  if (known.length === 0) return null;
  const unique = new Set(known);
  return unique.size === 1 ? known[0] : "other";
}

interface GroupKey {
  key: string;
  campaignName: string;
  adsetName: string | null;
}

function groupBy(items: CampaignMetrics[], keyFn: (item: CampaignMetrics) => GroupKey): GroupedMetrics[] {
  const groups = new Map<string, CampaignMetrics[]>();
  const meta = new Map<string, { campaignName: string; adsetName: string | null }>();

  for (const item of items) {
    const { key, campaignName, adsetName } = keyFn(item);
    if (!groups.has(key)) {
      groups.set(key, []);
      meta.set(key, { campaignName, adsetName });
    }
    groups.get(key)?.push(item);
  }

  const result: GroupedMetrics[] = [];

  for (const [key, groupItems] of groups.entries()) {
    const info = meta.get(key);
    if (!info) continue;

    const spend = groupItems.reduce((sum, item) => sum + item.spend, 0);
    const impressions = groupItems.reduce((sum, item) => sum + item.impressions, 0);
    const clicks = groupItems.reduce((sum, item) => sum + item.clicks, 0);
    const conversions = groupItems.reduce((sum, item) => sum + item.conversions, 0);
    const revenue = groupItems.reduce((sum, item) => sum + item.revenue, 0);

    const reach = sumNullable(groupItems.map((item) => item.reach));
    const linkClicks = sumNullable(groupItems.map((item) => item.linkClicks));
    const landingPageViews = sumNullable(groupItems.map((item) => item.landingPageViews));
    const conversationsStarted = sumNullable(groupItems.map((item) => item.conversationsStarted));
    const leads = sumNullable(groupItems.map((item) => item.leads));
    const purchases = sumNullable(groupItems.map((item) => item.purchases));
    const registrations = sumNullable(groupItems.map((item) => item.registrations));
    const checkouts = sumNullable(groupItems.map((item) => item.checkouts));
    const addToCart = sumNullable(groupItems.map((item) => item.addToCart));
    const contacts = sumNullable(groupItems.map((item) => item.contacts));

    result.push({
      key,
      campaignName: info.campaignName,
      adsetName: info.adsetName,
      status: mergeStatus(groupItems.map((item) => item.status)),
      itemCount: groupItems.length,
      spend,
      impressions,
      clicks,
      conversions,
      revenue,
      ctr: calculateCtr(clicks, impressions),
      cpc: calculateCpc(spend, clicks),
      cpm: calculateCpm(spend, impressions),
      cpa: calculateCpa(spend, conversions),
      roas: calculateRoas(revenue, spend),
      reach,
      frequency: calculateFrequency(impressions, reach),
      linkClicks,
      landingPageViews,
      conversationsStarted,
      costPerConversation: calculateCostPerResult(spend, conversationsStarted),
      leads,
      costPerLead: calculateCostPerResult(spend, leads),
      purchases,
      costPerPurchase: calculateCostPerResult(spend, purchases),
      registrations,
      checkouts,
      addToCart,
      contacts,
    });
  }

  return result;
}

/** Agrupa por campanha (soma todos os conjuntos/anúncios daquela campanha). */
export function groupByCampaign(items: CampaignMetrics[]): GroupedMetrics[] {
  return groupBy(items, (item) => ({
    key: item.campaignName,
    campaignName: item.campaignName,
    adsetName: null,
  }));
}

/** Agrupa por conjunto de anúncios (campanha + conjunto). */
export function groupByAdset(items: CampaignMetrics[]): GroupedMetrics[] {
  return groupBy(items, (item) => {
    const adsetName = item.adsetName ?? "Sem conjunto";
    return {
      key: `${item.campaignName}__${adsetName}`,
      campaignName: item.campaignName,
      adsetName,
    };
  });
}
