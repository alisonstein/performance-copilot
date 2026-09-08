"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import {
  formatBRL,
  formatBRLOrDash,
  formatFrequency,
  formatNumberOrDash,
  formatPercent,
  formatRoas,
} from "@/lib/analysis/metrics";
import { getPrimaryResultCost, getPrimaryResultCount, PRIMARY_RESULT_LABELS } from "@/lib/analysis/primary-result";
import { PerformanceBadge } from "@/components/dashboard/badges/PerformanceBadge";
import { StatusBadge } from "@/components/dashboard/badges/StatusBadge";
import { cn } from "@/lib/utils";
import type { GroupedMetrics, PrimaryResultType } from "@/types/domain";

export type GroupedColumnKey =
  | "name"
  | "status"
  | "spend"
  | "reach"
  | "impressions"
  | "frequency"
  | "clicks"
  | "linkClicks"
  | "ctr"
  | "cpc"
  | "cpm"
  | "result"
  | "resultCost"
  | "revenue"
  | "roas";

const COLUMN_LABELS: Record<GroupedColumnKey, string> = {
  name: "Nome",
  status: "Status",
  spend: "Investimento",
  reach: "Alcance",
  impressions: "Impressões",
  frequency: "Frequência",
  clicks: "Cliques",
  linkClicks: "Cliques no link",
  ctr: "CTR",
  cpc: "CPC",
  cpm: "CPM",
  result: "Resultado",
  resultCost: "Custo/resultado",
  revenue: "Receita",
  roas: "ROAS",
};

interface GroupedTableProps {
  rows: GroupedMetrics[];
  columns: GroupedColumnKey[];
  nameMode: "campaign" | "adset";
  resultLens: PrimaryResultType;
}

const MIN_ATTENTION_SPEND = 20;

export function GroupedTable({ rows, columns, nameMode, resultLens }: GroupedTableProps) {
  const [sortKey, setSortKey] = useState<GroupedColumnKey>("spend");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");

  const resultLabel = PRIMARY_RESULT_LABELS[resultLens];

  const enriched = useMemo(() => {
    return rows.map((row) => ({
      row,
      result: getPrimaryResultCount(row, resultLens),
      resultCost: getPrimaryResultCost(row, resultLens),
    }));
  }, [rows, resultLens]);

  const bestCpaKey = useMemo(() => {
    const candidates = enriched.filter((e) => e.result !== null && e.result > 0 && e.resultCost !== null);
    if (candidates.length === 0) return null;
    return candidates.reduce((best, cur) => ((cur.resultCost as number) < (best.resultCost as number) ? cur : best)).row.key;
  }, [enriched]);

  const highestVolumeKey = useMemo(() => {
    const candidates = enriched.filter((e) => e.result !== null && e.result > 0);
    if (candidates.length === 0) return null;
    return candidates.reduce((best, cur) => ((cur.result as number) > (best.result as number) ? cur : best)).row.key;
  }, [enriched]);

  const attentionKeys = useMemo(() => {
    return new Set(
      enriched
        .filter((e) => e.row.spend >= MIN_ATTENTION_SPEND && (e.result === null || e.result === 0))
        .map((e) => e.row.key)
    );
  }, [enriched]);

  const sorted = useMemo(() => {
    const copy = [...enriched];
    copy.sort((a, b) => {
      const getValue = (entry: (typeof enriched)[number]) => {
        switch (sortKey) {
          case "name":
            return entry.row.campaignName + (entry.row.adsetName ?? "");
          case "status":
            return entry.row.status ?? "";
          case "result":
            return entry.result ?? -1;
          case "resultCost":
            return entry.resultCost ?? Number.POSITIVE_INFINITY;
          case "reach":
            return entry.row.reach ?? -1;
          case "frequency":
            return entry.row.frequency ?? -1;
          case "linkClicks":
            return entry.row.linkClicks ?? -1;
          default:
            return entry.row[sortKey as "spend" | "impressions" | "clicks" | "ctr" | "cpc" | "cpm" | "revenue" | "roas"];
        }
      };
      const aVal = getValue(a);
      const bVal = getValue(b);
      if (typeof aVal === "string" || typeof bVal === "string") {
        return direction === "asc"
          ? String(aVal).localeCompare(String(bVal), "pt-BR")
          : String(bVal).localeCompare(String(aVal), "pt-BR");
      }
      return direction === "asc" ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });
    return copy;
  }, [enriched, sortKey, direction]);

  function handleSort(key: GroupedColumnKey) {
    if (key === sortKey) {
      setDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDirection("desc");
    }
  }

  if (rows.length === 0) {
    return (
      <div className="card-surface p-8 text-center text-sm text-ink-secondary">
        Nenhum resultado para os filtros aplicados.
      </div>
    );
  }

  return (
    <div className="card-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-secondary">
              {columns.map((col) => (
                <th key={col} className={cn("px-4 py-3.5 font-medium", col !== "name" && "text-right")}>
                  <button
                    type="button"
                    onClick={() => handleSort(col)}
                    className={cn(
                      "inline-flex items-center gap-1 transition-colors hover:text-ink",
                      col !== "name" && "flex-row-reverse"
                    )}
                  >
                    {col === "result" ? resultLabel : COLUMN_LABELS[col]}
                    {sortKey === col ? (
                      direction === "asc" ? (
                        <ArrowUp size={12} />
                      ) : (
                        <ArrowDown size={12} />
                      )
                    ) : (
                      <ArrowUpDown size={12} className="opacity-40" />
                    )}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map(({ row, result, resultCost }) => (
              <tr key={row.key} className="transition-colors hover:bg-white/[0.02]">
                {columns.map((col) => {
                  if (col === "name") {
                    return (
                      <td key={col} className="px-4 py-3.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-ink">
                            {nameMode === "adset" ? row.adsetName ?? "Sem conjunto" : row.campaignName}
                          </span>
                          {nameMode === "adset" ? (
                            <span className="text-xs text-ink-secondary">{row.campaignName}</span>
                          ) : null}
                          {row.key === bestCpaKey ? <PerformanceBadge kind="best_cpa" /> : null}
                          {row.key === highestVolumeKey ? <PerformanceBadge kind="highest_volume" /> : null}
                          {attentionKeys.has(row.key) ? <PerformanceBadge kind="attention" /> : null}
                        </div>
                      </td>
                    );
                  }
                  if (col === "status") {
                    return (
                      <td key={col} className="px-4 py-3.5 text-right">
                        <StatusBadge status={row.status} />
                      </td>
                    );
                  }

                  let content = "—";
                  if (col === "spend") content = formatBRL(row.spend);
                  else if (col === "reach") content = formatNumberOrDash(row.reach);
                  else if (col === "impressions") content = formatNumberOrDash(row.impressions);
                  else if (col === "frequency") content = formatFrequency(row.frequency);
                  else if (col === "clicks") content = formatNumberOrDash(row.clicks);
                  else if (col === "linkClicks") content = formatNumberOrDash(row.linkClicks);
                  else if (col === "ctr") content = formatPercent(row.ctr);
                  else if (col === "cpc") content = formatBRL(row.cpc);
                  else if (col === "cpm") content = formatBRL(row.cpm);
                  else if (col === "result") content = formatNumberOrDash(result);
                  else if (col === "resultCost") content = formatBRLOrDash(resultCost);
                  else if (col === "revenue") content = formatBRL(row.revenue);
                  else if (col === "roas") content = row.spend > 0 ? formatRoas(row.roas) : "—";

                  return (
                    <td key={col} className="px-4 py-3.5 text-right text-ink-secondary">
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
