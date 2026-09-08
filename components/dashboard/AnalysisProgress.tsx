"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const STEPS = [
  "Lendo arquivo...",
  "Organizando métricas...",
  "Procurando gargalos...",
  "Gerando diagnóstico...",
];

const STEP_INTERVAL_MS = 1600;

export function AnalysisProgress() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
    }, STEP_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card-surface flex flex-col items-center gap-4 px-6 py-14 text-center">
      <Loader2 size={28} className="animate-spin text-primary-light" />
      <div>
        <p className="text-[15px] font-medium text-ink">{STEPS[stepIndex]}</p>
        <p className="mt-1 text-sm text-ink-secondary">Isso leva só alguns instantes.</p>
      </div>
      <div className="mt-1 h-1 w-48 overflow-hidden rounded-full bg-white/[0.08]">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-gradient-to-r from-primary to-accent" />
      </div>
    </div>
  );
}
