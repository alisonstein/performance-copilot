"use client";

import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { links } from "@/config/site";
import { trackEvent } from "@/lib/analytics";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden border-t border-border">
      <div
        className="pointer-events-none absolute inset-0 bg-hero-glow"
        aria-hidden="true"
      />
      <div className="container-page section-pad relative text-center">
        <Reveal>
          <h2 className="section-heading text-balance mx-auto max-w-2xl">
            Pare de procurar problemas nas suas campanhas.
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="section-subheading mx-auto max-w-xl">
            Deixe o Performance Copilot mostrar onde você precisa olhar.
          </p>
        </Reveal>
        <Reveal delay={0.16}>
          <div className="mt-8 flex flex-col items-center gap-3">
            <a
              href={links.TRIAL_URL}
              className="btn-primary !px-8 !py-4 !text-base"
              onClick={() =>
                trackEvent("start_trial", { location: "final_cta" })
              }
            >
              TESTAR GRÁTIS
              <ArrowRight size={19} />
            </a>
            <p className="text-sm text-ink-secondary">
              Sem cartão de crédito.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
