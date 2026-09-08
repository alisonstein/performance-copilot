import { describe, expect, it } from "vitest";
import { computeCampaignMetrics } from "@/lib/analysis/metrics";
import { rankCreatives } from "@/lib/analysis/creative-ranking";
import type { NormalizedCampaignRow } from "@/types/domain";

function row(overrides: Partial<NormalizedCampaignRow>): NormalizedCampaignRow {
  return {
    campaignName: "Campanha",
    adsetName: "Conjunto",
    adName: "Anúncio",
    spend: 100,
    impressions: 10000,
    clicks: 200,
    conversions: 5,
    revenue: 300,
    ...overrides,
  };
}

const creatives = [
  computeCampaignMetrics(row({ adName: "Video 03", spend: 300, clicks: 900, impressions: 15000, conversationsStarted: 60 })), // custo baixo, CTR alto
  computeCampaignMetrics(row({ adName: "Static 02", spend: 418, clicks: 150, impressions: 20000, conversationsStarted: 0 })), // gasto sem conversa
  computeCampaignMetrics(row({ adName: "Static 07", spend: 500, clicks: 200, impressions: 40000, conversationsStarted: 10 })), // CPA alto
  computeCampaignMetrics(row({ adName: "UGC 01", spend: 200, clicks: 400, impressions: 12000, conversationsStarted: 30 })),
];

describe("rankCreatives", () => {
  it("ordena por menor custo por resultado (respeitando o resultado principal)", () => {
    const ranking = rankCreatives(creatives, "conversations", 10);
    expect(ranking.byLowestCostPerResult[0].adName).toBe("Video 03");
  });

  it("ordena por maior volume de resultados", () => {
    const ranking = rankCreatives(creatives, "conversations", 10);
    expect(ranking.byHighestVolume[0].adName).toBe("Video 03");
  });

  it("ordena por maior CTR", () => {
    const ranking = rankCreatives(creatives, "conversations", 10);
    expect(ranking.byHighestCtr[0].adName).toBe("Video 03");
  });

  it("ordena por maior investimento", () => {
    const ranking = rankCreatives(creatives, "conversations", 10);
    expect(ranking.byHighestSpend[0].adName).toBe("Static 07");
  });

  it("identifica criativos que merecem atenção: gasto sem conversão", () => {
    const ranking = rankCreatives(creatives, "conversations", 10);
    expect(ranking.needsAttention.some((c) => c.adName === "Static 02")).toBe(true);
  });

  it("identifica criativos com custo por resultado acima da média da conta", () => {
    const ranking = rankCreatives(creatives, "conversations", 5); // média baixa força o alerta
    expect(ranking.needsAttention.some((c) => c.adName === "Static 07")).toBe(true);
  });

  it("nunca lança erro com lista vazia", () => {
    expect(() => rankCreatives([], "conversations", 0)).not.toThrow();
    const ranking = rankCreatives([], "conversations", 0);
    expect(ranking.byLowestCostPerResult).toHaveLength(0);
    expect(ranking.needsAttention).toHaveLength(0);
  });
});
