// ============================================================================
// compare.ts
// Compara os totais de duas análises (mesmo cliente/plataforma) e calcula a
// variação percentual das métricas principais. Compara apenas totais — não é
// necessário casar linha a linha entre os dois períodos.
// ============================================================================

import { formatBRL, formatChangePct } from "@/lib/analysis/metrics";
import type { AlertItem, MetricsTotals } from "@/types/domain";

export function percentChange(current: number, previous: number): number | null {
  if (!previous || !Number.isFinite(previous)) return null;
  const change = ((current - previous) / previous) * 100;
  return Number.isFinite(change) ? change : null;
}

/** Igual a percentChange, mas tolerante a métricas que podem não existir em um dos períodos. */
export function percentChangeNullable(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null) return null;
  return percentChange(current, previous);
}

export interface TotalsComparison {
  spendChangePct: number | null;
  conversionsChangePct: number | null;
  cpaChangePct: number | null;
  ctrChangePct: number | null;
  cpcChangePct: number | null;
  cpmChangePct: number | null;
  frequencyChangePct: number | null;
}

export function compareTotals(current: MetricsTotals, previous: MetricsTotals): TotalsComparison {
  return {
    spendChangePct: percentChange(current.spend, previous.spend),
    conversionsChangePct: percentChange(current.conversions, previous.conversions),
    cpaChangePct: percentChange(current.cpa, previous.cpa),
    ctrChangePct: percentChange(current.ctr, previous.ctr),
    cpcChangePct: percentChange(current.cpc, previous.cpc),
    cpmChangePct: percentChange(current.cpm, previous.cpm),
    frequencyChangePct: percentChangeNullable(current.frequency, previous.frequency),
  };
}

const EFFICIENCY_DROP_CPA_THRESHOLD = 20; // % de alta no CPA vs período anterior

/**
 * Gera um alerta de "queda de eficiência" quando o CPA subiu de forma
 * relevante em relação ao período anterior, sem crescimento proporcional de
 * conversões. Retorna `null` quando não há sinal relevante — nunca lança.
 */
export function detectEfficiencyDrop(
  comparison: TotalsComparison,
  currentTotals: MetricsTotals,
  previousPeriodLabel: string
): AlertItem | null {
  const { cpaChangePct, conversionsChangePct } = comparison;

  if (cpaChangePct === null || cpaChangePct < EFFICIENCY_DROP_CPA_THRESHOLD) return null;

  const conversionsGrew = conversionsChangePct !== null && conversionsChangePct > 0;
  if (conversionsGrew && conversionsChangePct >= cpaChangePct) {
    // Conversões cresceram na mesma proporção (ou mais) que o CPA — não é
    // uma queda de eficiência, é crescimento de escala.
    return null;
  }

  return {
    title: "Queda de eficiência",
    severity: "medium",
    description: `O CPA subiu ${formatChangePct(cpaChangePct)} em relação a ${previousPeriodLabel} (agora ${formatBRL(
      currentTotals.cpa
    )}), sem um crescimento equivalente de conversões. Vale investigar o que mudou desde o período anterior.`,
  };
}
