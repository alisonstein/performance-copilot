"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LogIn, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/lib/supabase/errors";
import { FormField } from "@/components/ui/FormField";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      if (signInError) {
        setError(translateAuthError(signInError.message));
        setIsSubmitting(false);
        return;
      }

      const redirectTo = searchParams.get("redirect") || "/dashboard";
      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Não foi possível conectar. Verifique sua internet e tente novamente.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {error ? (
        <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 px-3.5 py-2.5 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <FormField
        label="E-mail"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="voce@empresa.com"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <FormField
        label="Senha"
        type="password"
        name="password"
        autoComplete="current-password"
        placeholder="••••••••"
        required
        minLength={6}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <div className="-mt-1 flex justify-end">
        <Link href="/forgot-password" className="text-xs font-medium text-primary-light hover:underline">
          Esqueceu sua senha?
        </Link>
      </div>

      <button type="submit" className="btn-primary mt-1 w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 size={17} className="animate-spin" /> : <LogIn size={17} />}
        Entrar
      </button>
    </form>
  );
}
