import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon?: LucideIcon;
  hint?: string;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, hint, className }: StatCardProps) {
  return (
    <div className={cn("card-surface p-5", className)}>
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-ink-secondary">{label}</p>
        {Icon ? <Icon size={16} className="text-ink-secondary" /> : null}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-secondary">{hint}</p> : null}
    </div>
  );
}
