"use client";

import { Icon } from "@iconify/react";
import { useState, useEffect, useTransition, type ReactNode } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { Icons } from "@/shared/lib/icons";

import type { PlanStatus, PlanCycle } from "@/features/plan/types";

type PlansToolbarProps = {
  initialSearch?: string;
  /** Slot opcional renderizado à direita da linha (ex.: "Novo plano"). */
  actionSlot?: ReactNode;
};

const STATUS_OPTIONS: Array<{ label: string; value: "" | PlanStatus }> = [
  { label: "Todos os status", value: "" },
  { label: "Ativo", value: "Active" },
  { label: "Suspenso", value: "Suspended" },
  { label: "Cancelado", value: "Canceled" },
  { label: "Finalizado", value: "Finished" },
  { label: "Aguardando encerramento", value: "AwaitingClosure" },
];

const CYCLE_OPTIONS: Array<{ label: string; value: "" | PlanCycle }> = [
  { label: "Todos os ciclos", value: "" },
  { label: "Mensal", value: "Monthly" },
  { label: "Trimestral", value: "Quarterly" },
  { label: "Anual", value: "Annual" },
  { label: "Personalizado", value: "Custom" },
];

export function PlansToolbar({
  actionSlot,
  initialSearch = "",
}: PlansToolbarProps) {
  const [search, setSearch] = useState(initialSearch);
  const [, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("search") ?? "";
  const currentStatus = searchParams.get("status") ?? "";
  const currentCycle = searchParams.get("cycle") ?? "";

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

  function handleFilterChange(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
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
          id="plans-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome do cliente…"
          aria-label="Buscar plano"
          className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring/30 w-full rounded-lg border py-2.5 pr-4 pl-9 text-sm transition focus:ring-2 focus:outline-none"
        />
      </div>

      <select
        id="plans-status-filter"
        aria-label="Filtrar por status"
        value={currentStatus}
        onChange={(e) => handleFilterChange("status", e.target.value)}
        className="border-border bg-background text-foreground focus:border-ring focus:ring-ring/30 w-full rounded-lg border px-3 py-2.5 text-sm transition focus:ring-2 focus:outline-none sm:w-auto"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value || "all"} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        id="plans-cycle-filter"
        aria-label="Filtrar por ciclo"
        value={currentCycle}
        onChange={(e) => handleFilterChange("cycle", e.target.value)}
        className="border-border bg-background text-foreground focus:border-ring focus:ring-ring/30 w-full rounded-lg border px-3 py-2.5 text-sm transition focus:ring-2 focus:outline-none sm:w-auto"
      >
        {CYCLE_OPTIONS.map((opt) => (
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
