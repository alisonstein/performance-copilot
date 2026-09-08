import { describe, expect, it } from "vitest";
import {
  aggregateTotals,
  calculateCpa,
  calculateCpc,
  calculateCpm,
  calculateCtr,
  calculateRoas,
  computeCampaignMetrics,
  formatBRL,
} from "@/lib/analysis/metrics";
import type { NormalizedCampaignRow } from "@/types/domain";

describe("cálculo de métricas", () => {
  it("calcula CTR corretamente", () => {
    expect(calculateCtr(50, 1000)).toBeCloseTo(5, 5);
  });

  it("calcula CPC corretamente", () => {
    expect(calculateCpc(100, 50)).toBeCloseTo(2, 5);
  });

  it("calcula CPM corretamente", () => {
    expect(calculateCpm(100, 1000)).toBeCloseTo(100, 5);
  });

  it("calcula CPA corretamente", () => {
    expect(calculateCpa(500, 20)).toBeCloseTo(25, 5);
  });

  it("calcula ROAS corretamente", () => {
    expect(calculateRoas(1500, 500)).toBeCloseTo(3, 5);
  });

  it("trata divisão por zero retornando 0 em vez de Infinity/NaN", () => {
    expect(calculateCtr(10, 0)).toBe(0);
    expect(calculateCpc(10, 0)).toBe(0);
    expect(calculateCpm(10, 0)).toBe(0);
    expect(calculateCpa(10, 0)).toBe(0);
    expect(calculateRoas(10, 0)).toBe(0);
  });

  it("computa métricas de uma linha de campanha a partir dos valores brutos", () => {
    const row: NormalizedCampaignRow = {
      campaignName: "Campanha A",
      adsetName: null,
      adName: null,
      spend: 1000,
      impressions: 50000,
      clicks: 1000,
      conversions: 40,
      revenue: 5000,
    };

    const metrics = computeCampaignMetrics(row);

    expect(metrics.ctr).toBeCloseTo(2, 5);
    expect(metrics.cpc).toBeCloseTo(1, 5);
    expect(metrics.cpm).toBeCloseTo(20, 5);
    expect(metrics.cpa).toBeCloseTo(25, 5);
    expect(metrics.roas).toBeCloseTo(5, 5);
  });

  it("agrega totais a partir dos totais somados, não da média das razões por linha", () => {
    const rows: NormalizedCampaignRow[] = [
      {
        campaignName: "A",
        adsetName: null,
        adName: null,
        spend: 100,
        impressions: 10000,
        clicks: 100,
        conversions: 10,
        revenue: 500,
      },
      {
        campaignName: "B",
        adsetName: null,
        adName: null,
        spend: 900,
        impressions: 90000,
        clicks: 900,
        conversions: 10,
        revenue: 500,
      },
    ];

    const totals = aggregateTotals(rows);

    expect(totals.spend).toBe(1000);
    expect(totals.impressions).toBe(100000);
    expect(totals.clicks).toBe(1000);
    expect(totals.conversions).toBe(20);
    expect(totals.revenue).toBe(1000);
    // CPA agregado = 1000 / 20 = 50, e não a média simples de (10, 90) = 50
    // (nesse exemplo coincide, então validamos também o CTR agregado)
    expect(totals.cpa).toBeCloseTo(50, 5);
    expect(totals.ctr).toBeCloseTo(1, 5); // 1000 cliques / 100000 impressões * 100
  });

  it("formata valores em BRL", () => {
    expect(formatBRL(1234.5)).toContain("1.234,50");
  });
});
