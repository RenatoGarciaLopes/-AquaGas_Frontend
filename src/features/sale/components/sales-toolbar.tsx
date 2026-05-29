"use client";

import { Icon } from "@iconify/react";
import { useState, useEffect, useTransition, type ReactNode } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/shared/lib/cn";
import { Icons } from "@/shared/lib/icons";
import { formatCurrency } from "@/shared/lib/formatters";
import { maskBrlInput, numberToBrl } from "@/shared/lib/masks";
import { TextField } from "@/shared/ui/form-field";
import { DatePicker } from "@/shared/ui/date-picker";

import type { SaleStatusFilter } from "@/features/sale/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_OPTIONS: Array<{ label: string; value: "" | SaleStatusFilter }> = [
  { label: "Todos os status", value: "" },
  { label: "Finalizada", value: "Finished" },
  { label: "Cancelada", value: "Canceled" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusLabel(value: string): string {
  if (value === "Finished") return "Finalizada";
  if (value === "Canceled") return "Cancelada";
  return value;
}

function formatDateParam(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function parsePositiveFloat(value: string): number | undefined {
  const n = parseFloat(value);
  return isFinite(n) && n >= 0 ? n : undefined;
}

// ─── FilterChip ───────────────────────────────────────────────────────────────

function FilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="bg-muted text-foreground inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remover filtro: ${label}`}
        className="text-muted-foreground hover:text-foreground ml-0.5 transition"
      >
        <Icon icon={Icons.x} className="h-3 w-3" aria-hidden />
      </button>
    </span>
  );
}

// ─── SalesToolbar ─────────────────────────────────────────────────────────────

type SalesToolbarProps = {
  /** Slot opcional renderizado à direita da linha de filtros (ex.: "Nova venda"). */
  actionSlot?: ReactNode;
};

export function SalesToolbar({ actionSlot }: SalesToolbarProps = {}) {
  const [, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSearch = searchParams.get("search") ?? "";
  const currentStatus = searchParams.get("status") ?? "";
  const currentDateFrom = searchParams.get("dateFrom") ?? "";
  const currentDateTo = searchParams.get("dateTo") ?? "";
  const currentMinTotal = searchParams.get("minTotal") ?? "";
  const currentMaxTotal = searchParams.get("maxTotal") ?? "";

  // Local state for debounced inputs
  const [search, setSearch] = useState(currentSearch);
  const [minDisplay, setMinDisplay] = useState(() =>
    numberToBrl(parsePositiveFloat(currentMinTotal)),
  );
  const [maxDisplay, setMaxDisplay] = useState(() =>
    numberToBrl(parsePositiveFloat(currentMaxTotal)),
  );

  const advancedActiveCount = [
    currentDateFrom,
    currentDateTo,
    currentMinTotal,
    currentMaxTotal,
  ].filter(Boolean).length;

  const [advancedOpen, setAdvancedOpen] = useState(advancedActiveCount > 0);

  const hasAnyFilter = !!(
    currentSearch ||
    currentStatus ||
    currentDateFrom ||
    currentDateTo ||
    currentMinTotal ||
    currentMaxTotal
  );

  // ─── Debounce: search ─────────────────────────────────────────────────────

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const sanitized = search.trim();
      if (sanitized === currentSearch.trim()) return;

      const params = new URLSearchParams(searchParams.toString());
      if (sanitized) params.set("search", sanitized);
      else params.delete("search");
      params.delete("pageNumber");

      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [search, currentSearch, pathname, router, searchParams]);

  // ─── Debounce: value range ────────────────────────────────────────────────

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const minVal = maskBrlInput(minDisplay).value;
      const maxVal = maskBrlInput(maxDisplay).value;
      const minStr = minVal !== undefined ? String(minVal) : "";
      const maxStr = maxVal !== undefined ? String(maxVal) : "";

      if (minStr === currentMinTotal && maxStr === currentMaxTotal) return;

      const params = new URLSearchParams(searchParams.toString());
      if (minStr) params.set("minTotal", minStr);
      else params.delete("minTotal");
      if (maxStr) params.set("maxTotal", maxStr);
      else params.delete("maxTotal");
      params.delete("pageNumber");

      const qs = params.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [minDisplay, maxDisplay, currentMinTotal, currentMaxTotal, pathname, router, searchParams]);

  // ─── Immediate param update ───────────────────────────────────────────────

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("pageNumber");
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  function clearAllFilters() {
    setSearch("");
    setMinDisplay("");
    setMaxDisplay("");
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      {/* Row 1 — advanced toggle (left) + search + status + action slot (right) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          className={cn(
            "border-border bg-background text-foreground hover:bg-muted inline-flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition focus:ring-2 focus:outline-none sm:shrink-0",
            advancedOpen && "bg-muted",
          )}
        >
          <Icon
            icon={advancedOpen ? Icons.arrowUp : Icons.arrowDown}
            aria-hidden
            className="h-4 w-4"
          />
          Filtros avançados
          {advancedActiveCount > 0 && (
            <span className="bg-primary text-primary-foreground inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold">
              {advancedActiveCount}
            </span>
          )}
        </button>

        <div className="relative w-full sm:max-w-sm">
          <Icon
            icon={Icons.search}
            aria-hidden
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente ou vendedor…"
            aria-label="Buscar venda"
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring/30 w-full rounded-lg border py-2.5 pr-4 pl-9 text-sm transition focus:ring-2 focus:outline-none"
          />
        </div>

        <select
          aria-label="Filtrar por status"
          value={currentStatus}
          onChange={(e) => updateParam("status", e.target.value || null)}
          className="border-border bg-background text-foreground focus:border-ring focus:ring-ring/30 w-full rounded-lg border px-3 py-2.5 text-sm transition focus:ring-2 focus:outline-none sm:w-auto"
        >
          {STATUS_OPTIONS.map((opt) => (
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

      {/* Row 2 — advanced filter panel (CSS grid height animation) */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          advancedOpen
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="border-border bg-muted/30 rounded-xl border p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <DatePicker
                label="Data inicial"
                value={currentDateFrom}
                max={currentDateTo || undefined}
                onChange={(v) => updateParam("dateFrom", v || null)}
              />

              <DatePicker
                label="Data final"
                value={currentDateTo}
                min={currentDateFrom || undefined}
                onChange={(v) => updateParam("dateTo", v || null)}
              />

              <TextField
                id="sales-min-total"
                label="Valor mínimo"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0,00"
                value={minDisplay}
                onChange={(e) => {
                  const { display } = maskBrlInput(e.target.value);
                  setMinDisplay(display);
                }}
              />

              <TextField
                id="sales-max-total"
                label="Valor máximo"
                inputMode="decimal"
                autoComplete="off"
                placeholder="Sem limite"
                value={maxDisplay}
                onChange={(e) => {
                  const { display } = maskBrlInput(e.target.value);
                  setMaxDisplay(display);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Row 3 — active filter chips */}
      {hasAnyFilter && (
        <div className="flex flex-wrap items-center gap-2">
          {currentSearch && (
            <FilterChip
              label={`"${currentSearch}"`}
              onRemove={() => {
                setSearch("");
                updateParam("search", null);
              }}
            />
          )}
          {currentStatus && (
            <FilterChip
              label={statusLabel(currentStatus)}
              onRemove={() => updateParam("status", null)}
            />
          )}
          {currentDateFrom && (
            <FilterChip
              label={`De: ${formatDateParam(currentDateFrom)}`}
              onRemove={() => updateParam("dateFrom", null)}
            />
          )}
          {currentDateTo && (
            <FilterChip
              label={`Até: ${formatDateParam(currentDateTo)}`}
              onRemove={() => updateParam("dateTo", null)}
            />
          )}
          {currentMinTotal && (
            <FilterChip
              label={`Mín: ${formatCurrency(Number(currentMinTotal))}`}
              onRemove={() => {
                setMinDisplay("");
                updateParam("minTotal", null);
              }}
            />
          )}
          {currentMaxTotal && (
            <FilterChip
              label={`Máx: ${formatCurrency(Number(currentMaxTotal))}`}
              onRemove={() => {
                setMaxDisplay("");
                updateParam("maxTotal", null);
              }}
            />
          )}

          <button
            type="button"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground ml-1 text-xs font-medium underline-offset-2 transition hover:underline"
          >
            Limpar tudo
          </button>
        </div>
      )}
    </div>
  );
}
