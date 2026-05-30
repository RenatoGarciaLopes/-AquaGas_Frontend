"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/shared/lib/cn";

import { HOME_PERIODS, type HomePeriod } from "../lib/periods";

type PeriodToggleProps = {
  active: HomePeriod;
};

/** Alterna o período do dashboard via URL (?period=...), mantendo o RSC. */
export function PeriodToggle({ active }: PeriodToggleProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function hrefFor(period: HomePeriod): string {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", period);
    return `${pathname}?${params.toString()}`;
  }

  return (
    <div className="border-border bg-background inline-flex items-center gap-0.5 rounded-lg border p-0.5">
      {HOME_PERIODS.map((period) => (
        <Link
          key={period.value}
          href={hrefFor(period.value)}
          scroll={false}
          className={cn(
            "rounded-md px-2.5 py-1 text-xs font-semibold transition",
            period.value === active
              ? "bg-cyan-500 text-white"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {period.label}
        </Link>
      ))}
    </div>
  );
}
