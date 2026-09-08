"use client";

import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { links } from "@/config/site";
import { trackEvent } from "@/lib/analytics";

export function TrialSection() {
  return (
    <section className="section-pad">
      <div className="container-page">
        <Reveal>
          <div className="card-surface relative overflow-hidden px-6 py-14 text-center sm:px-12 sm:py-16">
            <div
              className="pointer-events-none absolute inset-0 bg-hero-glow opacity-60"
              aria-hidden="true"
            />
            <div className="relative">
              <h2 className="section-heading text-balance mx-auto max-w-2xl">
                Veja o Performance Copilot analisando suas próprias
                campanhas.
              </h2>
              <p className="section-subheading mx-auto max-w-xl">
                Teste gratuitamente e descubra quais insights você está
                deixando passar.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3">
                <a
                  href={links.TRIAL_URL}
                  className="btn-primary"
                  onClick={() =>
                    trackEvent("start_trial", { location: "trial_section" })
                  }
                >
                  Começar teste grátis
                  <ArrowRight size={17} />
                </a>
                <p className="text-sm text-ink-secondary">
                  Sem cartão de crédito.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
