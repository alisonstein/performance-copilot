import { cn } from "@/lib/utils";

export type PerformanceBadgeKind =
  | "best_cpa"
  | "highest_volume"
  | "attention"
  | "best_ad"
  | "worst_ad"
  | "highest_ctr"
  | "lowest_cpa"
  | "high_spend_no_result"
  | "best_creative"
  | "high_ctr"
  | "high_cpa"
  | "no_conversion";

const LABELS: Record<PerformanceBadgeKind, string> = {
  best_cpa: "Melhor CPA",
  highest_volume: "Maior volume",
  attention: "Atenção",
  best_ad: "Melhor anúncio",
  worst_ad: "Pior anúncio",
  highest_ctr: "Maior CTR",
  lowest_cpa: "Menor CPA",
  high_spend_no_result: "Gasto sem resultado",
  best_creative: "Melhor criativo",
  high_ctr: "CTR alto",
  high_cpa: "CPA alto",
  no_conversion: "Sem conversão",
};

const POSITIVE: PerformanceBadgeKind[] = ["best_cpa", "highest_volume", "best_ad", "highest_ctr", "lowest_cpa", "best_creative", "high_ctr"];
const NEGATIVE: PerformanceBadgeKind[] = ["attention", "worst_ad", "high_spend_no_result", "high_cpa", "no_conversion"];

export function PerformanceBadge({ kind, className }: { kind: PerformanceBadgeKind; className?: string }) {
  const isPositive = POSITIVE.includes(kind);
  const isNegative = NEGATIVE.includes(kind);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
        isPositive && "border-accent/30 bg-accent/10 text-accent",
        isNegative && "border-red-400/30 bg-red-400/10 text-red-300",
        !isPositive && !isNegative && "border-primary/30 bg-primary/10 text-primary-light",
        className
      )}
    >
      {LABELS[kind]}
    </span>
  );
}
