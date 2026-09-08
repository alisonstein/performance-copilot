"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-white/[0.03]">
        <AlertTriangle size={26} className="text-amber-400" />
      </div>
      <h1 className="mt-5 text-xl font-semibold text-ink">Algo deu errado</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-secondary">
        Não foi possível carregar esta página. Tente novamente em instantes ou volte para o início.
      </p>
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={() => reset()} className="btn-secondary !px-4 !py-2.5 !text-sm">
          <RotateCcw size={15} />
          Tentar novamente
        </button>
        <Link href="/" className="btn-primary !px-4 !py-2.5 !text-sm">
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
