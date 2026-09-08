import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { generateAiAnalysis } from "@/lib/ai/ai-service";
import type { NormalizedCampaignRow } from "@/types/domain";

const rows: NormalizedCampaignRow[] = [
  {
    campaignName: "Campanha A",
    adsetName: null,
    adName: null,
    spend: 1000,
    impressions: 50000,
    clicks: 1000,
    conversions: 50,
    revenue: 4000,
  },
  {
    campaignName: "Campanha sem conversão",
    adsetName: null,
    adName: null,
    spend: 300,
    impressions: 20000,
    clicks: 200,
    conversions: 0,
    revenue: 0,
  },
];

describe("generateAiAnalysis (sem OPENAI_API_KEY)", () => {
  const originalKey = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  afterEach(() => {
    if (originalKey) process.env.OPENAI_API_KEY = originalKey;
  });

  it("usa o fallback baseado em regras e nunca lança erro", async () => {
    const { aiResult, engineResult } = await generateAiAnalysis({
      clientName: "Cliente Teste",
      platform: "meta_ads",
      startDate: "2026-01-01",
      endDate: "2026-01-31",
      primaryResultType: "other",
      rows,
    });

    expect(aiResult.source).toBe("rules");
    expect(aiResult.executiveSummary).toContain("Cliente Teste");
    expect(aiResult.diagnosis.length).toBeGreaterThan(0);
    expect(engineResult.totals.spend).toBe(1300);
    expect(aiResult.alerts.some((a) => a.title === "Campanha sem conversões")).toBe(true);
  });

  it("nunca escreve linguagem de comando direto (pause/escale) no fallback", async () => {
    const { aiResult } = await generateAiAnalysis({
      clientName: "Cliente Teste",
      platform: "meta_ads",
      startDate: "2026-01-01",
      endDate: "2026-01-31",
      primaryResultType: "other",
      rows,
    });

    const fullText = [
      aiResult.diagnosis,
      aiResult.executiveSummary,
      ...aiResult.recommendations.map((r) => r.description),
    ]
      .join(" ")
      .toLowerCase();

    expect(fullText).not.toContain("pause imediatamente");
    expect(fullText).not.toContain("escale imediatamente");
  });
});
