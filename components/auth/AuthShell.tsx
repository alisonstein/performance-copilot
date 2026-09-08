import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-grid-fade"
        aria-hidden="true"
      />
      <header className="border-b border-border">
        <div className="container-page flex h-16 items-center">
          <Link href="/" aria-label="Performance Copilot, ir para a página inicial" className="rounded-lg">
            <Logo />
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-md">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">{title}</h1>
            <p className="mt-2 text-[15px] text-ink-secondary">{subtitle}</p>
          </div>

          <div className="card-surface mt-8 p-6 sm:p-8">{children}</div>

          {footer ? <div className="mt-6 text-center text-sm text-ink-secondary">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
