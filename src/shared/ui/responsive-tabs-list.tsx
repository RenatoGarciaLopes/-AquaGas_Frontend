"use client";

import type { ReactNode } from "react";

import { cn } from "@/shared/lib/cn";

type ResponsiveTabsListProps = {
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
};

export function ResponsiveTabsList({
  ariaLabel,
  children,
  className,
}: ResponsiveTabsListProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "border-border -mx-1 flex gap-1 overflow-x-auto border-b px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "snap-x snap-mandatory",
        className,
      )}
    >
      {children}
    </div>
  );
}
