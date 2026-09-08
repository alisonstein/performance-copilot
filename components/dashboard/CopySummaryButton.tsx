"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useToast } from "@/components/ui/toast";

export function CopySummaryButton({ text }: { text: string }) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast("Resumo copiado.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Não foi possível copiar. Selecione o texto manualmente.", "error");
    }
  }

  return (
    <button type="button" onClick={handleCopy} className="btn-secondary !px-4 !py-2.5 !text-sm">
      {copied ? <Check size={15} className="text-accent" /> : <Copy size={15} />}
      Copiar resumo
    </button>
  );
}
