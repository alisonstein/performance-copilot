import { BarChart3, Clock, Wallet } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { CampaignCharts } from "@/components/dashboard/CampaignCharts";
import { CampaignsTable } from "@/components/dashboard/CampaignsTable";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { PeriodComparison } from "@/components/dashboard/PeriodComparison";
import { CopySummaryButton } from "@/components/dashboard/CopySummaryButton";
import { DemoBanner } from "@/components/dashboard/DemoBanner";
import { formatBRL, formatNumber, formatPercent, formatRoas } from "@/lib/analysis/metrics";
import { buildClientSummary } from "@/lib/analysis/client-summary";
import { formatDateRange } from "@/lib/format-date";
import { PLATFORM_LABELS } from "@/lib/constants";
import type { TotalsComparison } from "@/lib/analysis/compare";
import type { AiAnalysisResult, CampaignMetrics, MetricsTotals } from "@/types/domain";
import type { Platform } from "@/types/database";

interface AnalysisResultViewProps {
  clientName: string;
  platform: Platform;
  startDate: string;
  endDate: string;
  fileName?: string | null;
  totals: MetricsTotals;
  campaigns: CampaignMetrics[];
  bestCampaigns: CampaignMetrics[];
  attentionCampaigns: CampaignMetrics[];
  aiResult: AiAnalysisResult;
  comparison?: TotalsComparison | null;
  previousPeriodLabel?: string | null;
  isDemo?: boolean;
}

export function AnalysisResultView({
  clientName,
  platform,
  startDate,
  endDate,
  fileName,
  totals,
  campaigns,
  bestCampaigns,
  attentionCampaigns,
  aiResult,
  comparison,
  previousPeriodLabel,
  isDemo,
}: AnalysisResultViewProps) {
  const clientSummary = buildClientSummary(totals, bestCampaigns[0] ?? null);

  return (
    <div className="flex flex-col gap-8">
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
        </div>
      </div>

      {comparison && previousPeriodLabel ? (
        <PeriodComparison comparison={comparison} previousPeriodLabel={previousPeriodLabel} />
      ) : null}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Investimento" value={formatBRL(totals.spend)} />
        <StatCard label="Conversões" value={formatNumber(totals.conversions)} />
        <StatCard label="CPA" value={totals.conversions > 0 ? formatBRL(totals.cpa) : "—"} />
        <StatCard label="CTR" value={formatPercent(totals.ctr)} />
        <StatCard label="CPC" value={formatBRL(totals.cpc)} />
        <StatCard label="CPM" value={formatBRL(totals.cpm)} />
        <StatCard label="ROAS" value={totals.spend > 0 ? formatRoas(totals.roas) : "—"} />
      </div>

      <CampaignCharts campaigns={campaigns} />

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-secondary">Resumo executivo</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink">{aiResult.executiveSummary}</p>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-secondary">Diagnóstico</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-secondary">{aiResult.diagnosis}</p>
      </section>

      {aiResult.alerts.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-secondary">Alertas</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {aiResult.alerts.map((alert, index) => (
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

      {bestCampaigns.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-secondary">Melhores campanhas</h2>
          <div className="mt-3">
            <CampaignsTable campaigns={bestCampaigns} />
          </div>
        </section>
      ) : null}

      {attentionCampaigns.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-secondary">Pontos de atenção</h2>
          <div className="mt-3">
            <CampaignsTable campaigns={attentionCampaigns} />
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-secondary">Todas as campanhas</h2>
        <div className="mt-3">
          <CampaignsTable campaigns={campaigns} />
        </div>
      </section>

      <section className="card-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-secondary">Resumo para cliente</h2>
          <CopySummaryButton text={clientSummary} />
        </div>
        <p className="mt-3 text-[15px] leading-relaxed text-ink">{clientSummary}</p>
      </section>
    </div>
  );
}
