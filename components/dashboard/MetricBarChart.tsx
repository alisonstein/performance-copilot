"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatBRL, formatFrequency, formatNumberOrDash, formatPercent } from "@/lib/analysis/metrics";
import { getPrimaryResultCost, getPrimaryResultCount, PRIMARY_RESULT_LABELS } from "@/lib/analysis/primary-result";
import type { GroupedMetrics, PrimaryResultType } from "@/types/domain";

type MetricKey = "spend" | "result" | "resultCost" | "ctr" | "cpm" | "frequency";

const MAX_ITEMS = 8;

function truncateLabel(value: string, max = 14): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

interface MetricOption {
  key: MetricKey;
  label: string;
  color: string;
  format: (value: number) => string;
  getValue: (row: GroupedMetrics, resultLens: PrimaryResultType) => number | null;
}

export function MetricBarChart({ rows, resultLens }: { rows: GroupedMetrics[]; resultLens: PrimaryResultType }) {
  const options: MetricOption[] = useMemo(
    () => [
      { key: "spend", label: "Investimento", color: "#7157FF", format: formatBRL, getValue: (r) => r.spend },
      {
        key: "result",
        label: PRIMARY_RESULT_LABELS[resultLens],
        color: "#2ED3B7",
        format: (v) => formatNumberOrDash(v),
        getValue: (r, lens) => getPrimaryResultCount(r, lens),
      },
      {
        key: "resultCost",
        label: "Custo por resultado",
        color: "#8E7AFF",
        format: formatBRL,
        getValue: (r, lens) => getPrimaryResultCost(r, lens),
      },
      { key: "ctr", label: "CTR", color: "#2ED3B7", format: formatPercent, getValue: (r) => r.ctr },
      { key: "cpm", label: "CPM", color: "#7157FF", format: formatBRL, getValue: (r) => r.cpm },
      { key: "frequency", label: "Frequência", color: "#8E7AFF", format: (v) => formatFrequency(v), getValue: (r) => r.frequency },
    ],
    [resultLens]
  );

  const [metricKey, setMetricKey] = useState<MetricKey>("spend");
  const option = options.find((o) => o.key === metricKey) ?? options[0];

  const data = useMemo(() => {
    return [...rows]
      .map((row) => ({
        name: truncateLabel(row.campaignName),
        value: option.getValue(row, resultLens),
      }))
      .filter((d): d is { name: string; value: number } => d.value !== null)
      .sort((a, b) => b.value - a.value)
      .slice(0, MAX_ITEMS);
  }, [rows, option, resultLens]);

  return (
    <div className="card-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink">{option.label} por campanha</h3>
        <select
          value={metricKey}
          onChange={(event) => setMetricKey(event.target.value as MetricKey)}
          className="rounded-lg border border-border bg-white/[0.03] px-3 py-1.5 text-xs text-ink focus:border-primary-light focus:outline-none"
        >
          {options.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4 h-64">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-ink-secondary">
            Métrica não disponível para os dados desta análise.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
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
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  return (
                    <div className="rounded-lg border border-border bg-bg-secondary px-3 py-2 text-xs shadow-soft">
                      <p className="font-medium text-ink">{label}</p>
                      <p className="mt-0.5 text-ink-secondary">
                        {option.label}: <span className="text-ink">{option.format(payload[0].value as number)}</span>
                      </p>
                    </div>
                  );
                }}
              />
              <Bar dataKey="value" fill={option.color} radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
