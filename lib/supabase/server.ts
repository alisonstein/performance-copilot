import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

// Cliente Supabase para uso em Server Components, Route Handlers e Server
// Actions. Lê/escreve a sessão via cookies HTTP-only geridos pelo Next.js.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignorado: chamado a partir de um Server Component sem permissão
            // de escrita. O middleware garante o refresh da sessão nesse caso.
          }
        },
      },
    }
  );
}
