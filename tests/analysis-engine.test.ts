import { describe, expect, it } from "vitest";
import { runAnalysisEngine } from "@/lib/analysis/analysis-engine";
import type { NormalizedCampaignRow } from "@/types/domain";

const baseRows: NormalizedCampaignRow[] = [
  {
    campaignName: "Campanha eficiente",
    adsetName: null,
    adName: null,
    spend: 1000,
    impressions: 100000,
    clicks: 2000,
    conversions: 100,
    revenue: 8000,
  },
  {
    campaignName: "Campanha mediana",
    adsetName: null,
    adName: null,
    spend: 1000,
    impressions: 100000,
    clicks: 2000,
    conversions: 40,
    revenue: 3000,
  },
  {
    campaignName: "Campanha sem conversão",
    adsetName: null,
    adName: null,
    spend: 500,
    impressions: 30000,
    clicks: 300,
    conversions: 0,
    revenue: 0,
  },
];

describe("runAnalysisEngine", () => {
  it("gera alerta de campanha sem conversões quando há gasto e 0 conversões", () => {
    const result = runAnalysisEngine(baseRows);
    const alert = result.alerts.find((a) => a.title === "Campanha sem conversões");
    expect(alert).toBeDefined();
    expect(alert?.description).toContain("Campanha sem conversão");
    expect(alert?.severity).toBe("high");
  });

  it("gera oportunidade para campanha com CPA bem abaixo da média", () => {
    const result = runAnalysisEngine(baseRows);
    const opportunity = result.opportunities.find((o) => o.title === "Eficiência acima da média");
    expect(opportunity).toBeDefined();
    expect(opportunity?.description).toContain("Campanha eficiente");
  });

  it("calcula totais agregados corretamente", () => {
    const result = runAnalysisEngine(baseRows);
    expect(result.totals.spend).toBe(2500);
    expect(result.totals.conversions).toBe(140);
  });

  it("identifica CTR geral baixo quando abaixo de 1%", () => {
    const lowCtrRows: NormalizedCampaignRow[] = [
      {
        campaignName: "Campanha CTR baixo",
        adsetName: null,
        adName: null,
        spend: 300,
        impressions: 100000,
        clicks: 200, // CTR = 0.2%
        conversions: 5,
        revenue: 400,
      },
    ];
    const result = runAnalysisEngine(lowCtrRows);
    expect(result.alerts.some((a) => a.title === "CTR geral baixo")).toBe(true);
  });

  it("ordena melhores campanhas por menor CPA entre as que converteram", () => {
    const result = runAnalysisEngine(baseRows);
    expect(result.bestCampaigns[0].campaignName).toBe("Campanha eficiente");
  });

  it("lista campanhas de atenção incluindo as sem conversão", () => {
    const result = runAnalysisEngine(baseRows);
    expect(result.attentionCampaigns.some((c) => c.campaignName === "Campanha sem conversão")).toBe(true);
  });

  it("não gera alertas de CPA quando não há variação relevante entre campanhas", () => {
    const uniformRows: NormalizedCampaignRow[] = [
      {
        campaignName: "A",
        adsetName: null,
        adName: null,
        spend: 100,
        impressions: 20000,
        clicks: 500,
        conversions: 10,
        revenue: 300,
      },
      {
        campaignName: "B",
        adsetName: null,
        adName: null,
        spend: 100,
        impressions: 20000,
        clicks: 500,
        conversions: 10,
        revenue: 300,
      },
    ];
    const result = runAnalysisEngine(uniformRows);
    expect(result.alerts.some((a) => a.title === "CPA acima da média")).toBe(false);
  });
});
