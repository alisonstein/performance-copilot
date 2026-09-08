import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { ConfigPendingNotice } from "@/components/shared/ConfigPendingNotice";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Criar conta",
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Crie sua conta grátis"
      subtitle="Configure em poucos minutos. Sem cartão de crédito."
      footer={
        <>
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-primary-light hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      {hasSupabaseEnv() ? <RegisterForm /> : <ConfigPendingNotice />}
    </AuthShell>
  );
}
