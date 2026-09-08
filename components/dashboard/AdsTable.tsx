"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { formatBRL, formatBRLOrDash, formatFrequency, formatNumberOrDash, formatPercent } from "@/lib/analysis/metrics";
import { getPrimaryResultCost, getPrimaryResultCount, PRIMARY_RESULT_LABELS } from "@/lib/analysis/primary-result";
import { PerformanceBadge } from "@/components/dashboard/badges/PerformanceBadge";
import { StatusBadge } from "@/components/dashboard/badges/StatusBadge";
import { cn } from "@/lib/utils";
import type { CampaignMetrics, PrimaryResultType } from "@/types/domain";

type SortKey = "name" | "spend" | "reach" | "impressions" | "frequency" | "ctr" | "cpc" | "cpm" | "result" | "resultCost";

const MIN_ATTENTION_SPEND = 20;

export function AdsTable({ ads, resultLens }: { ads: CampaignMetrics[]; resultLens: PrimaryResultType }) {
  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");

  const resultLabel = PRIMARY_RESULT_LABELS[resultLens];

  const enriched = useMemo(
    () =>
      ads.map((ad) => ({
        ad,
        result: getPrimaryResultCount(ad, resultLens),
        resultCost: getPrimaryResultCost(ad, resultLens),
      })),
    [ads, resultLens]
  );

  const bestAdName = useMemo(() => {
    const candidates = enriched.filter((e) => e.result !== null && e.result > 0 && e.resultCost !== null);
    if (candidates.length === 0) return null;
    return candidates.reduce((best, cur) => ((cur.resultCost as number) < (best.resultCost as number) ? cur : best)).ad;
  }, [enriched]);

  const worstAdBySpendNoResult = useMemo(() => {
    const candidates = enriched.filter((e) => e.ad.spend >= MIN_ATTENTION_SPEND && (e.result === null || e.result === 0));
    if (candidates.length === 0) return null;
    return candidates.reduce((worst, cur) => (cur.ad.spend > worst.ad.spend ? cur : worst)).ad;
  }, [enriched]);

  const highestCtrAd = useMemo(() => {
    const candidates = ads.filter((a) => a.impressions > 0);
    if (candidates.length === 0) return null;
    return candidates.reduce((best, cur) => (cur.ctr > best.ctr ? cur : best));
  }, [ads]);

  const sorted = useMemo(() => {
    const copy = [...enriched];
    copy.sort((a, b) => {
      const getValue = (entry: (typeof enriched)[number]) => {
        switch (sortKey) {
          case "name":
            return entry.ad.adName ?? entry.ad.campaignName;
          case "result":
            return entry.result ?? -1;
          case "resultCost":
            return entry.resultCost ?? Number.POSITIVE_INFINITY;
          case "reach":
            return entry.ad.reach ?? -1;
          case "frequency":
            return entry.ad.frequency ?? -1;
          default:
            return entry.ad[sortKey as "spend" | "impressions" | "ctr" | "cpc" | "cpm"];
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

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDirection("desc");
    }
  }

  if (ads.length === 0) {
    return (
      <div className="card-surface p-8 text-center text-sm text-ink-secondary">
        Nenhum resultado para os filtros aplicados.
      </div>
    );
  }

  const HEAD: Array<{ key: SortKey; label: string }> = [
    { key: "name", label: "Anúncio" },
    { key: "spend", label: "Investimento" },
    { key: "reach", label: "Alcance" },
    { key: "impressions", label: "Impressões" },
    { key: "frequency", label: "Frequência" },
    { key: "ctr", label: "CTR" },
    { key: "cpc", label: "CPC" },
    { key: "cpm", label: "CPM" },
    { key: "result", label: resultLabel },
    { key: "resultCost", label: "Custo/resultado" },
  ];

  return (
    <div className="card-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-secondary">
              {HEAD.map((col) => (
                <th key={col.key} className={cn("px-4 py-3.5 font-medium", col.key !== "name" && "text-right")}>
                  <button
                    type="button"
                    onClick={() => handleSort(col.key)}
                    className={cn(
                      "inline-flex items-center gap-1 transition-colors hover:text-ink",
                      col.key !== "name" && "flex-row-reverse"
                    )}
                  >
                    {col.label}
                    {sortKey === col.key ? (
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
              <th className="px-4 py-3.5 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sorted.map(({ ad, result, resultCost }, index) => (
              <tr key={`${ad.adId ?? ad.adName ?? index}`} className="transition-colors hover:bg-white/[0.02]">
                <td className="px-4 py-3.5">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-ink">{ad.adName ?? "Anúncio sem nome"}</span>
                      {ad === bestAdName ? <PerformanceBadge kind="best_ad" /> : null}
                      {ad === worstAdBySpendNoResult ? <PerformanceBadge kind="worst_ad" /> : null}
                      {ad === highestCtrAd ? <PerformanceBadge kind="highest_ctr" /> : null}
                    </div>
                    <span className="text-xs text-ink-secondary">
                      {ad.campaignName}
                      {ad.adsetName ? ` · ${ad.adsetName}` : ""}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-right text-ink-secondary">{formatBRL(ad.spend)}</td>
                <td className="px-4 py-3.5 text-right text-ink-secondary">{formatNumberOrDash(ad.reach)}</td>
                <td className="px-4 py-3.5 text-right text-ink-secondary">{formatNumberOrDash(ad.impressions)}</td>
                <td className="px-4 py-3.5 text-right text-ink-secondary">{formatFrequency(ad.frequency)}</td>
                <td className="px-4 py-3.5 text-right text-ink-secondary">{formatPercent(ad.ctr)}</td>
                <td className="px-4 py-3.5 text-right text-ink-secondary">{formatBRL(ad.cpc)}</td>
                <td className="px-4 py-3.5 text-right text-ink-secondary">{formatBRL(ad.cpm)}</td>
                <td className="px-4 py-3.5 text-right text-ink-secondary">{formatNumberOrDash(result)}</td>
                <td className="px-4 py-3.5 text-right text-ink-secondary">{formatBRLOrDash(resultCost)}</td>
                <td className="px-4 py-3.5 text-right">
                  <StatusBadge status={ad.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
