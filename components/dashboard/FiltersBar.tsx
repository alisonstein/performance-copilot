"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { PRIMARY_RESULT_OPTIONS } from "@/lib/analysis/primary-result";
import { cn } from "@/lib/utils";
import type { CampaignStatus, PrimaryResultType } from "@/types/domain";

export interface AnalysisFilters {
  search: string;
  status: CampaignStatus | "all";
  campaign: string | "all";
  resultLens: PrimaryResultType;
}

interface FiltersBarProps {
  filters: AnalysisFilters;
  onChange: (next: Partial<AnalysisFilters>) => void;
  campaignOptions: string[];
  hasStatusData: boolean;
}

const selectClass =
  "w-full rounded-xl border border-border bg-white/[0.03] px-3.5 py-2.5 text-sm text-ink focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary-light";

export function FiltersBar({ filters, onChange, campaignOptions, hasStatusData }: FiltersBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeCount = [
    filters.search.trim() !== "",
    filters.status !== "all",
    filters.campaign !== "all",
  ].filter(Boolean).length;

  const fields = (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="relative">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-secondary" />
        <input
          type="text"
          value={filters.search}
          onChange={(event) => onChange({ search: event.target.value })}
          placeholder="Buscar campanha, conjunto ou anúncio"
          className={cn(selectClass, "pl-9")}
        />
      </div>

      <select
        value={filters.campaign}
        onChange={(event) => onChange({ campaign: event.target.value })}
        className={selectClass}
      >
        <option value="all">Todas as campanhas</option>
        {campaignOptions.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>

      <select
        value={filters.status}
        onChange={(event) => onChange({ status: event.target.value as CampaignStatus | "all" })}
        className={selectClass}
        disabled={!hasStatusData}
        title={hasStatusData ? undefined : "Este arquivo não trouxe status de campanha"}
      >
        <option value="all">Qualquer status</option>
        <option value="active">Ativo</option>
        <option value="paused">Pausado</option>
      </select>

      <select
        value={filters.resultLens}
        onChange={(event) => onChange({ resultLens: event.target.value as PrimaryResultType })}
        className={selectClass}
      >
        {PRIMARY_RESULT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            Ver como: {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="card-surface p-3 sm:p-4">
      <div className="flex items-center justify-between sm:hidden">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-ink"
        >
          <SlidersHorizontal size={16} />
          Filtros
          {activeCount > 0 ? (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
              {activeCount}
            </span>
          ) : null}
        </button>
        {isOpen ? (
          <button type="button" onClick={() => setIsOpen(false)} aria-label="Fechar filtros" className="text-ink-secondary">
            <X size={18} />
          </button>
        ) : null}
      </div>

      <div className={cn("mt-3 sm:mt-0", !isOpen && "hidden sm:block")}>{fields}</div>
    </div>
  );
}
