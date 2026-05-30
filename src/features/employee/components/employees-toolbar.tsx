"use client";

import { Icon } from "@iconify/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition, type ReactNode } from "react";

import { Icons } from "@/shared/lib/icons";

type EmployeesToolbarProps = {
  initialSearch?: string;
  /** Slot opcional renderizado à direita da linha (ex.: "Novo funcionário"). */
  actionSlot?: ReactNode;
};

export function EmployeesToolbar({
  actionSlot,
  initialSearch = "",
}: EmployeesToolbarProps) {
  const [search, setSearch] = useState(initialSearch);
  const [, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") ?? "";

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const sanitized = search.trim();
      if (sanitized === currentSearch.trim()) return;

      const params = new URLSearchParams(searchParams.toString());
      if (sanitized) {
        params.set("search", sanitized);
        params.set("pageNumber", "1");
      } else {
        params.delete("search");
        params.delete("pageNumber");
      }

      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [currentSearch, pathname, router, search, searchParams]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative w-full sm:max-w-sm">
        <Icon
          icon={Icons.search}
          aria-hidden
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
        />
        <input
          id="employees-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou CPF…"
          aria-label="Buscar funcionário"
          className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring/30 w-full rounded-lg border py-2.5 pr-4 pl-9 text-sm transition focus:ring-2 focus:outline-none"
        />
      </div>

      {actionSlot ? (
        <div className="flex justify-end sm:ml-auto sm:shrink-0">
          {actionSlot}
        </div>
      ) : null}
    </div>
  );
}
