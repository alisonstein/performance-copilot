import { ArrowDownRight, ArrowUpRight, Copy, FileDown, Presentation } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

export function ReportSection() {
  return (
    <section className="section-pad border-t border-border bg-bg-secondary/30">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <div>
            <h2 className="section-heading text-balance">
              Relatórios que seu cliente realmente entende.
            </h2>
            <p className="section-subheading">
              Nada de planilhas confusas. O Copilot organiza os números e
              escreve o resumo executivo para você revisar e enviar.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="card-surface p-5 sm:p-7">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-secondary">
                  Relatório
                </p>
                <p className="text-[15px] font-semibold text-ink">Agosto</p>
              </div>
              <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-medium text-accent">
                Pronto
              </span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div>
                <p className="text-[11px] text-ink-secondary">Investimento</p>
                <p className="mt-1 text-base font-semibold text-ink">
                  R$ 8.240
                </p>
              </div>
              <div>
                <p className="text-[11px] text-ink-secondary">Leads</p>
                <p className="mt-1 flex items-center gap-1 text-base font-semibold text-ink">
                  418
                  <span className="flex items-center text-[11px] font-medium text-accent">
                    <ArrowUpRight size={12} />
                    18,4%
                  </span>
                </p>
              </div>
              <div>
                <p className="text-[11px] text-ink-secondary">CPL</p>
                <p className="mt-1 flex items-center gap-1 text-base font-semibold text-ink">
                  R$ 19,71
                  <span className="flex items-center text-[11px] font-medium text-accent">
                    <ArrowDownRight size={12} />
                    12,7%
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-border bg-white/[0.02] p-4">
              <p className="text-[11px] font-semibold tracking-wide text-primary-light">
                RESUMO IA
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-secondary">
                Agosto apresentou melhora relevante na eficiência das
                campanhas. Mesmo com aumento moderado de investimento, o
                volume de leads cresceu 18,4%, enquanto o custo por lead caiu
                12,7%.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white/[0.02] px-3.5 py-2 text-[13px] font-medium text-ink-secondary transition-colors hover:bg-white/[0.05] hover:text-ink"
              >
                <FileDown size={14} />
                Exportar PDF
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white/[0.02] px-3.5 py-2 text-[13px] font-medium text-ink-secondary transition-colors hover:bg-white/[0.05] hover:text-ink"
              >
                <Copy size={14} />
                Copiar resumo
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white/[0.02] px-3.5 py-2 text-[13px] font-medium text-ink-secondary transition-colors hover:bg-white/[0.05] hover:text-ink"
              >
                <Presentation size={14} />
                Gerar apresentação
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
