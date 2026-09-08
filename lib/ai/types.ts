// ============================================================================
// Schema de validação (Zod) da resposta estruturada da IA. Qualquer resposta
// que não bata com esse formato é rejeitada e o serviço cai para o fallback
// baseado em regras — a IA nunca é confiada "às cegas".
// ============================================================================

import { z } from "zod";

export const severitySchema = z.enum(["low", "medium", "high"]);

export const aiAlertSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  severity: severitySchema,
});

export const aiOpportunitySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

export const aiRecommendationSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  priority: severitySchema,
});

export const aiAnalysisContentSchema = z.object({
  diagnosis: z.string().min(1),
  alerts: z.array(aiAlertSchema).default([]),
  opportunities: z.array(aiOpportunitySchema).default([]),
  recommendations: z.array(aiRecommendationSchema).default([]),
  executiveSummary: z.string().min(1),
});

export type AiAnalysisContentParsed = z.infer<typeof aiAnalysisContentSchema>;
