import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight, BarChart3, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { requireUser } from "@/lib/supabase/auth";
import { formatBRL } from "@/lib/analysis/metrics";
import { formatMonthYear } from "@/lib/format-date";
import { PLATFORM_LABELS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Cliente",
};

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();

  const { data: client } = await supabase
    .from("clients")
    .select("id, name, category, notes, created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!client) {
    notFound();
  }

  const { data: analyses } = await supabase
    .from("analyses")
    .select("id, platform, start_date, end_date, total_spend, cpa, conversions, status, created_at")
    .eq("client_id", client.id)
    .eq("user_id", user.id)
    .order("start_date", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-secondary">Cliente</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">{client.name}</h1>
          <p className="mt-1 text-sm text-ink-secondary">{client.category || "Sem categoria"}</p>
          {client.notes ? <p className="mt-2 max-w-xl text-sm text-ink-secondary">{client.notes}</p> : null}
        </div>
        <Link
          href={`/dashboard/analysis/new?clientId=${client.id}`}
          className="btn-primary shrink-0 !px-5 !py-2.5 !text-sm"
        >
          <Sparkles size={16} />
          Nova análise
        </Link>
      </div>

      <div>
        <h2 className="text-[15px] font-semibold text-ink">Histórico de análises</h2>

        {!analyses || analyses.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              icon={BarChart3}
              title="Nenhuma análise realizada ainda."
              description="Suba um CSV de campanhas para este cliente e receba o primeiro diagnóstico."
              ctaLabel="Criar primeira análise"
              ctaHref={`/dashboard/analysis/new?clientId=${client.id}`}
            />
          </div>
        ) : (
          <div className="card-surface mt-4 divide-y divide-border">
            {analyses.map((analysis) => (
              <Link
                key={analysis.id}
                href={`/dashboard/analysis/${analysis.id}`}
                className="flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{formatMonthYear(analysis.start_date)}</p>
                  <p className="text-xs text-ink-secondary">
                    {PLATFORM_LABELS[analysis.platform as "meta_ads" | "google_ads"]}
                    {analysis.status === "failed" ? " · Falhou" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-5">
                  <div className="text-right">
                    <p className="text-sm font-medium text-ink">{formatBRL(Number(analysis.total_spend ?? 0))}</p>
                    <p className="text-xs text-ink-secondary">
                      CPA {analysis.cpa ? formatBRL(Number(analysis.cpa)) : "—"}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-light">
                    Ver análise
                    <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
