"use client";

import { Icon } from "@iconify/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useTransition, type ReactNode } from "react";

import { Icons } from "@/shared/lib/icons";

import type { ProductType } from "@/features/product/types";

type ProductsToolbarProps = {
  initialSearch?: string;
  /** Slot opcional renderizado à direita da linha (ex.: "Novo produto"). */
  actionSlot?: ReactNode;
};

const TYPE_OPTIONS: Array<{ label: string; value: "" | ProductType }> = [
  { label: "Todos os tipos", value: "" },
  { label: "Água", value: "Water" },
  { label: "Gás", value: "Gas" },
];

export function ProductsToolbar({
  actionSlot,
  initialSearch = "",
}: ProductsToolbarProps) {
  const [search, setSearch] = useState(initialSearch);
  const [, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") ?? "";
  const currentType = searchParams.get("type") ?? "";

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

  function handleTypeChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("type", value);
    } else {
      params.delete("type");
    }
    params.delete("pageNumber");

    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative w-full sm:max-w-sm">
        <Icon
          icon={Icons.search}
          aria-hidden
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
        />
        <input
          id="products-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produto…"
          aria-label="Buscar produto"
          className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring/30 w-full rounded-lg border py-2.5 pr-4 pl-9 text-sm transition focus:ring-2 focus:outline-none"
        />
      </div>

      <select
        id="products-type-filter"
        aria-label="Filtrar por tipo"
        value={currentType}
        onChange={(e) => handleTypeChange(e.target.value)}
        className="border-border bg-background text-foreground focus:border-ring focus:ring-ring/30 w-full rounded-lg border px-3 py-2.5 text-sm transition focus:ring-2 focus:outline-none sm:w-auto"
      >
        {TYPE_OPTIONS.map((opt) => (
          <option key={opt.value || "all"} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {actionSlot ? (
        <div className="flex justify-end sm:ml-auto sm:shrink-0">
          {actionSlot}
        </div>
      ) : null}
    </div>
  );
}
