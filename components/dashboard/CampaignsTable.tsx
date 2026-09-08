"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { formatBRL, formatNumber, formatPercent, formatRoas } from "@/lib/analysis/metrics";
import { cn } from "@/lib/utils";
import type { CampaignMetrics } from "@/types/domain";

type SortKey = "campaignName" | "spend" | "ctr" | "cpa" | "conversions" | "roas";

interface Column {
  key: SortKey;
  label: string;
  align?: "left" | "right";
}

const COLUMNS: Column[] = [
  { key: "campaignName", label: "Campanha", align: "left" },
  { key: "spend", label: "Investimento", align: "right" },
  { key: "ctr", label: "CTR", align: "right" },
  { key: "cpa", label: "CPA", align: "right" },
  { key: "conversions", label: "Conversões", align: "right" },
  { key: "roas", label: "ROAS", align: "right" },
];

function formatCell(key: SortKey, campaign: CampaignMetrics): string {
  switch (key) {
    case "campaignName":
      return campaign.campaignName;
    case "spend":
      return formatBRL(campaign.spend);
    case "ctr":
      return formatPercent(campaign.ctr);
    case "cpa":
      return campaign.conversions > 0 ? formatBRL(campaign.cpa) : "—";
    case "conversions":
      return formatNumber(campaign.conversions);
    case "roas":
      return campaign.spend > 0 ? formatRoas(campaign.roas) : "—";
    default:
      return "";
  }
}

export function CampaignsTable({ campaigns }: { campaigns: CampaignMetrics[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("spend");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    const copy = [...campaigns];
    copy.sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      if (typeof aValue === "string" || typeof bValue === "string") {
        return direction === "asc"
          ? String(aValue).localeCompare(String(bValue), "pt-BR")
          : String(bValue).localeCompare(String(aValue), "pt-BR");
      }
      return direction === "asc" ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
    });
    return copy;
  }, [campaigns, sortKey, direction]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDirection("desc");
    }
  }

  return (
    <div className="card-surface overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-secondary">
              {COLUMNS.map((column) => (
                <th
                  key={column.key}
                  className={cn("px-5 py-3.5 font-medium", column.align === "right" && "text-right")}
                >
                  <button
                    type="button"
                    onClick={() => handleSort(column.key)}
                    className={cn(
                      "inline-flex items-center gap-1 transition-colors hover:text-ink",
                      column.align === "right" && "flex-row-reverse"
                    )}
                  >
                    {column.label}
                    {sortKey === column.key ? (
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
            {sorted.map((campaign, index) => (
              <tr key={`${campaign.campaignName}-${index}`} className="transition-colors hover:bg-white/[0.02]">
                {COLUMNS.map((column) => (
                  <td
                    key={column.key}
                    className={cn(
                      "px-5 py-3.5 text-ink-secondary",
                      column.key === "campaignName" && "font-medium text-ink",
                      column.align === "right" && "text-right"
                    )}
                  >
                    {formatCell(column.key, campaign)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
