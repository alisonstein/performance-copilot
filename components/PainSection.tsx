import { Clock3, FileWarning, MessageCircleWarning, TimerReset } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

const painPoints = [
  {
    number: "01",
    icon: Clock3,
    title: "Horas analisando métricas",
    description:
      "Você entra no Meta, Google, planilhas e dashboards só para entender o que mudou.",
  },
  {
    number: "02",
    icon: FileWarning,
    title: "Relatórios manuais",
    description:
      "Todo fim de mês a mesma rotina: copiar números, calcular variações e escrever explicações.",
  },
  {
    number: "03",
    icon: TimerReset,
    title: "Decisões atrasadas",
    description:
      "O CPA sobe hoje e você só percebe quando a verba já foi embora.",
  },
  {
    number: "04",
    icon: MessageCircleWarning,
    title: "Clientes sem entender",
    description:
      "Você sabe que a campanha melhorou. O cliente só vê um monte de números.",
  },
];

export function PainSection() {
  return (
    <section className="section-pad">
      <div className="container-page">
        <Reveal>
          <h2 className="section-heading text-balance max-w-2xl">
            Gerenciar campanha já dá trabalho. Entender tudo não deveria dar
            mais.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {painPoints.map((point, index) => (
            <Reveal key={point.number} delay={index * 0.06}>
              <div className="card-surface h-full p-6 transition-colors hover:bg-white/[0.02]">
                <span className="text-sm font-semibold text-primary-light">
                  {point.number}
                </span>
                <point.icon size={22} className="mb-2 mt-3 text-ink-secondary" />
                <h3 className="text-[17px] font-semibold text-ink">
                  {point.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                  {point.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mt-12 text-center text-lg font-medium text-ink sm:text-xl">
            O Performance Copilot transforma dados em decisões.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
