"use client";

import { ArrowRight, PlayCircle } from "lucide-react";
import { DashboardMockup } from "@/components/DashboardMockup";
import { Reveal } from "@/components/ui/Reveal";
import { links } from "@/config/site";
import { trackEvent } from "@/lib/analytics";

export function Hero() {
  return (
    <section id="produto" className="relative overflow-hidden scroll-mt-20">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[640px] bg-grid-fade"
        aria-hidden="true"
      />

      <div className="container-page grid items-center gap-12 pb-16 pt-10 sm:pb-20 sm:pt-14 lg:grid-cols-2 lg:gap-10 lg:pb-28 lg:pt-16">
        <div>
          <Reveal>
            <span className="eyebrow">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              IA para gestores de tráfego
            </span>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="text-balance mt-5 text-[2.35rem] font-semibold leading-[1.12] tracking-tight text-ink sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              Descubra em minutos{" "}
              <span className="bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
                o que pausar, escalar e corrigir nas suas campanhas.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="section-subheading max-w-xl">
              Transforme dados do Meta Ads e Google Ads em análises, alertas,
              recomendações e relatórios prontos para seus clientes.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href={links.TRIAL_URL}
                className="btn-primary"
                onClick={() =>
                  trackEvent("click_cta_hero", { location: "hero_primary" })
                }
              >
                Quero testar o Performance Copilot
                <ArrowRight size={17} />
              </a>
              <a href="#como-funciona" className="btn-secondary">
                <PlayCircle size={17} />
                Ver como funciona
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.32}>
            <p className="mt-4 text-sm text-ink-secondary">
              Sem cartão de crédito &middot; Configure em poucos minutos
            </p>
            <p className="mt-1 text-sm text-ink-secondary">
              Feito para gestores de tráfego, freelancers e agências.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.2} className="lg:pl-4">
          <DashboardMockup />
        </Reveal>
      </div>
    </section>
  );
}
