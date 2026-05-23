"use client";

import { cn } from "@/shared/lib/cn";

export type VerticalTab = {
  id: string;
  label: string;
};

type VerticalTabsProps = {
  ariaLabel?: string;
  activeTab: string;
  className?: string;
  onChange: (id: string) => void;
  tabs: VerticalTab[];
};

export function VerticalTabs({
  activeTab,
  ariaLabel = "Seções",
  className,
  onChange,
  tabs,
}: VerticalTabsProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation="vertical"
      className={cn("flex flex-col", className)}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-controls={`tabpanel-${tab.id}`}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className={cn(
              "group relative flex items-center gap-3 border-l-2 px-4 py-3 text-left text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40",
              isActive
                ? "border-cyan-500 text-cyan-500"
                : "text-muted-foreground hover:text-foreground border-transparent",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
