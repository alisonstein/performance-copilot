import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Lightbulb,
  Sparkles,
  Target,
} from "lucide-react";

const kpis = [
  { label: "Investimento", value: "R$ 12.480", change: "+8,2%", positive: true },
  { label: "Conversões", value: "387", change: "+14,6%", positive: true },
  { label: "CPA", value: "R$ 32,25", change: "-9,4%", positive: true },
  { label: "ROAS", value: "5,8x", change: "+0,6x", positive: true },
];

const insights = [
  {
    type: "ALERTA",
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    text: "CPA aumentou 22% nos últimos 7 dias.",
  },
  {
    type: "OPORTUNIDADE",
    icon: Lightbulb,
    color: "text-accent",
    bg: "bg-accent/10",
    border: "border-accent/20",
    text: 'Criativo "UGC 03" tem CPA 34% menor que a média.',
  },
  {
    type: "RECOMENDAÇÃO",
    icon: Target,
    color: "text-primary-light",
    bg: "bg-primary/10",
    border: "border-primary/20",
    text: 'Considere realocar verba do conjunto "Interesses" para "Broad".',
  },
];

const creatives = [
  { name: "Criativo 01", ctr: "3,8%", cpa: "R$ 21,40", width: "92%" },
  { name: "Criativo 02", ctr: "2,9%", cpa: "R$ 27,80", width: "68%" },
  { name: "Criativo 03", ctr: "1,1%", cpa: "R$ 54,20", width: "34%" },
];

const chartPoints = [38, 45, 40, 52, 48, 61, 58, 66, 62, 74, 70, 82];

function buildLinePath(points: number[], width: number, height: number) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const step = width / (points.length - 1);

  return points
    .map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / (max - min || 1)) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function DashboardMockup() {
  const chartWidth = 280;
  const chartHeight = 90;
  const linePath = buildLinePath(chartPoints, chartWidth, chartHeight);
  const areaPath = `${linePath} L${chartWidth},${chartHeight} L0,${chartHeight} Z`;

  return (
    <div className="relative w-full rounded-lg2 border border-border bg-bg-secondary/90 p-3 shadow-soft sm:p-4">
      <div className="pointer-events-none absolute -inset-x-10 -top-16 h-40 bg-hero-glow blur-3xl" aria-hidden="true" />

      <div className="relative rounded-card border border-border bg-card/60 p-4 sm:p-6">
        {/* Barra superior do "produto" */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div>
            <div className="flex items-center gap-2 text-[13px] font-semibold text-ink">
              <Sparkles size={14} className="text-accent" />
              Performance Copilot
            </div>
            <p className="mt-1 text-xs text-ink-secondary">
              Cliente: Loja Exemplo &middot; Últimos 30 dias
            </p>
          </div>
          <div className="hidden items-center gap-1.5 rounded-full border border-border bg-white/[0.02] px-3 py-1.5 text-[11px] font-medium text-ink-secondary sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Dados atualizados
          </div>
        </div>

        {/* KPIs */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="rounded-xl border border-border bg-white/[0.02] p-3.5 transition-colors hover:bg-white/[0.04] sm:p-4"
            >
              <p className="text-[11px] font-medium text-ink-secondary">
                {kpi.label}
              </p>
              <p className="mt-1.5 text-lg font-semibold text-ink sm:text-xl">
                {kpi.value}
              </p>
              <p
                className={`mt-1 flex items-center gap-1 text-[11px] font-medium ${
                  kpi.positive ? "text-accent" : "text-red-400"
                }`}
              >
                {kpi.positive ? (
                  <ArrowUpRight size={12} />
                ) : (
                  <ArrowDownRight size={12} />
                )}
                {kpi.change}
              </p>
            </div>
          ))}
        </div>

        {/* Chart + Insights */}
        <div className="mt-5 grid gap-3 lg:grid-cols-5">
          <div className="rounded-xl border border-border bg-white/[0.02] p-4 lg:col-span-2">
            <p className="text-[11px] font-medium text-ink-secondary">
              ROAS ao longo do período
            </p>
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="mt-3 w-full"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7157FF" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#7157FF" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#chart-fill)" />
              <path
                d={linePath}
                fill="none"
                stroke="#8E7AFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="mt-2 flex items-center justify-between text-[11px] text-ink-secondary">
              <span>Dia 1</span>
              <span>Dia 30</span>
            </div>
          </div>

          <div className="space-y-2.5 lg:col-span-3">
            <p className="text-[11px] font-medium text-ink-secondary">
              Copilot Insights
            </p>
            {insights.map((insight) => (
              <div
                key={insight.type}
                className={`flex items-start gap-2.5 rounded-xl border ${insight.border} ${insight.bg} p-3`}
              >
                <insight.icon size={15} className={`mt-0.5 shrink-0 ${insight.color}`} />
                <div>
                  <p className={`text-[10px] font-bold tracking-wide ${insight.color}`}>
                    {insight.type}
                  </p>
                  <p className="mt-0.5 text-[13px] leading-snug text-ink">
                    {insight.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top criativos */}
        <div className="mt-5 rounded-xl border border-border bg-white/[0.02] p-4">
          <p className="text-[11px] font-medium text-ink-secondary">
            Top criativos
          </p>
          <div className="mt-3 space-y-3">
            {creatives.map((creative) => (
              <div key={creative.name}>
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-medium text-ink">{creative.name}</span>
                  <span className="text-ink-secondary">
                    CTR {creative.ctr} &middot; CPA {creative.cpa}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    style={{ width: creative.width }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
