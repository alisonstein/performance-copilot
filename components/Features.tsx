import {
  BellRing,
  Compass,
  FileText,
  GitCompare,
  LineChart,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { features } from "@/config/site";

const iconMap: Record<string, LucideIcon> = {
  LineChart,
  BellRing,
  Trophy,
  Compass,
  FileText,
  GitCompare,
};

export function Features() {
  return (
    <section id="recursos" className="section-pad scroll-mt-20">
      <div className="container-page">
        <Reveal>
          <div className="max-w-2xl">
            <h2 className="section-heading text-balance">
              Não é só um dashboard. É uma camada de inteligência sobre suas
              campanhas.
            </h2>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon] ?? LineChart;
            return (
              <Reveal key={feature.title} delay={index * 0.05}>
                <div className="card-surface h-full p-6 transition-all hover:-translate-y-0.5 hover:bg-white/[0.02]">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-gradient-to-br from-primary/15 to-accent/10">
                    <Icon size={20} className="text-primary-light" />
                  </div>
                  <h3 className="mt-4 text-[17px] font-semibold text-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                    {feature.description}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
