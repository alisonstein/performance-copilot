"use client";

import { useMemo, useState } from "react";
import { BarChart3, Clock, Wallet } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { MetricBarChart } from "@/components/dashboard/MetricBarChart";
import { GroupedTable } from "@/components/dashboard/GroupedTable";
import { AdsTable } from "@/components/dashboard/AdsTable";
import { CreativesTab } from "@/components/dashboard/CreativesTab";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { PeriodComparison } from "@/components/dashboard/PeriodComparison";
import { CopySummaryButton } from "@/components/dashboard/CopySummaryButton";
import { DemoBanner } from "@/components/dashboard/DemoBanner";
import { TabNav, type TabItem } from "@/components/dashboard/TabNav";
import { FiltersBar, type AnalysisFilters } from "@/components/dashboard/FiltersBar";
import {
  formatBRL,
  formatFrequency,
  formatNumber,
  formatNumberOrDash,
  formatPercent,
  formatRoas,
} from "@/lib/analysis/metrics";
import { aggregateTotals } from "@/lib/analysis/metrics";
import { groupByAdset, groupByCampaign } from "@/lib/analysis/aggregate";
import { buildClientSummaryV2 } from "@/lib/analysis/client-summary";
import { buildManagerReading } from "@/lib/analysis/manager-summary";
import { detectEfficiencyDrop } from "@/lib/analysis/compare";
import { getPrimaryResultCost, getPrimaryResultCount, PRIMARY_RESULT_COST_LABELS, PRIMARY_RESULT_LABELS } from "@/lib/analysis/primary-result";
import { formatDateRange } from "@/lib/format-date";
import { PLATFORM_LABELS } from "@/lib/constants";
import type { TotalsComparison } from "@/lib/analysis/compare";
import type { AiAnalysisResult, CampaignMetrics, MetricsTotals, PrimaryResultType } from "@/types/domain";
import type { Platform } from "@/types/database";

interface AnalysisResultViewProps {
  clientName: string;
  platform: Platform;
  startDate: string;
  endDate: string;
  fileName?: string | null;
  primaryResultType: PrimaryResultType;
  totals: MetricsTotals;
  campaigns: CampaignMetrics[];
  aiResult: AiAnalysisResult;
  comparison?: TotalsComparison | null;
  previousPeriodLabel?: string | null;
  isDemo?: boolean;
}

const TABS: TabItem[] = [
  { key: "overview", label: "Visão Geral" },
  { key: "campaigns", label: "Campanhas" },
  { key: "adsets", label: "Conjuntos" },
  { key: "ads", label: "Anúncios" },
  { key: "creatives", label: "Criativos" },
  { key: "insights", label: "Insights" },
];

export function AnalysisResultView({
  clientName,
  platform,
  startDate,
  endDate,
  fileName,
  primaryResultType,
  totals,
  campaigns,
  aiResult,
  comparison,
  previousPeriodLabel,
  isDemo,
}: AnalysisResultViewProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [filters, setFilters] = useState<AnalysisFilters>({
    search: "",
    status: "all",
    campaign: "all",
    resultLens: primaryResultType,
  });

  const campaignOptions = useMemo(
    () => Array.from(new Set(campaigns.map((c) => c.campaignName))).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [campaigns]
  );
  const hasStatusData = useMemo(() => campaigns.some((c) => c.status !== null), [campaigns]);

  const filteredCampaigns = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return campaigns.filter((c) => {
      if (filters.campaign !== "all" && c.campaignName !== filters.campaign) return false;
      if (filters.status !== "all" && c.status !== filters.status) return false;
      if (search) {
        const haystack = `${c.campaignName} ${c.adsetName ?? ""} ${c.adName ?? ""}`.toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  }, [campaigns, filters]);

  const filteredTotals = useMemo(() => aggregateTotals(filteredCampaigns), [filteredCampaigns]);
  const isFiltered = filteredCampaigns.length !== campaigns.length;

  const groupedByCampaign = useMemo(() => groupByCampaign(filteredCampaigns), [filteredCampaigns]);
  const groupedByAdset = useMemo(() => groupByAdset(filteredCampaigns), [filteredCampaigns]);

  const resultLens = filters.resultLens;

  const accountAverageCost = getPrimaryResultCost(filteredTotals, resultLens) ?? 0;

  const resultCount = getPrimaryResultCount(filteredTotals, resultLens);
  const resultCost = getPrimaryResultCost(filteredTotals, resultLens);

  const managerReading = useMemo(() => {
    if (!comparison) return null;
    return buildManagerReading(totals, comparison);
  }, [comparison, totals]);

  const efficiencyDropAlert = useMemo(() => {
    if (!comparison || !previousPeriodLabel) return null;
    return detectEfficiencyDrop(comparison, totals, previousPeriodLabel);
  }, [comparison, previousPeriodLabel, totals]);

  const displayAlerts = useMemo(
    () => (efficiencyDropAlert ? [efficiencyDropAlert, ...aiResult.alerts] : aiResult.alerts),
    [efficiencyDropAlert, aiResult.alerts]
  );

  const clientSummary = useMemo(() => {
    const adsetGroups = groupByAdset(campaigns);
    const withResult = adsetGroups
      .map((g) => ({ group: g, count: getPrimaryResultCount(g, primaryResultType) ?? 0, cost: getPrimaryResultCost(g, primaryResultType) }))
      .filter((g) => g.count > 0 && g.cost !== null);

    const standout = withResult.length > 0
      ? withResult.reduce((best, cur) => ((cur.cost as number) < (best.cost as number) ? cur : best)).group
      : null;

    const attentionCandidates = adsetGroups.filter((g) => g.spend > 0);
    const attention = attentionCandidates.length > 0
      ? attentionCandidates.reduce((worst, cur) => {
          const worstCost = getPrimaryResultCost(worst, primaryResultType);
          const curCost = getPrimaryResultCost(cur, primaryResultType);
          if (curCost === null && cur.conversions === 0 && worstCost !== null) return cur;
          if (curCost !== null && worstCost !== null && curCost > worstCost) return cur;
          return worst;
        })
      : null;

    return buildClientSummaryV2(totals, primaryResultType, standout, attention);
  }, [campaigns, totals, primaryResultType]);

  return (
    <div className="flex flex-col gap-6">
      {isDemo ? <DemoBanner /> : null}

      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary">Resultado da análise</p>
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">{clientName}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-secondary">
          <span className="inline-flex items-center gap-1.5">
            <BarChart3 size={14} />
            {PLATFORM_LABELS[platform]}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock size={14} />
            {formatDateRange(startDate, endDate)}
          </span>
          {fileName ? (
            <span className="inline-flex items-center gap-1.5">
              <Wallet size={14} />
              {fileName}
            </span>
          ) : null}
          <span className="rounded-full border border-border bg-white/[0.03] px-2.5 py-0.5 text-xs">
            Resultado principal: {PRIMARY_RESULT_LABELS[primaryResultType]}
          </span>
        </div>
      </div>

      <TabNav tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab !== "insights" ? (
        <FiltersBar filters={filters} onChange={(next) => setFilters((prev) => ({ ...prev, ...next }))} campaignOptions={campaignOptions} hasStatusData={hasStatusData} />
      ) : null}

      {isFiltered && activeTab !== "insights" ? (
        <p className="text-xs text-ink-secondary">
          Mostrando {filteredCampaigns.length} de {campaigns.length} anúncio(s) com os filtros aplicados.
        </p>
      ) : null}

      {activeTab === "overview" ? (
        <div className="flex flex-col gap-6">
          {comparison && previousPeriodLabel ? (
            <PeriodComparison comparison={comparison} previousPeriodLabel={previousPeriodLabel} />
          ) : null}

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Investimento" value={formatBRL(filteredTotals.spend)} />
            <StatCard label="Alcance" value={formatNumberOrDash(filteredTotals.reach)} />
            <StatCard label="Impressões" value={formatNumber(filteredTotals.impressions)} />
            <StatCard label="Frequência" value={formatFrequency(filteredTotals.frequency)} />
            <StatCard label="Cliques no link" value={formatNumberOrDash(filteredTotals.linkClicks)} />
            <StatCard label="CTR" value={formatPercent(filteredTotals.ctr)} />
            <StatCard label="CPC" value={formatBRL(filteredTotals.cpc)} />
            <StatCard label="CPM" value={formatBRL(filteredTotals.cpm)} />
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label={PRIMARY_RESULT_LABELS[resultLens]} value={formatNumberOrDash(resultCount)} />
            <StatCard label={PRIMARY_RESULT_COST_LABELS[resultLens]} value={resultCost !== null ? formatBRL(resultCost) : "—"} />
            {resultLens === "purchases" || resultLens === "other" ? (
              <>
                <StatCard label="Receita" value={formatBRL(filteredTotals.revenue)} />
                <StatCard label="ROAS" value={filteredTotals.spend > 0 ? formatRoas(filteredTotals.roas) : "—"} />
              </>
            ) : null}
          </div>

          <MetricBarChart rows={groupedByCampaign} resultLens={resultLens} />
        </div>
      ) : null}

      {activeTab === "campaigns" ? (
        <GroupedTable
          rows={groupedByCampaign}
          nameMode="campaign"
          resultLens={resultLens}
          columns={["name", "status", "spend", "reach", "impressions", "frequency", "clicks", "linkClicks", "ctr", "cpc", "cpm", "result", "resultCost", "revenue", "roas"]}
        />
      ) : null}

      {activeTab === "adsets" ? (
        <GroupedTable
          rows={groupedByAdset}
          nameMode="adset"
          resultLens={resultLens}
          columns={["name", "status", "spend", "reach", "impressions", "frequency", "ctr", "cpc", "cpm", "result", "resultCost", "roas"]}
        />
      ) : null}

      {activeTab === "ads" ? <AdsTable ads={filteredCampaigns} resultLens={resultLens} /> : null}

      {activeTab === "creatives" ? (
        <CreativesTab creatives={filteredCampaigns} resultLens={resultLens} accountAverageCost={accountAverageCost} />
      ) : null}

      {activeTab === "insights" ? (
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-secondary">Resumo executivo</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink">{aiResult.executiveSummary}</p>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-secondary">Diagnóstico</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">{aiResult.diagnosis}</p>
          </section>

          {managerReading ? (
            <section className="card-surface p-5 sm:p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-secondary">Leitura do gestor</h2>
              <ul className="mt-3 space-y-1.5 text-sm text-ink-secondary">
                {managerReading.bullets.map((bullet, index) => (
                  <li key={index}>• {bullet}</li>
                ))}
              </ul>
              <p className="mt-3 text-sm leading-relaxed text-ink">{managerReading.conclusion}</p>
            </section>
          ) : null}

          {displayAlerts.length > 0 ? (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-secondary">Alertas</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {displayAlerts.map((alert, index) => (
                  <InsightCard key={index} variant="alert" title={alert.title} description={alert.description} severity={alert.severity} />
                ))}
              </div>
            </section>
          ) : null}

          {aiResult.opportunities.length > 0 ? (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-secondary">Oportunidades</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {aiResult.opportunities.map((opportunity, index) => (
                  <InsightCard key={index} variant="opportunity" title={opportunity.title} description={opportunity.description} />
                ))}
              </div>
            </section>
          ) : null}

          {aiResult.recommendations.length > 0 ? (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-secondary">Recomendações</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {aiResult.recommendations.map((recommendation, index) => (
                  <InsightCard
                    key={index}
                    variant="recommendation"
                    title={recommendation.title}
                    description={recommendation.description}
                    severity={recommendation.priority}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <section className="card-surface p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-secondary">Resumo para cliente</h2>
              <CopySummaryButton text={clientSummary} />
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-ink">{clientSummary}</p>
          </section>
        </div>
      ) : null}
    </div>
  );
}
