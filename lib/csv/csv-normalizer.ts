// ============================================================================
// csv-normalizer.ts
//
// Transforma linhas cruas de um CSV exportado do Meta Ads ou Google Ads (em
// português ou inglês) em um formato padronizado (NormalizedCampaignRow).
//
// Princípios:
// - Nunca confia cegamente nos valores agregados do CSV (CTR/CPC/CPM/CPA/ROAS
//   são recalculados por lib/analysis/metrics.ts a partir dos valores brutos).
// - Reconhece um conjunto amplo de nomes de coluna comuns.
// - Falha de forma amigável quando não é possível identificar as colunas
//   essenciais, em vez de lançar exceções genéricas.
// ============================================================================

import type { NormalizedCampaignRow } from "@/types/domain";

type FieldKey =
  | "campaignName"
  | "adsetName"
  | "adName"
  | "spend"
  | "impressions"
  | "clicks"
  | "conversions"
  | "revenue";

// Aliases já normalizados (minúsculas, sem acento, sem pontuação).
const HEADER_ALIASES: Record<FieldKey, string[]> = {
  campaignName: [
    "campaign name",
    "campaign",
    "nome da campanha",
    "nome campanha",
    "campanha",
  ],
  adsetName: [
    "ad set name",
    "adset name",
    "ad group",
    "grupo de anuncios",
    "nome do conjunto de anuncios",
    "nome do grupo de anuncios",
    "conjunto de anuncios",
  ],
  adName: ["ad name", "nome do anuncio", "anuncio"],
  spend: [
    "amount spent",
    "amount spent brl",
    "amount spent usd",
    "cost",
    "custo",
    "valor gasto",
    "gasto",
    "investimento",
  ],
  impressions: ["impressions", "impressoes"],
  clicks: [
    "clicks",
    "link clicks",
    "cliques",
    "cliques no link",
    "cliques no ligacao",
  ],
  conversions: [
    "results",
    "resultados",
    "conversions",
    "conversoes",
    "purchases",
    "compras",
  ],
  revenue: [
    "purchase conversion value",
    "purchases conversion value",
    "conversion value",
    "conv value",
    "valor de conversao",
    "valor de compra",
    "receita",
    "revenue",
  ],
};

const COMBINING_DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

function stripAccents(value: string): string {
  return value.normalize("NFD").replace(COMBINING_DIACRITICS, "");
}

function normalizeHeader(header: string): string {
  return stripAccents(header)
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function buildHeaderMap(originalHeaders: string[]): Partial<Record<FieldKey, string>> {
  const normalizedToOriginal = new Map<string, string>();
  for (const header of originalHeaders) {
    const normalized = normalizeHeader(header);
    if (!normalizedToOriginal.has(normalized)) {
      normalizedToOriginal.set(normalized, header);
    }
  }

  const map: Partial<Record<FieldKey, string>> = {};

  for (const [field, aliases] of Object.entries(HEADER_ALIASES) as [FieldKey, string[]][]) {
    for (const alias of aliases) {
      const match = normalizedToOriginal.get(alias);
      if (match) {
        map[field] = match;
        break;
      }
    }
  }

  return map;
}

/**
 * Converte um valor de célula (que pode vir como "R$ 1.234,56", "1,234.56",
 * "12%", número já parseado, etc.) para um número em ponto flutuante.
 */
export function parseLocaleNumber(raw: unknown): number {
  if (typeof raw === "number") {
    return Number.isFinite(raw) ? raw : 0;
  }
  if (raw === null || raw === undefined) return 0;

  let str = String(raw).trim();
  if (!str) return 0;

  const isNegative = /^-/.test(str) || /^\(.*\)$/.test(str);
  str = str
    .replace(/[R$€£\s ]/g, "")
    .replace(/%/g, "")
    .replace(/[()]/g, "")
    .replace(/^-/, "");

  const hasComma = str.includes(",");
  const hasDot = str.includes(".");

  if (hasComma && hasDot) {
    const lastComma = str.lastIndexOf(",");
    const lastDot = str.lastIndexOf(".");
    if (lastComma > lastDot) {
      // formato pt-BR: 1.234,56
      str = str.replace(/\./g, "").replace(",", ".");
    } else {
      // formato en-US: 1,234.56
      str = str.replace(/,/g, "");
    }
  } else if (hasComma) {
    const parts = str.split(",");
    if (parts.length === 2 && parts[1].length <= 2) {
      str = parts.join("."); // vírgula decimal
    } else {
      str = str.replace(/,/g, ""); // separador de milhar
    }
  } else if (hasDot) {
    const parts = str.split(".");
    if (parts.length > 2) {
      str = str.replace(/\./g, ""); // separador de milhar (1.234.567)
    }
  }

  const num = parseFloat(str);
  const result = Number.isFinite(num) ? num : 0;
  if (result === 0) return 0; // evita retornar -0
  return isNegative ? -result : result;
}

export interface CsvNormalizationSuccess {
  ok: true;
  rows: NormalizedCampaignRow[];
  skippedRows: number;
  warnings: string[];
}

export interface CsvNormalizationFailure {
  ok: false;
  message: string;
  missingFields: string[];
}

export type CsvNormalizationResult = CsvNormalizationSuccess | CsvNormalizationFailure;

const REQUIRED_FIELD_LABELS: Record<"campaignName" | "metric", string> = {
  campaignName: "nome da campanha",
  metric: "investimento, impressões ou cliques",
};

/**
 * Recebe as linhas já parseadas do CSV (array de objetos, chaves = cabeçalho
 * original) e devolve linhas normalizadas no formato interno do produto.
 */
export function normalizeCsvRows(
  rawRows: Record<string, unknown>[]
): CsvNormalizationResult {
  if (!rawRows || rawRows.length === 0) {
    return {
      ok: false,
      message: "O arquivo está vazio ou não pôde ser lido.",
      missingFields: [],
    };
  }

  const originalHeaders = Object.keys(rawRows[0] ?? {});
  const headerMap = buildHeaderMap(originalHeaders);

  const missingFields: string[] = [];
  if (!headerMap.campaignName) missingFields.push(REQUIRED_FIELD_LABELS.campaignName);

  const hasAnyMetric = Boolean(
    headerMap.spend || headerMap.impressions || headerMap.clicks
  );
  if (!hasAnyMetric) missingFields.push(REQUIRED_FIELD_LABELS.metric);

  if (missingFields.length > 0) {
    return {
      ok: false,
      message: `Não conseguimos identificar as colunas necessárias no arquivo: ${missingFields.join(
        ", "
      )}. Verifique se o export contém essas informações e tente novamente.`,
      missingFields,
    };
  }

  const rows: NormalizedCampaignRow[] = [];
  let skippedRows = 0;

  for (const raw of rawRows) {
    const campaignName = headerMap.campaignName
      ? String(raw[headerMap.campaignName] ?? "").trim()
      : "";

    if (!campaignName) {
      skippedRows += 1;
      continue;
    }

    const adsetNameRaw = headerMap.adsetName ? String(raw[headerMap.adsetName] ?? "").trim() : "";
    const adNameRaw = headerMap.adName ? String(raw[headerMap.adName] ?? "").trim() : "";

    rows.push({
      campaignName,
      adsetName: adsetNameRaw || null,
      adName: adNameRaw || null,
      spend: headerMap.spend ? parseLocaleNumber(raw[headerMap.spend]) : 0,
      impressions: headerMap.impressions
        ? Math.round(parseLocaleNumber(raw[headerMap.impressions]))
        : 0,
      clicks: headerMap.clicks ? Math.round(parseLocaleNumber(raw[headerMap.clicks])) : 0,
      conversions: headerMap.conversions ? parseLocaleNumber(raw[headerMap.conversions]) : 0,
      revenue: headerMap.revenue ? parseLocaleNumber(raw[headerMap.revenue]) : 0,
    });
  }

  if (rows.length === 0) {
    return {
      ok: false,
      message: "Nenhuma linha válida foi encontrada no arquivo (faltou o nome da campanha em todas as linhas).",
      missingFields: [],
    };
  }

  const warnings: string[] = [];
  if (!headerMap.conversions) {
    warnings.push("Coluna de conversões não encontrada — consideramos 0 conversões.");
  }
  if (!headerMap.revenue) {
    warnings.push("Coluna de receita/valor de conversão não encontrada — o ROAS não pôde ser calculado.");
  }
  if (skippedRows > 0) {
    warnings.push(`${skippedRows} linha(s) sem nome de campanha foram ignoradas.`);
  }

  return { ok: true, rows, skippedRows, warnings };
}
