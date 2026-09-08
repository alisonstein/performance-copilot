import { AlertTriangle, Lightbulb, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Severity } from "@/types/domain";

type InsightVariant = "alert" | "opportunity" | "recommendation";

interface InsightCardProps {
  variant: InsightVariant;
  title: string;
  description: string;
  severity?: Severity;
}

const VARIANT_STYLES: Record<InsightVariant, { border: string; bg: string; icon: typeof AlertTriangle }> = {
  alert: { border: "border-red-400/25", bg: "bg-red-400/[0.06]", icon: AlertTriangle },
  opportunity: { border: "border-accent/25", bg: "bg-accent/[0.06]", icon: Lightbulb },
  recommendation: { border: "border-primary/25", bg: "bg-primary/[0.06]", icon: Target },
};

const SEVERITY_LABEL: Record<Severity, string> = {
  high: "Prioridade alta",
  medium: "Prioridade média",
  low: "Prioridade baixa",
};

const SEVERITY_COLOR: Record<Severity, string> = {
  high: "text-red-300",
  medium: "text-amber-300",
  low: "text-ink-secondary",
};

export function InsightCard({ variant, title, description, severity }: InsightCardProps) {
  const styles = VARIANT_STYLES[variant];
  const Icon = styles.icon;

  return (
    <div className={cn("flex items-start gap-3 rounded-xl border p-4", styles.border, styles.bg)}>
      <Icon
        size={17}
        className={cn(
          "mt-0.5 shrink-0",
          variant === "alert" && "text-red-300",
          variant === "opportunity" && "text-accent",
          variant === "recommendation" && "text-primary-light"
        )}
      />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[14px] font-semibold text-ink">{title}</p>
          {severity ? (
            <span className={cn("text-[11px] font-medium", SEVERITY_COLOR[severity])}>
              {SEVERITY_LABEL[severity]}
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-sm leading-relaxed text-ink-secondary">{description}</p>
      </div>
    </div>
  );
}
