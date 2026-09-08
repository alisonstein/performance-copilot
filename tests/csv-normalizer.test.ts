import { describe, expect, it } from "vitest";
import { normalizeCsvRows, parseLocaleNumber } from "@/lib/csv/csv-normalizer";

describe("parseLocaleNumber", () => {
  it("interpreta números no formato pt-BR (vírgula decimal)", () => {
    expect(parseLocaleNumber("1.234,56")).toBeCloseTo(1234.56, 2);
  });

  it("interpreta números no formato en-US (ponto decimal)", () => {
    expect(parseLocaleNumber("1,234.56")).toBeCloseTo(1234.56, 2);
  });

  it("remove símbolo de moeda e espaços", () => {
    expect(parseLocaleNumber("R$ 8.430,10")).toBeCloseTo(8430.1, 2);
  });

  it("interpreta percentuais", () => {
    expect(parseLocaleNumber("3,8%")).toBeCloseTo(3.8, 2);
  });

  it("retorna 0 para valores vazios ou inválidos", () => {
    expect(parseLocaleNumber("")).toBe(0);
    expect(parseLocaleNumber(undefined)).toBe(0);
    expect(parseLocaleNumber("-")).toBe(0);
  });

  it("aceita números já parseados", () => {
    expect(parseLocaleNumber(42)).toBe(42);
  });
});

describe("normalizeCsvRows", () => {
  it("normaliza um export do Meta Ads em inglês", () => {
    const result = normalizeCsvRows([
      {
        "Campaign name": "Campanha Black Friday",
        "Ad set name": "Interesses",
        "Ad name": "UGC 03",
        "Amount spent": "1.234,56",
        Impressions: "50000",
        "Link clicks": "1200",
        Results: "40",
        "Purchase conversion value": "6.500,00",
      },
    ]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]).toMatchObject({
      campaignName: "Campanha Black Friday",
      adsetName: "Interesses",
      adName: "UGC 03",
      spend: 1234.56,
      impressions: 50000,
      clicks: 1200,
      conversions: 40,
      revenue: 6500,
    });
  });

  it("normaliza um export em português", () => {
    const result = normalizeCsvRows([
      {
        "Nome da campanha": "Campanha Institucional",
        "Valor gasto": "500,00",
        Impressões: "20000",
        Cliques: "300",
        Resultados: "10",
      },
    ]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.rows[0].campaignName).toBe("Campanha Institucional");
    expect(result.rows[0].spend).toBe(500);
  });

  it("normaliza um export do Google Ads", () => {
    const result = normalizeCsvRows([
      {
        Campaign: "Pesquisa - Marca",
        Cost: "800.00",
        Impressions: "15000",
        Clicks: "450",
        Conversions: "25",
        "Conv. value": "4000.00",
      },
    ]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.rows[0].campaignName).toBe("Pesquisa - Marca");
    expect(result.rows[0].conversions).toBe(25);
  });

  it("retorna erro amigável quando faltam colunas essenciais", () => {
    const result = normalizeCsvRows([{ Coluna1: "abc", Coluna2: "def" }]);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.message).toContain("colunas necessárias");
  });

  it("retorna erro amigável para arquivo vazio", () => {
    const result = normalizeCsvRows([]);
    expect(result.ok).toBe(false);
  });

  it("ignora linhas sem nome de campanha e avisa", () => {
    const result = normalizeCsvRows([
      { "Campaign name": "Campanha 1", "Amount spent": "100" },
      { "Campaign name": "", "Amount spent": "50" },
    ]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.rows).toHaveLength(1);
    expect(result.skippedRows).toBe(1);
    expect(result.warnings.some((w) => w.includes("ignoradas"))).toBe(true);
  });

  it("reconhece alcance, conversas iniciadas, leads, compras e LPV quando presentes", () => {
    const result = normalizeCsvRows([
      {
        "Campaign name": "Campanha WhatsApp",
        "Amount spent": "500",
        Reach: "20000",
        Impressions: "40000",
        "Messaging conversations started": "35",
        Leads: "8",
        Purchases: "3",
        "Landing page views": "1200",
      },
    ]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const row = result.rows[0];
    expect(row.reach).toBe(20000);
    expect(row.conversationsStarted).toBe(35);
    expect(row.leads).toBe(8);
    expect(row.purchases).toBe(3);
    expect(row.landingPageViews).toBe(1200);
  });

  it("usa null (não 0) para métricas estendidas quando a coluna não existe", () => {
    const result = normalizeCsvRows([{ "Campaign name": "Campanha simples", "Amount spent": "100" }]);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.rows[0].reach).toBeNull();
    expect(result.rows[0].conversationsStarted).toBeNull();
    expect(result.rows[0].leads).toBeNull();
  });

  it("reconhece colunas de criativo (Ad ID, Creative ID, Thumbnail URL) e status", () => {
    const result = normalizeCsvRows([
      {
        "Campaign name": "Campanha",
        "Ad name": "Video 03",
        "Amount spent": "100",
        "Ad ID": "123456",
        "Creative ID": "987654",
        "Thumbnail URL": "https://example.com/thumb.jpg",
        "Ad set delivery": "active",
      },
    ]);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const row = result.rows[0];
    expect(row.adId).toBe("123456");
    expect(row.creativeId).toBe("987654");
    expect(row.thumbnailUrl).toBe("https://example.com/thumb.jpg");
    expect(row.status).toBe("active");
  });
});
