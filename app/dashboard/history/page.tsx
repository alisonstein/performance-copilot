import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, History } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { requireUser } from "@/lib/supabase/auth";
import { formatBRL } from "@/lib/analysis/metrics";
import { formatDateRange } from "@/lib/format-date";
import { PLATFORM_LABELS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Histórico",
};

export default async function HistoryPage() {
  const { supabase, user } = await requireUser();

  const { data: analyses } = await supabase
    .from("analyses")
    .select("id, platform, start_date, end_date, total_spend, cpa, status, clients(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">Histórico</h1>
        <p className="mt-1 text-[15px] text-ink-secondary">Todas as análises realizadas, de todos os clientes.</p>
      </div>

      {!analyses || analyses.length === 0 ? (
        <EmptyState
          icon={History}
          title="Nenhuma análise realizada ainda."
          description="Suba um CSV de campanhas para receber o primeiro diagnóstico."
          ctaLabel="Criar primeira análise"
          ctaHref="/dashboard/analysis/new"
        />
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-secondary">
                  <th className="px-5 py-3.5 font-medium">Cliente</th>
                  <th className="px-5 py-3.5 font-medium">Plataforma</th>
                  <th className="px-5 py-3.5 font-medium">Período</th>
                  <th className="px-5 py-3.5 font-medium">Investimento</th>
                  <th className="px-5 py-3.5 font-medium">CPA</th>
                  <th className="px-5 py-3.5 font-medium text-right">&nbsp;</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {analyses.map((analysis) => {
                  const clientName =
                    (analysis as unknown as { clients: { name: string } | null }).clients?.name ?? "Cliente";
                  return (
                    <tr key={analysis.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="px-5 py-4 font-medium text-ink">{clientName}</td>
                      <td className="px-5 py-4 text-ink-secondary">
                        {PLATFORM_LABELS[analysis.platform as "meta_ads" | "google_ads"]}
                      </td>
                      <td className="px-5 py-4 text-ink-secondary">
                        {formatDateRange(analysis.start_date, analysis.end_date)}
                      </td>
                      <td className="px-5 py-4 text-ink-secondary">{formatBRL(Number(analysis.total_spend ?? 0))}</td>
                      <td className="px-5 py-4 text-ink-secondary">
                        {analysis.cpa ? formatBRL(Number(analysis.cpa)) : "—"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/dashboard/analysis/${analysis.id}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary-light hover:underline"
                        >
                          Ver análise
                          <ArrowRight size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
