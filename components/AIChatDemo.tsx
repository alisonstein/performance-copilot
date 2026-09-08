import { Info, Sparkles, User } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const exchanges = [
  {
    question: "Por que meu CPA aumentou esta semana?",
    answer:
      "O CPA aumentou 21%. O principal impacto veio do conjunto Broad, que teve queda de 17% na taxa de conversão. O CPM permaneceu estável, então o gargalo parece estar após o clique.",
  },
  {
    question: "Quais criativos devo analisar?",
    answer:
      "Os criativos Video 04 e Static 07 apresentam CPA mais de 40% acima da média.",
  },
];

export function AIChatDemo() {
  return (
    <section className="section-pad border-t border-border bg-bg-secondary/30">
      <div className="container-page">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="section-heading text-balance">
              Pergunte para suas campanhas.
            </h2>
            <p className="section-subheading">
              Converse com o Copilot como faria com um analista — sem esperar
              pela próxima reunião.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="card-surface mx-auto mt-12 max-w-2xl p-4 sm:p-6">
            <div className="space-y-4">
              {exchanges.map((exchange) => (
                <div key={exchange.question} className="space-y-3">
                  <div className="flex items-start justify-end gap-2.5">
                    <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-white/[0.06] px-4 py-3 text-[13px] leading-relaxed text-ink">
                      {exchange.question}
                    </div>
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-card">
                      <User size={13} className="text-ink-secondary" />
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent">
                      <Sparkles size={13} className="text-white" />
                    </div>
                    <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-border bg-white/[0.03] px-4 py-3 text-[13px] leading-relaxed text-ink-secondary">
                      {exchange.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-xs text-ink-secondary">
              <Info size={14} className="shrink-0" />
              As recomendações ajudam na análise. A decisão final continua
              sendo do gestor.
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
