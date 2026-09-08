import type { Metadata } from "next";
import { Building2, CreditCard, Mail, User } from "lucide-react";
import { getOrCreateProfile, requireUser } from "@/lib/supabase/auth";
import { getPlanLimits } from "@/lib/plans/limits";

export const metadata: Metadata = {
  title: "Configurações",
};

function startOfMonthIso(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export default async function SettingsPage() {
  const { supabase, user } = await requireUser();
  const profile = await getOrCreateProfile(supabase, user.id, user.email);
  const limits = getPlanLimits(profile.plan);

  const [{ count: clientsCount }, { count: analysesThisMonth }] = await Promise.all([
    supabase.from("clients").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase
      .from("analyses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfMonthIso()),
  ]);

  const fields = [
    { icon: User, label: "Nome", value: profile.full_name || "—" },
    { icon: Building2, label: "Empresa", value: profile.company_name || "—" },
    { icon: Mail, label: "E-mail", value: profile.email },
  ];

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">Configurações</h1>
        <p className="mt-1 text-[15px] text-ink-secondary">Dados da sua conta e do seu plano.</p>
      </div>

      <div className="card-surface divide-y divide-border">
        {fields.map((field) => (
          <div key={field.label} className="flex items-center gap-3 px-5 py-4">
            <field.icon size={17} className="shrink-0 text-ink-secondary" />
            <div>
              <p className="text-xs text-ink-secondary">{field.label}</p>
              <p className="text-[15px] font-medium text-ink">{field.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card-surface p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CreditCard size={18} className="text-primary-light" />
            <div>
              <p className="text-xs text-ink-secondary">Plano atual</p>
              <p className="text-[15px] font-semibold text-ink">{limits.label}</p>
            </div>
          </div>
          <button
            type="button"
            disabled
            className="btn-secondary !px-4 !py-2.5 !text-sm opacity-60"
            title="Em breve"
          >
            Gerenciar plano
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-5">
          <div>
            <p className="text-xs text-ink-secondary">Clientes</p>
            <p className="mt-1 text-sm font-medium text-ink">
              {clientsCount ?? 0} de {limits.maxClients}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-secondary">Análises este mês</p>
            <p className="mt-1 text-sm font-medium text-ink">
              {analysesThisMonth ?? 0} de {limits.maxAnalysesPerMonth}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
