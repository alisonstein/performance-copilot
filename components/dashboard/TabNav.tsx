"use client";

import { cn } from "@/lib/utils";

export interface TabItem {
  key: string;
  label: string;
}

interface TabNavProps {
  tabs: TabItem[];
  active: string;
  onChange: (key: string) => void;
}

export function TabNav({ tabs, active, onChange }: TabNavProps) {
  return (
    <div className="-mx-1 overflow-x-auto pb-1">
      <div role="tablist" className="flex min-w-max gap-1 border-b border-border px-1">
        {tabs.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.key)}
              className={cn(
                "relative whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors",
                isActive ? "text-ink" : "text-ink-secondary hover:text-ink"
              )}
            >
              {tab.label}
              {isActive ? (
                <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary-light" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
