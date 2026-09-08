import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CampaignStatus } from "@/types/domain";

const LABELS: Record<CampaignStatus, string> = {
  active: "Ativo",
  paused: "Pausado",
  other: "Outro",
};

const STYLES: Record<CampaignStatus, string> = {
  active: "border-accent/30 bg-accent/10 text-accent",
  paused: "border-white/15 bg-white/[0.04] text-ink-secondary",
  other: "border-white/15 bg-white/[0.04] text-ink-secondary",
};

export function StatusBadge({ status }: { status: CampaignStatus | null }) {
  if (!status) {
    return <span className="text-xs text-ink-secondary">—</span>;
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        STYLES[status]
      )}
    >
      <Circle size={6} className="fill-current" />
      {LABELS[status]}
    </span>
  );
}
