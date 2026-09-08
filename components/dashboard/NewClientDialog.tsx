"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X } from "lucide-react";
import { createClientAction } from "@/lib/actions/clients";
import { FormField, FormTextArea } from "@/components/ui/FormField";
import { useToast } from "@/components/ui/toast";

export function NewClientDialog() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetAndClose() {
    setIsOpen(false);
    setName("");
    setCategory("");
    setNotes("");
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await createClientAction({ name, category, notes });

    if (!result.ok) {
      setError(result.message ?? "Não foi possível salvar o cliente.");
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    resetAndClose();
    showToast("Cliente adicionado.");
    router.refresh();
  }

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} className="btn-primary !px-5 !py-2.5 !text-sm">
        <Plus size={16} />
        Adicionar cliente
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60" onClick={resetAndClose} aria-hidden="true" />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-client-title"
            className="card-surface relative w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between">
              <h2 id="new-client-title" className="text-lg font-semibold text-ink">
                Adicionar cliente
              </h2>
              <button
                type="button"
                onClick={resetAndClose}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-secondary hover:text-ink"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4" noValidate>
              {error ? (
                <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 px-3.5 py-2.5 text-sm text-red-300">
                  {error}
                </p>
              ) : null}

              <FormField
                label="Nome do cliente"
                name="name"
                required
                placeholder="Ex: Loja Exemplo"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <FormField
                label="Categoria"
                name="category"
                placeholder="Ex: E-commerce, Serviços, Infoproduto..."
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              />
              <FormTextArea
                label="Observações"
                name="notes"
                rows={3}
                placeholder="Notas internas sobre o cliente (opcional)"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />

              <div className="mt-1 flex justify-end gap-3">
                <button type="button" onClick={resetAndClose} className="btn-secondary !px-4 !py-2.5 !text-sm">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary !px-4 !py-2.5 !text-sm" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  Salvar cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
