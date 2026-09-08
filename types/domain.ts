// ============================================================================
// Tipos de domínio: formato normalizado de campanha, métricas calculadas e
// resultado do diagnóstico (regras determinísticas e/ou IA).
// ============================================================================

import type { Platform } from "@/types/database";

export interface NormalizedCampaignRow {
  campaignName: string;
  adsetName: string | null;
  adName: string | null;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
}

export interface CampaignMetrics extends NormalizedCampaignRow {
  ctr: number;
  cpc: number;
  cpm: number;
  cpa: number;
  roas: number;
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
