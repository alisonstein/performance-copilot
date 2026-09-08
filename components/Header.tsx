"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { links, navLinks } from "@/config/site";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-colors duration-300",
        isScrolled
          ? "border-b border-border bg-bg/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="container-page flex h-16 items-center justify-between sm:h-[72px]">
        <a
          href="#"
          className="rounded-lg"
          aria-label="Performance Copilot, ir para o topo"
        >
          <Logo />
        </a>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Navegação principal"
        >
          {navLinks.map((item) => (
            <a key={item.href} href={item.href} className="btn-ghost">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a href={links.LOGIN_URL} className="btn-ghost">
            Entrar
          </a>
          <a
            href={links.TRIAL_URL}
            className="btn-primary !px-5 !py-2.5 !text-sm"
            onClick={() => trackEvent("click_cta_hero", { location: "header" })}
          >
            Quero testar o Performance Copilot
          </a>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink lg:hidden"
          aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-border bg-bg px-5 pb-6 pt-2 lg:hidden">
          <nav className="flex flex-col" aria-label="Navegação mobile">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="border-b border-border/60 py-4 text-[15px] font-medium text-ink"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-5 flex flex-col gap-3">
            <a
              href={links.LOGIN_URL}
              className="btn-secondary w-full"
              onClick={() => setIsMenuOpen(false)}
            >
              Entrar
            </a>
            <a
              href={links.TRIAL_URL}
              className="btn-primary w-full"
              onClick={() => {
                trackEvent("click_cta_hero", { location: "header_mobile" });
                setIsMenuOpen(false);
              }}
            >
              Quero testar o Performance Copilot
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
