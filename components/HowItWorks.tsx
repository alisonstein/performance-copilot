import { CircuitBoard, Plug, SquareCheckBig } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const steps = [
  {
    number: "01",
    icon: Plug,
    title: "Conecte ou importe",
    description:
      "Conecte suas fontes de dados ou envie os dados da campanha.",
  },
  {
    number: "02",
    icon: CircuitBoard,
    title: "O Copilot analisa",
    description:
      "A plataforma encontra variações, gargalos, oportunidades e tendências.",
  },
  {
    number: "03",
    icon: SquareCheckBig,
    title: "Você decide",
    description:
      "Receba recomendações e relatórios prontos para transformar análise em ação.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="section-pad scroll-mt-20 border-t border-border">
      <div className="container-page">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="section-heading text-balance">Como funciona</h2>
            <p className="section-subheading">
              Três passos entre os dados brutos e uma decisão clara.
            </p>
          </div>
        </Reveal>

        <div className="relative mt-14 grid gap-8 sm:grid-cols-3">
          <div
            className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent sm:block"
            aria-hidden="true"
          />
          {steps.map((step, index) => (
            <Reveal key={step.number} delay={index * 0.1}>
              <div className="relative flex flex-col items-center text-center sm:items-start sm:text-left">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-card">
                  <step.icon size={26} className="text-primary-light" />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">
                    {step.number}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-secondary">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
