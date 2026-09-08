import { Reveal } from "@/components/ui/Reveal";

const chips = [
  "Meta Ads",
  "Google Ads",
  "Agências",
  "Freelancers",
  "Performance Marketing",
  "E-commerce",
  "Geração de Leads",
];

export function TrustStrip() {
  return (
    <section className="border-y border-border bg-bg-secondary/40 py-10">
      <div className="container-page">
        <Reveal>
          <p className="text-center text-sm font-medium text-ink-secondary">
            Criado para quem vive de performance
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-border bg-white/[0.02] px-4 py-2 text-[13px] font-medium text-ink-secondary"
              >
                {chip}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
