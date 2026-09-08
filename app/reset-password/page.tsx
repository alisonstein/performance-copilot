import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { ConfigPendingNotice } from "@/components/shared/ConfigPendingNotice";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Redefinir senha",
};

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Defina sua nova senha" subtitle="Escolha uma nova senha para sua conta.">
      {hasSupabaseEnv() ? <ResetPasswordForm /> : <ConfigPendingNotice />}
    </AuthShell>
  );
}
