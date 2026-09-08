// ============================================================================
// Limites por plano. Nenhuma cobrança é implementada neste MVP — esta é
// apenas a estrutura de dados usada para exibir limites na UI (Configurações,
// Visão Geral) e para uma futura integração com Stripe/Cakto. Os limites NÃO
// bloqueiam nada em desenvolvimento.
// ============================================================================

import type { Plan } from "@/types/database";

export interface PlanLimits {
  plan: Plan;
  label: string;
  maxClients: number;
  maxAnalysesPerMonth: number;
}

const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: { plan: "free", label: "Gratuito", maxClients: 1, maxAnalysesPerMonth: 3 },
  pro: { plan: "pro", label: "Pro", maxClients: 20, maxAnalysesPerMonth: 100 },
  agency: { plan: "agency", label: "Agência", maxClients: 50, maxAnalysesPerMonth: 500 },
};

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
}

export function getAllPlanLimits(): PlanLimits[] {
  return [PLAN_LIMITS.free, PLAN_LIMITS.pro, PLAN_LIMITS.agency];
}
