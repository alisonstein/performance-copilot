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

/**
 * Divisão segura para métricas opcionais: retorna `null` (não `0`) quando o
 * dado de origem não existe ou o denominador é inválido — para nunca exibir
 * "0" quando na verdade é "a métrica não existe nesta análise".
 */
export function safeDivideNullable(
  numerator: number,
  denominator: number | null,
  multiplier = 1
): number | null {
  if (denominator === null || !denominator || !Number.isFinite(denominator)) return null;
  const result = (numerator / denominator) * multiplier;
  return Number.isFinite(result) ? result : null;
}

/** Frequência = impressões / alcance. `null` quando o alcance não é conhecido. */
export function calculateFrequency(impressions: number, reach: number | null): number | null {
  return safeDivideNullable(impressions, reach);
}

/** Custo por resultado genérico (conversa, lead, compra...). `null` quando a contagem não é conhecida. */
export function calculateCostPerResult(spend: number, count: number | null): number | null {
  return safeDivideNullable(spend, count);
}

/** Soma valores opcionais: `null` só quando NENHUMA linha tem o dado (métrica ausente na fonte). */
export function sumNullable(values: Array<number | null>): number | null {
  if (values.every((value) => value === null)) return null;
  return values.reduce((acc: number, value) => acc + (value ?? 0), 0);
}

/** Recalcula CTR, CPC, CPM, CPA e ROAS de uma linha a partir dos valores brutos. */
export function computeCampaignMetrics(row: NormalizedCampaignRow): CampaignMetrics {
  const reach = row.reach ?? null;
  const linkClicks = row.linkClicks ?? null;
  const landingPageViews = row.landingPageViews ?? null;
  const conversationsStarted = row.conversationsStarted ?? null;
  const leads = row.leads ?? null;
  const purchases = row.purchases ?? null;
  const registrations = row.registrations ?? null;
  const checkouts = row.checkouts ?? null;
  const addToCart = row.addToCart ?? null;
  const contacts = row.contacts ?? null;

  return {
    ...row,
    ctr: calculateCtr(row.clicks, row.impressions),
    cpc: calculateCpc(row.spend, row.clicks),
    cpm: calculateCpm(row.spend, row.impressions),
    cpa: calculateCpa(row.spend, row.conversions),
    roas: calculateRoas(row.revenue, row.spend),

    reach,
    linkClicks,
    landingPageViews,
    conversationsStarted,
    leads,
    purchases,
    registrations,
    checkouts,
    addToCart,
    contacts,
    status: row.status ?? null,
    adId: row.adId ?? null,
    creativeId: row.creativeId ?? null,
    thumbnailUrl: row.thumbnailUrl ?? null,
    creativeType: row.creativeType ?? null,

    frequency: calculateFrequency(row.impressions, reach),
    costPerConversation: calculateCostPerResult(row.spend, conversationsStarted),
    costPerLead: calculateCostPerResult(row.spend, leads),
    costPerPurchase: calculateCostPerResult(row.spend, purchases),
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

  const reach = sumNullable(rows.map((r) => r.reach ?? null));
  const linkClicks = sumNullable(rows.map((r) => r.linkClicks ?? null));
  const landingPageViews = sumNullable(rows.map((r) => r.landingPageViews ?? null));
  const conversationsStarted = sumNullable(rows.map((r) => r.conversationsStarted ?? null));
  const leads = sumNullable(rows.map((r) => r.leads ?? null));
  const purchases = sumNullable(rows.map((r) => r.purchases ?? null));
  const registrations = sumNullable(rows.map((r) => r.registrations ?? null));
  const checkouts = sumNullable(rows.map((r) => r.checkouts ?? null));
  const addToCart = sumNullable(rows.map((r) => r.addToCart ?? null));
  const contacts = sumNullable(rows.map((r) => r.contacts ?? null));

  return {
    ...base,
    ctr: calculateCtr(base.clicks, base.impressions),
    cpc: calculateCpc(base.spend, base.clicks),
    cpm: calculateCpm(base.spend, base.impressions),
    cpa: calculateCpa(base.spend, base.conversions),
    roas: calculateRoas(base.revenue, base.spend),

    reach,
    frequency: calculateFrequency(base.impressions, reach),
    linkClicks,
    landingPageViews,
    conversationsStarted,
    costPerConversation: calculateCostPerResult(base.spend, conversationsStarted),
    leads,
    costPerLead: calculateCostPerResult(base.spend, leads),
    purchases,
    costPerPurchase: calculateCostPerResult(base.spend, purchases),
    registrations,
    checkouts,
    addToCart,
    contacts,
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

// ----------------------------------------------------------------------------
// Formatação "nula-segura" para as métricas estendidas: quando o dado não
// existe na fonte (CSV sem a coluna, API sem o campo), mostramos "—", nunca
// "0" — 0 significa "existe e é zero", que é uma informação diferente.
// ----------------------------------------------------------------------------

export function formatNumberOrDash(value: number | null): string {
  return value === null ? "—" : formatNumber(value);
}

export function formatBRLOrDash(value: number | null): string {
  return value === null ? "—" : formatBRL(value);
}

export function formatFrequency(value: number | null): string {
  if (value === null || !Number.isFinite(value)) return "—";
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
}
