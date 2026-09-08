import { AlertTriangle } from "lucide-react";

export function ConfigPendingNotice() {
  return (
    <div className="card-surface flex items-start gap-3 border-amber-400/25 bg-amber-400/[0.06] p-5">
      <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-400" />
      <div>
        <p className="text-sm font-semibold text-ink">Configuração do Supabase pendente</p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">
          As variáveis <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> ainda não
          foram definidas em <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">.env.local</code>. Consulte o
          README para criar seu projeto Supabase e conectar a aplicação.
        </p>
      </div>
    </div>
  );
}
