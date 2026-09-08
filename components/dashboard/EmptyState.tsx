import Link from "next/link";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function EmptyState({ icon: Icon, title, description, ctaLabel, ctaHref }: EmptyStateProps) {
  return (
    <div className="card-surface flex flex-col items-center px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-white/[0.03]">
        <Icon size={26} className="text-primary-light" />
      </div>
      <p className="mt-5 text-[17px] font-semibold text-ink">{title}</p>
      <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-secondary">{description}</p>
      {ctaLabel && ctaHref ? (
        <Link href={ctaHref} className="btn-primary mt-6 !px-5 !py-2.5 !text-sm">
          {ctaLabel}
        </Link>
      ) : null}
    </div>
  );
}
