// ============================================================================
// primary-result.ts
// Centraliza o mapeamento entre "resultado principal" (o que o gestor está
// otimizando: conversas, leads, compras, cadastros, LPV ou outro) e qual
// métrica/rótulo mostrar em cada lugar da UI (Visão Geral, tabelas, gráficos,
// select de Nova Análise).
// ============================================================================

import { calculateCostPerResult } from "@/lib/analysis/metrics";
import type { CampaignMetrics, MetricsTotals, PrimaryResultType } from "@/types/domain";

export const PRIMARY_RESULT_OPTIONS: Array<{ value: PrimaryResultType; label: string }> = [
  { value: "conversations", label: "Conversas iniciadas" },
  { value: "leads", label: "Leads" },
  { value: "purchases", label: "Compras" },
  { value: "registrations", label: "Cadastros" },
  { value: "landing_page_views", label: "Visualizações de página" },
  { value: "other", label: "Outro" },
];

export const PRIMARY_RESULT_LABELS: Record<PrimaryResultType, string> = {
  conversations: "Conversas iniciadas",
  leads: "Leads",
  purchases: "Compras",
  registrations: "Cadastros",
  landing_page_views: "Visualizações de página",
  other: "Resultado",
};

export const PRIMARY_RESULT_COST_LABELS: Record<PrimaryResultType, string> = {
  conversations: "Custo por conversa",
  leads: "Custo por lead",
  purchases: "Custo por compra",
  registrations: "Custo por cadastro",
  landing_page_views: "Custo por visualização",
  other: "Custo por resultado",
};

/** Forma singular/plural, usada em frases do resumo para o cliente. */
export const PRIMARY_RESULT_NOUN: Record<PrimaryResultType, { singular: string; plural: string }> = {
  conversations: { singular: "conversa", plural: "conversas" },
  leads: { singular: "lead", plural: "leads" },
  purchases: { singular: "compra", plural: "compras" },
  registrations: { singular: "cadastro", plural: "cadastros" },
  landing_page_views: { singular: "visualização de página", plural: "visualizações de página" },
  other: { singular: "resultado", plural: "resultados" },
};

type ResultBearing = Pick<
  CampaignMetrics | MetricsTotals,
  "spend" | "conversions" | "cpa" | "conversationsStarted" | "leads" | "purchases" | "registrations" | "landingPageViews"
>;

/** Contagem do resultado principal escolhido, ou `null` se a métrica não existir na análise. */
export function getPrimaryResultCount(metrics: ResultBearing, primaryResultType: PrimaryResultType): number | null {
  switch (primaryResultType) {
    case "conversations":
      return metrics.conversationsStarted;
    case "leads":
      return metrics.leads;
    case "purchases":
      return metrics.purchases;
    case "registrations":
      return metrics.registrations;
    case "landing_page_views":
      return metrics.landingPageViews;
    case "other":
    default:
      return metrics.conversions > 0 ? metrics.conversions : null;
  }
}

/** Custo por resultado principal, ou `null` se a contagem não existir/for zero. */
export function getPrimaryResultCost(metrics: ResultBearing, primaryResultType: PrimaryResultType): number | null {
  if (primaryResultType === "other") {
    return metrics.conversions > 0 ? metrics.cpa : null;
  }
  return calculateCostPerResult(metrics.spend, getPrimaryResultCount(metrics, primaryResultType));
}
