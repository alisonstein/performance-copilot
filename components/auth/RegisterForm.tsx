"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MailCheck, UserPlus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { translateAuthError } from "@/lib/supabase/errors";
import { FormField } from "@/components/ui/FormField";

export function RegisterForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const supabase = createClient();
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, company_name: companyName },
          emailRedirectTo: `${appUrl}/auth/callback`,
        },
      });

      if (signUpError) {
        setError(translateAuthError(signUpError.message));
        setIsSubmitting(false);
        return;
      }

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      // Confirmação de e-mail habilitada no projeto Supabase: sem sessão
      // imediata, o usuário precisa clicar no link enviado por e-mail.
      setAwaitingConfirmation(true);
      setIsSubmitting(false);
    } catch {
      setError("Não foi possível conectar. Verifique sua internet e tente novamente.");
      setIsSubmitting(false);
    }
  }

  if (awaitingConfirmation) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <MailCheck size={32} className="text-accent" />
        <p className="text-[15px] font-medium text-ink">Confirme seu e-mail para continuar</p>
        <p className="text-sm text-ink-secondary">
          Enviamos um link de confirmação para <span className="text-ink">{email}</span>. Depois de confirmar, você já
          pode entrar normalmente.
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
        label="Nome completo"
        type="text"
        name="full_name"
        autoComplete="name"
        placeholder="Seu nome"
        required
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
      />

      <FormField
        label="Empresa (opcional)"
        type="text"
        name="company_name"
        autoComplete="organization"
        placeholder="Nome da sua agência ou empresa"
        value={companyName}
        onChange={(event) => setCompanyName(event.target.value)}
      />

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
        autoComplete="new-password"
        placeholder="Mínimo de 6 caracteres"
        required
        minLength={6}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <button type="submit" className="btn-primary mt-1 w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 size={17} className="animate-spin" /> : <UserPlus size={17} />}
        Criar conta
      </button>
    </form>
  );
}
