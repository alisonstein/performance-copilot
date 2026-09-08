// ============================================================================
// Verificação centralizada das variáveis de ambiente do Supabase.
// Usada para exibir uma tela amigável de "configuração pendente" em vez de
// deixar o app quebrar com um erro técnico quando o .env não foi preenchido.
// ============================================================================

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return { url, anonKey };
}

export function hasSupabaseEnv(): boolean {
  const { url, anonKey } = getSupabaseEnv();
  return Boolean(url && anonKey);
}
