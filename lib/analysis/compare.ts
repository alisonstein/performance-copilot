// ============================================================================
// compare.ts
// Compara os totais de duas análises (mesmo cliente/plataforma) e calcula a
// variação percentual das métricas principais. Compara apenas totais — não é
// necessário casar linha a linha entre os dois períodos.
// ============================================================================

import type { MetricsTotals } from "@/types/domain";

export function percentChange(current: number, previous: number): number | null {
  if (!previous || !Number.isFinite(previous)) return null;
  const change = ((current - previous) / previous) * 100;
  return Number.isFinite(change) ? change : null;
}

export interface TotalsComparison {
  spendChangePct: number | null;
  conversionsChangePct: number | null;
  cpaChangePct: number | null;
  ctrChangePct: number | null;
}

export function compareTotals(current: MetricsTotals, previous: MetricsTotals): TotalsComparison {
  return {
    spendChangePct: percentChange(current.spend, previous.spend),
    conversionsChangePct: percentChange(current.conversions, previous.conversions),
    cpaChangePct: percentChange(current.cpa, previous.cpa),
    ctrChangePct: percentChange(current.ctr, previous.ctr),
  };
}
