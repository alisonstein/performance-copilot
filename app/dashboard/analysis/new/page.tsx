import type { Metadata } from "next";
import { NewAnalysisForm } from "@/components/dashboard/NewAnalysisForm";
import { requireUser } from "@/lib/supabase/auth";

export const metadata: Metadata = {
  title: "Nova Análise",
};

interface NewAnalysisPageProps {
  searchParams: Promise<{ clientId?: string }>;
}

export default async function NewAnalysisPage({ searchParams }: NewAnalysisPageProps) {
  const { clientId } = await searchParams;
  const { supabase, user } = await requireUser();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">Nova análise</h1>
        <p className="mt-1 text-[15px] text-ink-secondary">
          Selecione o cliente, a plataforma e envie o CSV exportado da campanha.
        </p>
      </div>

      <NewAnalysisForm clients={clients ?? []} preselectedClientId={clientId} />
    </div>
  );
}
