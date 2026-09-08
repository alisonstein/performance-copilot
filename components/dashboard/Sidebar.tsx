"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  History,
  LayoutDashboard,
  Menu,
  Settings,
  Sparkles,
  Users,
  Wand2,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Visão Geral", href: "/dashboard", icon: LayoutDashboard },
  { label: "Clientes", href: "/dashboard/clients", icon: Users },
  { label: "Nova Análise", href: "/dashboard/analysis/new", icon: Sparkles },
  { label: "Histórico", href: "/dashboard/history", icon: History },
  { label: "Configurações", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  userName: string;
  planLabel: string;
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1" aria-label="Navegação do painel">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary/15 text-ink"
                : "text-ink-secondary hover:bg-white/[0.04] hover:text-ink"
            )}
          >
            <item.icon size={18} className={active ? "text-primary-light" : ""} />
            {item.label}
          </Link>
        );
      })}

      <Link
        href="/dashboard/demo"
        onClick={onNavigate}
        className="mt-2 flex items-center gap-3 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm font-medium text-ink-secondary transition-colors hover:border-primary-light/40 hover:text-ink"
      >
        <Wand2 size={18} />
        Ver demonstração
      </Link>
    </nav>
  );
}

export function Sidebar({ userName, planLabel }: SidebarProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  return (
    <>
      {/* Topbar mobile */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-bg/95 px-4 backdrop-blur-md lg:hidden">
        <Link href="/dashboard" aria-label="Performance Copilot, ir para a visão geral">
          <Logo />
        </Link>
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink"
          aria-label="Abrir menu"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Drawer mobile */}
      {isMobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-border bg-bg-secondary px-4 py-4">
            <div className="flex items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-secondary"
                aria-label="Fechar menu"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mt-6 flex-1 overflow-y-auto">
              <NavLinks pathname={pathname} onNavigate={() => setIsMobileOpen(false)} />
            </div>
            <div className="border-t border-border pt-3">
              <p className="truncate px-3 text-sm font-medium text-ink">{userName}</p>
              <p className="px-3 text-xs text-ink-secondary">Plano {planLabel}</p>
              <LogoutButton className="mt-2 w-full" />
            </div>
          </div>
        </div>
      ) : null}

      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-bg-secondary/60 px-4 py-5 lg:flex">
        <Link href="/dashboard" className="px-1">
          <Logo />
        </Link>
        <div className="mt-8 flex flex-1 flex-col">
          <NavLinks pathname={pathname} />
        </div>
        <div className="border-t border-border pt-3">
          <p className="truncate px-3 text-sm font-medium text-ink">{userName}</p>
          <p className="px-3 text-xs text-ink-secondary">Plano {planLabel}</p>
          <LogoutButton className="mt-2 w-full" />
        </div>
      </aside>
    </>
  );
}
