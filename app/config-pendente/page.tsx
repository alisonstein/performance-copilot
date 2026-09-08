import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ConfigPendingNotice } from "@/components/shared/ConfigPendingNotice";

export const metadata: Metadata = {
  title: "Configuração pendente",
};

export default function ConfigPendentePage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="border-b border-border">
        <div className="container-page flex h-16 items-center">
          <Link href="/" aria-label="Performance Copilot, ir para a página inicial">
            <Logo />
          </Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">
          <ConfigPendingNotice />
        </div>
      </main>
    </div>
  );
}
