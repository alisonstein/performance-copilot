// ============================================================================
// Interface abstrata de provedor de IA. Permite trocar a OpenAI por outro
// provedor no futuro (Anthropic, Gemini, etc.) sem alterar o resto do
// sistema — basta implementar esta interface e trocar a instância criada em
// lib/ai/ai-service.ts.
// ============================================================================

import type { Platform } from "@/types/database";
import type { AlertItem, MetricsTotals, OpportunityItem, PrimaryResultType } from "@/types/domain";
import type { AiAnalysisContentParsed } from "@/lib/ai/types";

export interface AiCampaignSummary {
  campaignName: string;
  adName: string | null;
  spend: number;
  ctr: number;
  cpa: number;
  roas: number;
  conversions: number;
  frequency: number | null;
  primaryResultCount: number | null;
  primaryResultCost: number | null;
}

export interface AiAnalysisRequest {
  clientName: string;
  platform: Platform;
  startDate: string;
  endDate: string;
  primaryResultType: PrimaryResultType;
  totals: MetricsTotals;
  campaignSummaries: AiCampaignSummary[];
  ruleBasedAlerts: AlertItem[];
  ruleBasedOpportunities: OpportunityItem[];
}

export interface AiProvider {
  generateAnalysis(request: AiAnalysisRequest): Promise<AiAnalysisContentParsed>;
}
