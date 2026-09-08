import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Cliente Supabase com a Service Role Key — ignora RLS por completo.
// Reservado para tarefas administrativas futuras (ex.: jobs, webhooks,
// scripts de manutenção). NÃO é usado no fluxo principal do MVP: toda
// leitura/escrita de dados do usuário passa pelo cliente autenticado
// (lib/supabase/server.ts), que respeita as políticas de RLS.
//
// Nunca importe este arquivo em código que roda no navegador.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não configurada. Defina-a em .env.local para usar o cliente admin."
    );
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
