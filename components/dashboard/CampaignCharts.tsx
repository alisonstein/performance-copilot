"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatBRL } from "@/lib/analysis/metrics";
import type { CampaignMetrics } from "@/types/domain";

interface CampaignChartsProps {
  campaigns: CampaignMetrics[];
}

const MAX_CHART_ITEMS = 8;

function truncateLabel(value: string, max = 14): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function ChartTooltip({
  active,
  payload,
  label,
  valueLabel,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
  valueLabel: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-bg-secondary px-3 py-2 text-xs shadow-soft">
      <p className="font-medium text-ink">{label}</p>
      <p className="mt-0.5 text-ink-secondary">
        {valueLabel}: <span className="text-ink">{formatBRL(payload[0].value)}</span>
      </p>
    </div>
  );
}

export function CampaignCharts({ campaigns }: CampaignChartsProps) {
  const bySpend = [...campaigns]
    .sort((a, b) => b.spend - a.spend)
    .slice(0, MAX_CHART_ITEMS)
    .map((c) => ({ name: truncateLabel(c.campaignName), fullName: c.campaignName, value: c.spend }));

  const byCpa = [...campaigns]
    .filter((c) => c.conversions > 0)
    .sort((a, b) => b.cpa - a.cpa)
    .slice(0, MAX_CHART_ITEMS)
    .map((c) => ({ name: truncateLabel(c.campaignName), fullName: c.campaignName, value: c.cpa }));

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="card-surface p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-ink">Investimento por campanha</h3>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bySpend} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: "#9EA6BC", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                tickLine={false}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={50}
              />
              <YAxis tick={{ fill: "#9EA6BC", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
                content={<ChartTooltip valueLabel="Investimento" />}
              />
              <Bar dataKey="value" fill="#7157FF" radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-surface p-5 sm:p-6">
        <h3 className="text-sm font-semibold text-ink">CPA por campanha</h3>
        <div className="mt-4 h-64">
          {byCpa.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-ink-secondary">
              Nenhuma campanha com conversões no período.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byCpa} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#9EA6BC", fontSize: 11 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                  tickLine={false}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                  height={50}
                />
                <YAxis tick={{ fill: "#9EA6BC", fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  content={<ChartTooltip valueLabel="CPA" />}
                />
                <Bar dataKey="value" fill="#2ED3B7" radius={[6, 6, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
