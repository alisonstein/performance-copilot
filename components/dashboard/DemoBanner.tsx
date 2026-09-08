import { FlaskConical } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-primary/30 bg-primary/[0.08] px-4 py-3 text-sm">
      <FlaskConical size={16} className="shrink-0 text-primary-light" />
      <p className="font-medium text-ink">
        DADOS DE DEMONSTRAÇÃO — esta análise usa dados fictícios para você conhecer o produto.
      </p>
    </div>
  );
}
