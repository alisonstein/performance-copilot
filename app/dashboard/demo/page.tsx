import type { Metadata } from "next";
import { AnalysisResultView } from "@/components/dashboard/AnalysisResultView";
import { requireUser } from "@/lib/supabase/auth";
import {
  DEMO_CLIENT_NAME,
  DEMO_END_DATE,
  DEMO_FILE_NAME,
  DEMO_PLATFORM,
  DEMO_START_DATE,
  getDemoAiResult,
  getDemoEngineResult,
} from "@/lib/demo/demo-data";
import { rankCampaigns } from "@/lib/analysis/analysis-engine";

export const metadata: Metadata = {
  title: "Demonstração",
};

export default async function DemoAnalysisPage() {
  // Ainda exige login: a demonstração roda dentro da área autenticada para
  // já apresentar o produto no contexto real (sidebar, navegação, etc.).
  await requireUser();

  const engineResult = getDemoEngineResult();
  const aiResult = getDemoAiResult();
  const bestCampaigns = rankCampaigns(engineResult.campaigns, "best");
  const attentionCampaigns = rankCampaigns(engineResult.campaigns, "attention", engineResult.totals.cpa);

  return (
    <AnalysisResultView
      clientName={DEMO_CLIENT_NAME}
      platform={DEMO_PLATFORM}
      startDate={DEMO_START_DATE}
      endDate={DEMO_END_DATE}
      fileName={DEMO_FILE_NAME}
      totals={engineResult.totals}
      campaigns={engineResult.campaigns}
      bestCampaigns={bestCampaigns}
      attentionCampaigns={attentionCampaigns}
      aiResult={aiResult}
      isDemo
    />
  );
}
