import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { ConfigPendingNotice } from "@/components/shared/ConfigPendingNotice";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Recuperar senha",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Recuperar senha"
      subtitle="Informe seu e-mail para receber o link de redefinição."
      footer={
        <Link href="/login" className="font-medium text-primary-light hover:underline">
          Voltar para o login
        </Link>
      }
    >
      {hasSupabaseEnv() ? <ForgotPasswordForm /> : <ConfigPendingNotice />}
    </AuthShell>
  );
}
