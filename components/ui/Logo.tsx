import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width="30"
        height="30"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="8" fill="#0F1424" />
        <path
          d="M7 21L12.5 13.5L17 18L25 8"
          stroke="url(#logo-gradient)"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="25" cy="8" r="2.6" fill="#2ED3B7" />
        <defs>
          <linearGradient
            id="logo-gradient"
            x1="7"
            y1="8"
            x2="25"
            y2="21"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#8E7AFF" />
            <stop offset="1" stopColor="#2ED3B7" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-[15px] font-semibold tracking-tight text-ink">
        {siteConfig.name}
      </span>
    </span>
  );
}
