"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/supabase/auth";

const createClientSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do cliente.").max(120, "Nome muito longo."),
  category: z.string().trim().max(80).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export interface ClientActionState {
  ok: boolean;
  message?: string;
  clientId?: string;
}

export async function createClientAction(input: {
  name: string;
  category: string;
  notes: string;
}): Promise<ClientActionState> {
  const parsed = createClientSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { supabase, user } = await requireUser();

  const { data, error } = await supabase
    .from("clients")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      category: parsed.data.category || null,
      notes: parsed.data.notes || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createClientAction]", error);
    return { ok: false, message: "Não foi possível salvar o cliente. Tente novamente." };
  }

  revalidatePath("/dashboard/clients");
  revalidatePath("/dashboard");

  return { ok: true, clientId: data.id };
}
