"use client";

import { useMemo } from "react";
import { AlertTriangle, Trophy } from "lucide-react";
import { rankCreatives } from "@/lib/analysis/creative-ranking";
import { getPrimaryResultCost } from "@/lib/analysis/primary-result";
import { CreativeCard } from "@/components/dashboard/CreativeCard";
import type { PerformanceBadgeKind } from "@/components/dashboard/badges/PerformanceBadge";
import type { CampaignMetrics, PrimaryResultType } from "@/types/domain";

interface CreativesTabProps {
  creatives: CampaignMetrics[];
  resultLens: PrimaryResultType;
  accountAverageCost: number;
}

const CPA_HIGH_MULTIPLIER = 1.3;

function MiniList({ title, items, valueLabel, getValue }: {
  title: string;
  items: CampaignMetrics[];
  valueLabel: string;
  getValue: (item: CampaignMetrics) => string;
}) {
  if (items.length === 0) return null;
  return (
    <div className="card-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-secondary">{title}</p>
      <ul className="mt-3 space-y-2.5">
        {items.map((item, index) => (
          <li key={`${item.adId ?? item.adName}-${index}`} className="flex items-center justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-ink" title={item.adName ?? item.campaignName}>
              {index + 1}. {item.adName ?? item.campaignName}
            </span>
            <span className="shrink-0 text-xs text-ink-secondary">
              {getValue(item)} {valueLabel}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CreativesTab({ creatives, resultLens, accountAverageCost }: CreativesTabProps) {
  const ranking = useMemo(
    () => rankCreatives(creatives, resultLens, accountAverageCost),
    [creatives, resultLens, accountAverageCost]
  );

  const badgeMap = useMemo(() => {
    const map = new Map<CampaignMetrics, PerformanceBadgeKind>();

    const best = ranking.byLowestCostPerResult[0];
    if (best) map.set(best, "best_creative");

    const bestCtr = ranking.byHighestCtr[0];
    if (bestCtr && !map.has(bestCtr)) map.set(bestCtr, "high_ctr");

    for (const item of ranking.needsAttention) {
      if (map.has(item)) continue;
      const cost = getPrimaryResultCost(item, resultLens);
      if (item.spend > 0 && (cost === null || (cost === null && item.conversions === 0))) {
        map.set(item, "no_conversion");
      } else if (accountAverageCost > 0 && cost !== null && cost > accountAverageCost * CPA_HIGH_MULTIPLIER) {
        map.set(item, "high_cpa");
      }
    }

    return map;
  }, [ranking, resultLens, accountAverageCost]);

  if (creatives.length === 0) {
    return (
      <div className="card-surface p-8 text-center text-sm text-ink-secondary">
        Nenhum criativo para os filtros aplicados.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Trophy size={16} className="text-accent" />
          Ranking de criativos
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MiniList
            title="Menor custo por resultado"
            items={ranking.byLowestCostPerResult}
            valueLabel=""
            getValue={(item) => {
              const cost = getPrimaryResultCost(item, resultLens);
              return cost !== null ? cost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "—";
            }}
          />
          <MiniList
            title="Maior volume de resultados"
            items={ranking.byHighestVolume}
            valueLabel=""
            getValue={(item) => {
              const count = item.conversationsStarted ?? item.leads ?? item.purchases ?? item.conversions;
              return String(count ?? 0);
            }}
          />
          <MiniList
            title="Maior CTR"
            items={ranking.byHighestCtr}
            valueLabel="CTR"
            getValue={(item) => `${item.ctr.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`}
          />
          <MiniList
            title="Maior investimento"
            items={ranking.byHighestSpend}
            valueLabel=""
            getValue={(item) => item.spend.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          />
        </div>
      </div>

      {ranking.needsAttention.length > 0 ? (
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <AlertTriangle size={16} className="text-amber-400" />
            Criativos que merecem atenção
          </h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ranking.needsAttention.map((creative, index) => (
              <CreativeCard
                key={`${creative.adId ?? creative.adName}-attn-${index}`}
                creative={creative}
                resultLens={resultLens}
                badge={badgeMap.get(creative)}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <h3 className="text-sm font-semibold text-ink">Todos os criativos</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {creatives.map((creative, index) => (
            <CreativeCard
              key={`${creative.adId ?? creative.adName}-${index}`}
              creative={creative}
              resultLens={resultLens}
              badge={badgeMap.get(creative)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
