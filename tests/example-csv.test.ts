import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import Papa from "papaparse";
import { describe, expect, it } from "vitest";
import { normalizeCsvRows } from "@/lib/csv/csv-normalizer";
import { runAnalysisEngine } from "@/lib/analysis/analysis-engine";

// Garante que o pipeline completo (parse -> normalização -> motor de regras)
// funciona de ponta a ponta com o CSV de exemplo distribuído em
// public/examples, o mesmo arquivo que o usuário baixa para testar o produto.
describe("pipeline completo com o CSV de exemplo", () => {
  const csvPath = resolve(__dirname, "../public/examples/meta-ads-example.csv");
  const csvText = readFileSync(csvPath, "utf-8");

  it("faz o parse do CSV de exemplo sem erros", () => {
    const parsed = Papa.parse<Record<string, string>>(csvText, { header: true, skipEmptyLines: true });
    expect(parsed.errors).toHaveLength(0);
    expect(parsed.data.length).toBe(20);
  });

  it("normaliza todas as linhas do CSV de exemplo", () => {
    const parsed = Papa.parse<Record<string, string>>(csvText, { header: true, skipEmptyLines: true });
    const normalized = normalizeCsvRows(parsed.data);

    expect(normalized.ok).toBe(true);
    if (!normalized.ok) return;
    expect(normalized.rows).toHaveLength(20);
    expect(normalized.rows[0].campaignName).toBe("Campanha Institucional");
    expect(normalized.rows[0].spend).toBeCloseTo(412.5, 2);
  });

  it("gera diagnóstico com alertas e oportunidades a partir do CSV de exemplo", () => {
    const parsed = Papa.parse<Record<string, string>>(csvText, { header: true, skipEmptyLines: true });
    const normalized = normalizeCsvRows(parsed.data);
    if (!normalized.ok) throw new Error("normalização falhou");

    const result = runAnalysisEngine(normalized.rows);

    expect(result.totals.spend).toBeGreaterThan(0);
    expect(result.campaigns).toHaveLength(20);
    // "Institucional Vídeo" tem uma linha com investimento e 0 conversões:
    // deve disparar o alerta de campanha sem conversões.
    expect(result.alerts.some((a) => a.title === "Campanha sem conversões")).toBe(true);
  });
});
