import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Database } from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Garante que existe um usuário autenticado, redirecionando para /login
 * caso contrário. Usada como segunda camada de proteção nas páginas do
 * dashboard, além do middleware.
 *
 * Se o Supabase ainda não foi configurado (.env.local vazio), redireciona
 * para /config-pendente em vez de deixar o cliente Supabase lançar um erro
 * técnico. redirect() usa o mecanismo nativo do Next.js (funciona mesmo
 * chamado de dentro de uma página/layout aninhado).
 */
export async function requireUser() {
  if (!hasSupabaseEnv()) {
    redirect("/config-pendente");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

/**
 * Busca o profile do usuário autenticado. Se ainda não existir (trigger de
 * criação pode levar um instante, ou o projeto Supabase não tem a migration
 * aplicada), devolve um profile mínimo derivado da sessão para não quebrar a
 * navegação.
 */
export async function getOrCreateProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  email: string | undefined
): Promise<ProfileRow> {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();

  if (data) return data;

  const fallback: ProfileRow = {
    id: userId,
    email: email ?? "",
    full_name: null,
    company_name: null,
    plan: "free",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data: inserted } = await supabase.from("profiles").insert(fallback).select("*").maybeSingle();
  return inserted ?? fallback;
}
