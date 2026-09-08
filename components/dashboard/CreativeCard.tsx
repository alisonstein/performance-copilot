import { Image as ImageIcon, Layers, PlayCircle } from "lucide-react";
import { formatBRL, formatBRLOrDash, formatNumberOrDash, formatPercent } from "@/lib/analysis/metrics";
import { getPrimaryResultCost, getPrimaryResultCount, PRIMARY_RESULT_LABELS } from "@/lib/analysis/primary-result";
import { PerformanceBadge, type PerformanceBadgeKind } from "@/components/dashboard/badges/PerformanceBadge";
import { StatusBadge } from "@/components/dashboard/badges/StatusBadge";
import type { CampaignMetrics, PrimaryResultType } from "@/types/domain";

const TYPE_ICON = {
  image: ImageIcon,
  video: PlayCircle,
  carousel: Layers,
  unknown: ImageIcon,
};

const TYPE_LABEL = {
  image: "Imagem",
  video: "Vídeo",
  carousel: "Carrossel",
  unknown: "Formato não identificado",
};

interface CreativeCardProps {
  creative: CampaignMetrics;
  resultLens: PrimaryResultType;
  badge?: PerformanceBadgeKind;
}

export function CreativeCard({ creative, resultLens, badge }: CreativeCardProps) {
  const type = creative.creativeType ?? "unknown";
  const TypeIcon = TYPE_ICON[type];
  const resultCount = getPrimaryResultCount(creative, resultLens);
  const resultCost = getPrimaryResultCost(creative, resultLens);

  return (
    <div className="card-surface flex flex-col overflow-hidden transition-colors hover:bg-white/[0.02]">
      <div className="relative flex aspect-[4/3] items-center justify-center bg-white/[0.03]">
        {creative.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- thumbnails vêm de domínios externos (CSV/Meta), sem otimização do Next Image
          <img
            src={creative.thumbnailUrl}
            alt={creative.adName ?? "Criativo"}
            className="h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-ink-secondary">
            <TypeIcon size={28} />
            <span className="text-[11px]">{TYPE_LABEL[type]}</span>
          </div>
        )}
        {badge ? (
          <div className="absolute left-2 top-2">
            <PerformanceBadge kind={badge} />
          </div>
        ) : null}
        <div className="absolute right-2 top-2">
          <StatusBadge status={creative.status} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="truncate text-sm font-semibold text-ink" title={creative.adName ?? undefined}>
            {creative.adName ?? "Anúncio sem nome"}
          </p>
          <p className="truncate text-xs text-ink-secondary" title={creative.campaignName}>
            {creative.campaignName}
            {creative.adsetName ? ` · ${creative.adsetName}` : ""}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
          <div>
            <p className="text-ink-secondary">Investimento</p>
            <p className="font-medium text-ink">{formatBRL(creative.spend)}</p>
          </div>
          <div>
            <p className="text-ink-secondary">Alcance</p>
            <p className="font-medium text-ink">{formatNumberOrDash(creative.reach)}</p>
          </div>
          <div>
            <p className="text-ink-secondary">CTR</p>
            <p className="font-medium text-ink">{formatPercent(creative.ctr)}</p>
          </div>
          <div>
            <p className="text-ink-secondary">CPM</p>
            <p className="font-medium text-ink">{formatBRL(creative.cpm)}</p>
          </div>
          <div>
            <p className="text-ink-secondary">{PRIMARY_RESULT_LABELS[resultLens]}</p>
            <p className="font-medium text-ink">{formatNumberOrDash(resultCount)}</p>
          </div>
          <div>
            <p className="text-ink-secondary">Custo/resultado</p>
            <p className="font-medium text-ink">{formatBRLOrDash(resultCost)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
