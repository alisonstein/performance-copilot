import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { ConfigPendingNotice } from "@/components/shared/ConfigPendingNotice";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Entrar"
      subtitle="Acesse o seu painel do Performance Copilot."
      footer={
        <>
          Ainda não tem conta?{" "}
          <Link href="/register" className="font-medium text-primary-light hover:underline">
            Criar conta grátis
          </Link>
        </>
      }
    >
      {hasSupabaseEnv() ? (
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      ) : (
        <ConfigPendingNotice />
      )}
    </AuthShell>
  );
}
