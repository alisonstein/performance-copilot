import { AlertCircle, CheckCircle2, TrendingUp } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const agencyFeatures = [
  "Múltiplos clientes",
  "Dashboards individuais",
  "Organização por conta",
  "Relatórios com sua marca",
  "Histórico de performance",
  "Visão geral da carteira",
  "Alertas por cliente",
];

const clients = [
  {
    name: "COT",
    status: "CPA estável",
    tone: "neutral" as const,
    icon: CheckCircle2,
  },
  {
    name: "Extra Caminhões",
    status: "CPA +18% · Atenção",
    tone: "warning" as const,
    icon: AlertCircle,
  },
  {
    name: "Supermercado Imperial",
    status: "ROAS +21% · Oportunidade",
    tone: "positive" as const,
    icon: TrendingUp,
  },
];

const toneStyles = {
  neutral: "text-ink-secondary border-border bg-white/[0.02]",
  warning: "text-amber-400 border-amber-400/20 bg-amber-400/10",
  positive: "text-accent border-accent/20 bg-accent/10",
};

export function AgencySection() {
  return (
    <section id="agencias" className="section-pad scroll-mt-20">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <div>
            <h2 className="section-heading text-balance">
              Gerencie dezenas de clientes sem perder o controle.
            </h2>
            <p className="section-subheading">
              Uma visão única da carteira, com detalhe por conta quando você
              precisar entrar a fundo.
            </p>

            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {agencyFeatures.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2.5 text-sm text-ink-secondary"
                >
                  <CheckCircle2 size={16} className="shrink-0 text-primary-light" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="card-surface p-5 sm:p-7">
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-secondary">
              Clientes
            </p>
            <div className="mt-4 space-y-2.5">
              {clients.map((client) => (
                <div
                  key={client.name}
                  className="flex items-center justify-between rounded-xl border border-border bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-accent/10 text-xs font-semibold text-ink">
                      {client.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-ink">
                      {client.name}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${toneStyles[client.tone]}`}
                  >
                    <client.icon size={12} />
                    {client.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
