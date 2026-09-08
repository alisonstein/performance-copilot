import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { formatChangePct } from "@/lib/analysis/metrics";
import { cn } from "@/lib/utils";
import type { TotalsComparison } from "@/lib/analysis/compare";

interface PeriodComparisonProps {
  comparison: TotalsComparison;
  previousPeriodLabel: string;
}

interface MetricRow {
  label: string;
  value: number | null;
  positiveIsGood: boolean;
}

function ChangeBadge({ value, positiveIsGood }: { value: number | null; positiveIsGood: boolean }) {
  if (value === null) {
    return (
      <span className="inline-flex items-center gap-1 text-sm font-medium text-ink-secondary">
        <Minus size={14} />
        {formatChangePct(value)}
      </span>
    );
  }

  const isGood = positiveIsGood ? value >= 0 : value <= 0;
  const Icon = value >= 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-sm font-medium",
        isGood ? "text-accent" : "text-red-400"
      )}
    >
      <Icon size={14} />
      {formatChangePct(value)}
    </span>
  );
}

export function PeriodComparison({ comparison, previousPeriodLabel }: PeriodComparisonProps) {
  const rows: MetricRow[] = [
    { label: "Investimento", value: comparison.spendChangePct, positiveIsGood: true },
    { label: "Conversões", value: comparison.conversionsChangePct, positiveIsGood: true },
    { label: "CPA", value: comparison.cpaChangePct, positiveIsGood: false },
    { label: "CTR", value: comparison.ctrChangePct, positiveIsGood: true },
  ];

  return (
    <div className="card-surface p-5 sm:p-6">
      <h3 className="text-sm font-semibold text-ink">Comparação com análise anterior</h3>
      <p className="mt-1 text-xs text-ink-secondary">Em relação a {previousPeriodLabel}.</p>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {rows.map((row) => (
          <div key={row.label}>
            <p className="text-xs text-ink-secondary">{row.label}</p>
            <div className="mt-1">
              <ChangeBadge value={row.value} positiveIsGood={row.positiveIsGood} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
