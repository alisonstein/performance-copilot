"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { ANNUAL_MONTHS_CHARGED, plans } from "@/config/site";
import { trackEvent } from "@/lib/analytics";
import { cn, formatBRL } from "@/lib/utils";

type Cycle = "monthly" | "annual";

export function Pricing() {
  const [cycle, setCycle] = useState<Cycle>("monthly");

  useEffect(() => {
    trackEvent("view_pricing");
  }, []);

  return (
    <section id="precos" className="section-pad scroll-mt-20 border-t border-border">
      <div className="container-page">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="section-heading text-balance">
              Planos para cada estágio da sua operação
            </h2>
            <p className="section-subheading">
              Comece pequeno e escale conforme sua carteira de clientes
              cresce.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="mx-auto mt-8 flex w-fit items-center gap-1 rounded-full border border-border bg-card p-1">
            <button
              type="button"
              onClick={() => setCycle("monthly")}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                cycle === "monthly"
                  ? "bg-primary text-white"
                  : "text-ink-secondary hover:text-ink"
              )}
              aria-pressed={cycle === "monthly"}
            >
              Mensal
            </button>
            <button
              type="button"
              onClick={() => setCycle("annual")}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                cycle === "annual"
                  ? "bg-primary text-white"
                  : "text-ink-secondary hover:text-ink"
              )}
              aria-pressed={cycle === "annual"}
            >
              Anual
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                  cycle === "annual"
                    ? "bg-white/20 text-white"
                    : "bg-accent/15 text-accent"
                )}
              >
                2 meses grátis
              </span>
            </button>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const displayPrice =
              cycle === "monthly"
                ? plan.monthlyPrice
                : Math.round(
                    (plan.monthlyPrice * ANNUAL_MONTHS_CHARGED) / 12
                  );

            return (
              <Reveal key={plan.id} delay={index * 0.08}>
                <div
                  className={cn(
                    "relative flex h-full flex-col rounded-card border p-6 sm:p-7",
                    plan.highlight
                      ? "border-primary/40 bg-gradient-to-b from-primary/[0.08] to-card shadow-glow"
                      : "border-border bg-card"
                  )}
                >
                  {plan.badge ? (
                    <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-[11px] font-bold tracking-wide text-white">
                      {plan.badge}
                    </span>
                  ) : null}

                  <h3 className="text-lg font-semibold text-ink">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-sm text-ink-secondary">
                    {plan.tagline}
                  </p>

                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span className="text-3xl font-semibold text-ink">
                      {formatBRL(displayPrice)}
                    </span>
                    <span className="text-sm text-ink-secondary">/mês</span>
                  </div>
                  {cycle === "annual" ? (
                    <p className="mt-1 text-xs text-ink-secondary">
                      Cobrado {formatBRL(plan.monthlyPrice * ANNUAL_MONTHS_CHARGED)} ao ano
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-ink-secondary">
                      Cobrado mensalmente
                    </p>
                  )}

                  <ul className="mt-6 flex-1 space-y-3">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-sm text-ink-secondary"
                      >
                        <Check
                          size={16}
                          className="mt-0.5 shrink-0 text-accent"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={plan.ctaHref}
                    className={cn(
                      "mt-7 w-full",
                      plan.highlight ? "btn-primary" : "btn-secondary"
                    )}
                    onClick={() =>
                      trackEvent(
                        plan.id === "agencia" ? "contact_sales" : "click_cta_pricing",
                        { plan: plan.id, cycle }
                      )
                    }
                  >
                    {plan.ctaLabel}
                  </a>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
