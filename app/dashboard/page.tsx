import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, BarChart3, Sparkles, Target, Users, Wallet } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { getOrCreateProfile, requireUser } from "@/lib/supabase/auth";
import { formatBRL } from "@/lib/analysis/metrics";
import { PLATFORM_LABELS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Visão Geral",
};

export default async function DashboardOverviewPage() {
  const { supabase, user } = await requireUser();
  const profile = await getOrCreateProfile(supabase, user.id, user.email);

  const [{ count: clientsCount }, { data: analyses, count: analysesCount }, { data: recentClients }] =
    await Promise.all([
      supabase.from("clients").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase
        .from("analyses")
        .select("id, total_spend, conversions, cpa, platform, created_at, status, client_id, clients(name)", {
          count: "exact",
        })
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("clients")
        .select("id, name, category, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const { data: totalsData } = await supabase
    .from("analyses")
    .select("total_spend, conversions")
    .eq("user_id", user.id);

  const totalSpend = (totalsData ?? []).reduce((sum, a) => sum + Number(a.total_spend ?? 0), 0);
  const totalConversions = (totalsData ?? []).reduce((sum, a) => sum + Number(a.conversions ?? 0), 0);
  const avgCpa = totalConversions > 0 ? totalSpend / totalConversions : 0;

  const firstName = (profile.full_name || "").split(" ")[0] || "por aqui";
  const hasClients = (clientsCount ?? 0) > 0;
  const hasAnalyses = (analysesCount ?? 0) > 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">
            Olá, {firstName}
          </h1>
          <p className="mt-1 text-[15px] text-ink-secondary">
            Veja o que está acontecendo nas suas contas.
          </p>
        </div>
        <Link href="/dashboard/analysis/new" className="btn-primary shrink-0 !px-5 !py-2.5 !text-sm">
          <Sparkles size={16} />
          Nova análise
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Clientes ativos" value={String(clientsCount ?? 0)} icon={Users} />
        <StatCard label="Análises realizadas" value={String(analysesCount ?? 0)} icon={BarChart3} />
        <StatCard label="Investimento analisado" value={formatBRL(totalSpend)} icon={Wallet} />
        <StatCard label="Média de CPA" value={avgCpa > 0 ? formatBRL(avgCpa) : "—"} icon={Target} />
      </div>

      {!hasClients ? (
        <EmptyState
          icon={Users}
          title="Você ainda não cadastrou nenhum cliente."
          description="Cadastre seu primeiro cliente para começar a subir análises de campanhas."
          ctaLabel="Adicionar primeiro cliente"
          ctaHref="/dashboard/clients"
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="card-surface p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-ink">Clientes recentes</h2>
              <Link href="/dashboard/clients" className="text-xs font-medium text-primary-light hover:underline">
                Ver todos
              </Link>
            </div>
            <ul className="mt-4 divide-y divide-border">
              {(recentClients ?? []).map((client) => (
                <li key={client.id}>
                  <Link
                    href={`/dashboard/clients/${client.id}`}
                    className="flex items-center justify-between gap-3 py-3 text-sm transition-colors hover:text-primary-light"
                  >
                    <span className="font-medium text-ink">{client.name}</span>
                    <span className="text-xs text-ink-secondary">{client.category || "Sem categoria"}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-surface p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-ink">Análises recentes</h2>
              <Link href="/dashboard/history" className="text-xs font-medium text-primary-light hover:underline">
                Ver histórico
              </Link>
            </div>

            {!hasAnalyses ? (
              <div className="mt-4">
                <EmptyState
                  icon={BarChart3}
                  title="Nenhuma análise realizada ainda."
                  description="Suba um CSV de campanhas para receber o primeiro diagnóstico."
                  ctaLabel="Criar primeira análise"
                  ctaHref="/dashboard/analysis/new"
                />
              </div>
            ) : (
              <ul className="mt-4 divide-y divide-border">
                {(analyses ?? []).map((analysis) => {
                  const clientName =
                    (analysis as unknown as { clients: { name: string } | null }).clients?.name ??
                    "Cliente";
                  return (
                    <li key={analysis.id}>
                      <Link
                        href={`/dashboard/analysis/${analysis.id}`}
                        className="flex items-center justify-between gap-3 py-3 text-sm transition-colors hover:text-primary-light"
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-ink">{clientName}</span>
                          <span className="text-xs text-ink-secondary">
                            {PLATFORM_LABELS[analysis.platform as "meta_ads" | "google_ads"]} ·{" "}
                            {formatBRL(Number(analysis.total_spend ?? 0))}
                          </span>
                        </span>
                        <ArrowRight size={15} className="shrink-0 text-ink-secondary" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
