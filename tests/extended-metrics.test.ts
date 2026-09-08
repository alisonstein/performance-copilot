import { describe, expect, it } from "vitest";
import { aggregateTotals, computeCampaignMetrics } from "@/lib/analysis/metrics";
import type { NormalizedCampaignRow } from "@/types/domain";

function baseRow(overrides: Partial<NormalizedCampaignRow> = {}): NormalizedCampaignRow {
  return {
    campaignName: "Campanha",
    adsetName: null,
    adName: null,
    spend: 100,
    impressions: 10000,
    clicks: 200,
    conversions: 5,
    revenue: 300,
    ...overrides,
  };
}

describe("métricas estendidas — ausência de dado nunca vira 0", () => {
  it("reach/frequência ficam null quando a coluna de alcance não existe", () => {
    const metrics = computeCampaignMetrics(baseRow());
    expect(metrics.reach).toBeNull();
    expect(metrics.frequency).toBeNull();
  });

  it("calcula frequência = impressões / alcance quando o alcance existe", () => {
    const metrics = computeCampaignMetrics(baseRow({ reach: 5000 }));
    expect(metrics.frequency).toBeCloseTo(2, 5); // 10000 / 5000
  });

  it("calcula custo por conversa iniciada", () => {
    const metrics = computeCampaignMetrics(baseRow({ spend: 500, conversationsStarted: 25 }));
    expect(metrics.costPerConversation).toBeCloseTo(20, 5);
  });

  it("calcula custo por lead", () => {
    const metrics = computeCampaignMetrics(baseRow({ spend: 300, leads: 15 }));
    expect(metrics.costPerLead).toBeCloseTo(20, 5);
  });

  it("calcula custo por compra", () => {
    const metrics = computeCampaignMetrics(baseRow({ spend: 400, purchases: 8 }));
    expect(metrics.costPerPurchase).toBeCloseTo(50, 5);
  });

  it("custo por resultado fica null quando a contagem é null (não confunde com 0)", () => {
    const metrics = computeCampaignMetrics(baseRow());
    expect(metrics.costPerConversation).toBeNull();
    expect(metrics.costPerLead).toBeNull();
    expect(metrics.costPerPurchase).toBeNull();
  });

  it("linhas antigas (sem os novos campos) continuam funcionando normalmente", () => {
    const legacyRow = {
      campaignName: "Campanha antiga",
      adsetName: null,
      adName: null,
      spend: 100,
      impressions: 10000,
      clicks: 200,
      conversions: 5,
      revenue: 300,
    } as NormalizedCampaignRow; // sem reach/leads/etc — simula código anterior a esta feature

    expect(() => computeCampaignMetrics(legacyRow)).not.toThrow();
    const metrics = computeCampaignMetrics(legacyRow);
    expect(metrics.reach).toBeNull();
    expect(metrics.leads).toBeNull();
  });
});

describe("aggregateTotals — soma métricas estendidas", () => {
  it("soma alcance, conversas, leads e compras quando presentes em todas as linhas", () => {
    const rows: NormalizedCampaignRow[] = [
      baseRow({ reach: 1000, conversationsStarted: 10, leads: 4, purchases: 2 }),
      baseRow({ reach: 2000, conversationsStarted: 20, leads: 6, purchases: 3 }),
    ];
    const totals = aggregateTotals(rows);
    expect(totals.reach).toBe(3000);
    expect(totals.conversationsStarted).toBe(30);
    expect(totals.leads).toBe(10);
    expect(totals.purchases).toBe(5);
  });

  it("retorna null quando NENHUMA linha tem a métrica (coluna ausente na fonte)", () => {
    const rows: NormalizedCampaignRow[] = [baseRow(), baseRow()];
    const totals = aggregateTotals(rows);
    expect(totals.reach).toBeNull();
    expect(totals.leads).toBeNull();
    expect(totals.purchases).toBeNull();
    expect(totals.landingPageViews).toBeNull();
  });
});
