import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Users } from "lucide-react";
import { NewClientDialog } from "@/components/dashboard/NewClientDialog";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { requireUser } from "@/lib/supabase/auth";
import { formatBRL } from "@/lib/analysis/metrics";

export const metadata: Metadata = {
  title: "Clientes",
};

export default async function ClientsPage() {
  const { supabase, user } = await requireUser();

  const [{ data: clients }, { data: analyses }] = await Promise.all([
    supabase
      .from("clients")
      .select("id, name, category, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("analyses")
      .select("id, client_id, cpa, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const analysesByClient = new Map<string, { count: number; lastCpa: number; lastDate: string }>();
  for (const analysis of analyses ?? []) {
    const existing = analysesByClient.get(analysis.client_id);
    if (existing) {
      existing.count += 1;
    } else {
      analysesByClient.set(analysis.client_id, {
        count: 1,
        lastCpa: Number(analysis.cpa ?? 0),
        lastDate: analysis.created_at,
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">Clientes</h1>
          <p className="mt-1 text-[15px] text-ink-secondary">Gerencie os clientes das suas campanhas.</p>
        </div>
        <NewClientDialog />
      </div>

      {!clients || clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Você ainda não cadastrou nenhum cliente."
          description="Adicione o primeiro cliente para começar a subir análises de campanhas."
        />
      ) : (
        <div className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-ink-secondary">
                  <th className="px-5 py-3.5 font-medium">Cliente</th>
                  <th className="px-5 py-3.5 font-medium">Categoria</th>
                  <th className="px-5 py-3.5 font-medium">Análises</th>
                  <th className="px-5 py-3.5 font-medium">CPA (última análise)</th>
                  <th className="px-5 py-3.5 font-medium text-right">&nbsp;</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clients.map((client) => {
                  const stats = analysesByClient.get(client.id);
                  return (
                    <tr key={client.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="px-5 py-4 font-medium text-ink">{client.name}</td>
                      <td className="px-5 py-4 text-ink-secondary">{client.category || "—"}</td>
                      <td className="px-5 py-4 text-ink-secondary">{stats?.count ?? 0}</td>
                      <td className="px-5 py-4 text-ink-secondary">
                        {stats && stats.lastCpa > 0 ? formatBRL(stats.lastCpa) : "—"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/dashboard/clients/${client.id}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary-light hover:underline"
                        >
                          Ver cliente
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
