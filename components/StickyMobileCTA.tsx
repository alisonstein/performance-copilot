"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { links } from "@/config/site";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function StickyMobileCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsVisible(window.scrollY > window.innerHeight * 0.7);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 backdrop-blur-md transition-transform duration-300 lg:hidden",
        isVisible ? "translate-y-0" : "translate-y-full"
      )}
      aria-hidden={!isVisible}
    >
      <a
        href={links.TRIAL_URL}
        className="btn-primary w-full !py-3"
        tabIndex={isVisible ? 0 : -1}
        onClick={() =>
          trackEvent("click_cta_hero", { location: "sticky_mobile" })
        }
      >
        Quero testar o Performance Copilot
        <ArrowRight size={16} />
      </a>
    </div>
  );
}
