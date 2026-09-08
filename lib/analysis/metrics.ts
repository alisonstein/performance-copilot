// ============================================================================
// metrics.ts
// Cálculo de métricas de mídia paga a partir dos valores brutos normalizados.
// Todas as divisões são seguras (retornam 0 em vez de Infinity/NaN).
// ============================================================================

import type { CampaignMetrics, MetricsTotals, NormalizedCampaignRow } from "@/types/domain";

export function safeDivide(numerator: number, denominator: number, multiplier = 1): number {
  if (!denominator || !Number.isFinite(denominator)) return 0;
  const result = (numerator / denominator) * multiplier;
  return Number.isFinite(result) ? result : 0;
}

export function calculateCtr(clicks: number, impressions: number): number {
  return safeDivide(clicks, impressions, 100);
}

export function calculateCpc(spend: number, clicks: number): number {
  return safeDivide(spend, clicks);
}

export function calculateCpm(spend: number, impressions: number): number {
  return safeDivide(spend, impressions, 1000);
}

export function calculateCpa(spend: number, conversions: number): number {
  return safeDivide(spend, conversions);
}

export function calculateRoas(revenue: number, spend: number): number {
  return safeDivide(revenue, spend);
}

/** Recalcula CTR, CPC, CPM, CPA e ROAS de uma linha a partir dos valores brutos. */
export function computeCampaignMetrics(row: NormalizedCampaignRow): CampaignMetrics {
  return {
    ...row,
    ctr: calculateCtr(row.clicks, row.impressions),
    cpc: calculateCpc(row.spend, row.clicks),
    cpm: calculateCpm(row.spend, row.impressions),
    cpa: calculateCpa(row.spend, row.conversions),
    roas: calculateRoas(row.revenue, row.spend),
  };
}

/**
 * Soma os totais e recalcula as métricas derivadas a partir dos totais
 * (nunca faz média simples de percentuais/razões por linha, o que distorceria
 * o resultado quando as campanhas têm volumes muito diferentes).
 */
export function aggregateTotals(rows: NormalizedCampaignRow[]): MetricsTotals {
  const base = rows.reduce(
    (acc, row) => ({
      spend: acc.spend + row.spend,
      impressions: acc.impressions + row.impressions,
      clicks: acc.clicks + row.clicks,
      conversions: acc.conversions + row.conversions,
      revenue: acc.revenue + row.revenue,
    }),
    { spend: 0, impressions: 0, clicks: 0, conversions: 0, revenue: 0 }
  );

  return {
    ...base,
    ctr: calculateCtr(base.clicks, base.impressions),
    cpc: calculateCpc(base.spend, base.clicks),
    cpm: calculateCpm(base.spend, base.impressions),
    cpa: calculateCpa(base.spend, base.conversions),
    roas: calculateRoas(base.revenue, base.spend),
  };
}

export function formatBRL(value: number): string {
  return (Number.isFinite(value) ? value : 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatNumber(value: number): string {
  return (Number.isFinite(value) ? value : 0).toLocaleString("pt-BR", {
    maximumFractionDigits: 0,
  });
}

export function formatPercent(value: number): string {
  return `${(Number.isFinite(value) ? value : 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  })}%`;
}

export function formatRoas(value: number): string {
  return `${(Number.isFinite(value) ? value : 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  })}x`;
}

export function formatChangePct(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}
