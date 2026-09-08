import { Check, X } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const before = [
  "Abrir várias plataformas",
  "Exportar CSV",
  "Montar planilha",
  "Comparar períodos manualmente",
  "Procurar campanhas ruins",
  "Escrever relatório",
  "Explicar para o cliente",
];

const after = [
  "Dados centralizados",
  "Diagnóstico automático",
  "Alertas importantes",
  "Oportunidades destacadas",
  "Relatório pronto",
  "Recomendações de otimização",
];

export function BeforeAfter() {
  return (
    <section className="section-pad border-t border-border bg-bg-secondary/30">
      <div className="container-page">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="section-heading text-balance">
              De horas de análise para poucos minutos de revisão.
            </h2>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <Reveal delay={0.05}>
            <div className="card-surface h-full p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-ink">
                  Antes do Performance Copilot
                </h3>
                <span className="rounded-full border border-border bg-white/[0.03] px-3 py-1 text-xs font-medium text-ink-secondary">
                  2–4 horas
                </span>
              </div>
              <ul className="mt-5 space-y-3.5">
                {before.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-ink-secondary">
                    <X size={16} className="mt-0.5 shrink-0 text-red-400/70" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="card-surface relative h-full overflow-hidden border-primary/25 bg-gradient-to-b from-primary/[0.07] to-transparent p-6 sm:p-8">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-ink">
                  Com Performance Copilot
                </h3>
                <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                  Minutos
                </span>
              </div>
              <ul className="mt-5 space-y-3.5">
                {after.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-ink">
                    <Check size={16} className="mt-0.5 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
