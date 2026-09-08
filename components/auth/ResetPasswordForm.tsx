"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/lib/supabase/errors";
import { FormField } from "@/components/ui/FormField";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(Boolean(data.session));
    });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) {
        setError(translateAuthError(updateError.message));
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1800);
    } catch {
      setError("Não foi possível conectar. Verifique sua internet e tente novamente.");
      setIsSubmitting(false);
    }
  }

  if (hasSession === null) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 size={22} className="animate-spin text-ink-secondary" />
      </div>
    );
  }

  if (!hasSession) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <p className="text-[15px] font-medium text-ink">Link inválido ou expirado</p>
        <p className="text-sm text-ink-secondary">
          Solicite um novo link de recuperação de senha para continuar.
        </p>
        <Link href="/forgot-password" className="btn-secondary mt-2">
          Solicitar novo link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <CheckCircle2 size={32} className="text-accent" />
        <p className="text-[15px] font-medium text-ink">Senha atualizada</p>
        <p className="text-sm text-ink-secondary">Redirecionando para o seu painel...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {error ? (
        <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 px-3.5 py-2.5 text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <FormField
        label="Nova senha"
        type="password"
        name="password"
        autoComplete="new-password"
        placeholder="Mínimo de 6 caracteres"
        required
        minLength={6}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <FormField
        label="Confirmar nova senha"
        type="password"
        name="confirm_password"
        autoComplete="new-password"
        placeholder="Repita a nova senha"
        required
        minLength={6}
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
      />

      <button type="submit" className="btn-primary mt-1 w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 size={17} className="animate-spin" /> : <KeyRound size={17} />}
        Redefinir senha
      </button>
    </form>
  );
}
