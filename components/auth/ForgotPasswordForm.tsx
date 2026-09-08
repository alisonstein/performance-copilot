"use client";

import { useState, type FormEvent } from "react";
import { Loader2, MailCheck, SendHorizonal } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/lib/supabase/errors";
import { FormField } from "@/components/ui/FormField";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${appUrl}/auth/callback?next=/reset-password`,
      });

      if (resetError) {
        setError(translateAuthError(resetError.message));
        setIsSubmitting(false);
        return;
      }

      setSent(true);
      setIsSubmitting(false);
    } catch {
      setError("Não foi possível conectar. Verifique sua internet e tente novamente.");
      setIsSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <MailCheck size={32} className="text-accent" />
        <p className="text-[15px] font-medium text-ink">Verifique seu e-mail</p>
        <p className="text-sm text-ink-secondary">
          Se houver uma conta associada a <span className="text-ink">{email}</span>, enviamos um link para você
          redefinir sua senha.
        </p>
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
        label="E-mail"
        type="email"
        name="email"
        autoComplete="email"
        placeholder="voce@empresa.com"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <button type="submit" className="btn-primary mt-1 w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 size={17} className="animate-spin" /> : <SendHorizonal size={17} />}
        Enviar link de recuperação
      </button>
    </form>
  );
}
