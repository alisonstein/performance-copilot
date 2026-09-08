// ============================================================================
// Tipos de domínio: formato normalizado de campanha, métricas calculadas e
// resultado do diagnóstico (regras determinísticas e/ou IA).
// ============================================================================

import type { Platform } from "@/types/database";

/**
 * Qual resultado o gestor está otimizando nesta análise. Define o KPI de
 * destaque na aba Visão Geral e o enquadramento usado pela IA. Sempre
 * opcional/derivável: análises antigas (antes deste campo existir) caem em
 * "other" e continuam funcionando normalmente.
 */
export type PrimaryResultType =
  | "conversations"
  | "leads"
  | "purchases"
  | "registrations"
  | "landing_page_views"
  | "other";

export type CreativeType = "image" | "video" | "carousel" | "unknown";

export type CampaignStatus = "active" | "paused" | "other";

export interface NormalizedCampaignRow {
  campaignName: string;
  adsetName: string | null;
  adName: string | null;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;

  // ------------------------------------------------------------------------
  // Métricas estendidas (Meta Ads). Todas opcionais NA CHAVE (`?:`) e no
  // valor (`| null`): compatível com qualquer NormalizedCampaignRow criado
  // antes destes campos existirem (não quebra a análise nem os testes
  // antigos). Sempre que um campo estiver ausente, trate-o como `null` —
  // nunca 0 por ausência de dado.
  // ------------------------------------------------------------------------
  reach?: number | null;
  linkClicks?: number | null;
  landingPageViews?: number | null;
  conversationsStarted?: number | null;
  leads?: number | null;
  purchases?: number | null;
  registrations?: number | null;
  checkouts?: number | null;
  addToCart?: number | null;
  contacts?: number | null;

  // Metadados de status e criativo — também opcionais.
  status?: CampaignStatus | null;
  adId?: string | null;
  creativeId?: string | null;
  thumbnailUrl?: string | null;
  creativeType?: CreativeType | null;
}

export interface CampaignMetrics extends NormalizedCampaignRow {
  ctr: number;
  cpc: number;
  cpm: number;
  cpa: number;
  roas: number;

  // computeCampaignMetrics() sempre normaliza estes campos (undefined -> null),
  // então em CampaignMetrics (diferente de NormalizedCampaignRow) eles deixam
  // de ser opcionais na chave — sempre presentes, apenas com valor nulo quando
  // a métrica não existir.
  reach: number | null;
  linkClicks: number | null;
  landingPageViews: number | null;
  conversationsStarted: number | null;
  leads: number | null;
  purchases: number | null;
  registrations: number | null;
  checkouts: number | null;
  addToCart: number | null;
  contacts: number | null;
  status: CampaignStatus | null;
  adId: string | null;
  creativeId: string | null;
  thumbnailUrl: string | null;
  creativeType: CreativeType | null;

  /** impressions / reach, apenas quando reach está disponível. */
  frequency: number | null;
  costPerConversation: number | null;
  costPerLead: number | null;
  costPerPurchase: number | null;
}

export interface MetricsTotals {
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  cpm: number;
  conversions: number;
  cpa: number;
  revenue: number;
  roas: number;

  reach: number | null;
  frequency: number | null;
  linkClicks: number | null;
  landingPageViews: number | null;
  conversationsStarted: number | null;
  costPerConversation: number | null;
  leads: number | null;
  costPerLead: number | null;
  purchases: number | null;
  costPerPurchase: number | null;
  registrations: number | null;
  checkouts: number | null;
  addToCart: number | null;
  contacts: number | null;
}

export type Severity = "low" | "medium" | "high";

export interface AlertItem {
  title: string;
  description: string;
  severity: Severity;
}

export interface OpportunityItem {
  title: string;
  description: string;
}

export interface RecommendationItem {
  title: string;
  description: string;
  priority: Severity;
}

export interface AnalysisEngineResult {
  totals: MetricsTotals;
  campaigns: CampaignMetrics[];
  bestCampaigns: CampaignMetrics[];
  attentionCampaigns: CampaignMetrics[];
  alerts: AlertItem[];
  opportunities: OpportunityItem[];
}

export interface AiAnalysisContent {
  diagnosis: string;
  alerts: AlertItem[];
  opportunities: OpportunityItem[];
  recommendations: RecommendationItem[];
  executiveSummary: string;
}

export interface AiAnalysisResult extends AiAnalysisContent {
  source: "ai" | "rules";
}

export interface AnalysisFormInput {
  clientId: string;
  platform: Platform;
  startDate: string;
  endDate: string;
  primaryResultType: PrimaryResultType;
}

export interface PeriodComparison {
  spendChangePct: number | null;
  conversionsChangePct: number | null;
  cpaChangePct: number | null;
  ctrChangePct: number | null;
  previousAnalysisId: string;
  previousStartDate: string;
  previousEndDate: string;
}

// ============================================================================
// Agregação (abas Campanhas/Conjuntos) e ranking de criativos (aba Criativos)
// ============================================================================

/** Métricas agregadas por campanha ou por conjunto (soma + métricas recalculadas). */
export type GroupedMetrics = MetricsTotals & {
  key: string;
  campaignName: string;
  adsetName: string | null;
  status: CampaignStatus | null;
  itemCount: number;
};

export type CreativeBadge =
  | "best_creative"
  | "high_ctr"
  | "high_cpa"
  | "no_conversion";

export interface CreativeRankingResult {
  byLowestCostPerResult: CampaignMetrics[];
  byHighestVolume: CampaignMetrics[];
  byHighestCtr: CampaignMetrics[];
  byHighestSpend: CampaignMetrics[];
  needsAttention: CampaignMetrics[];
}

// ============================================================================
// Meta Ads — parsing do campo `actions` retornado pela Graph API de Insights
// ============================================================================

export interface MetaAction {
  action_type: string;
  value: string | number;
}

export interface ParsedMetaActions {
  conversationsStarted: number;
  leads: number;
  purchases: number;
  registrations: number;
  checkouts: number;
  addToCart: number;
  contacts: number;
  landingPageViews: number;
  purchaseValue: number;
}
