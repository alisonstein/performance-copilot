import type { Metadata } from "next";
import { AnalysisResultView } from "@/components/dashboard/AnalysisResultView";
import { requireUser } from "@/lib/supabase/auth";
import {
  DEMO_CLIENT_NAME,
  DEMO_END_DATE,
  DEMO_FILE_NAME,
  DEMO_PLATFORM,
  DEMO_PRIMARY_RESULT_TYPE,
  DEMO_START_DATE,
  getDemoAiResult,
  getDemoEngineResult,
} from "@/lib/demo/demo-data";

export const metadata: Metadata = {
  title: "Demonstração",
};

export default async function DemoAnalysisPage() {
  // Ainda exige login: a demonstração roda dentro da área autenticada para
  // já apresentar o produto no contexto real (sidebar, navegação, etc.).
  await requireUser();

  const engineResult = getDemoEngineResult();
  const aiResult = getDemoAiResult();

  return (
    <AnalysisResultView
      clientName={DEMO_CLIENT_NAME}
      platform={DEMO_PLATFORM}
      startDate={DEMO_START_DATE}
      endDate={DEMO_END_DATE}
      fileName={DEMO_FILE_NAME}
      primaryResultType={DEMO_PRIMARY_RESULT_TYPE}
      totals={engineResult.totals}
      campaigns={engineResult.campaigns}
      aiResult={aiResult}
      isDemo
    />
  );
}
