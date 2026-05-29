"use client";

import { createPortal } from "react-dom";
import { useRef, useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";

import { Icons } from "@/shared/lib/icons";
import { formatCurrency } from "@/shared/lib/formatters";
import { QuantityInput } from "@/shared/ui/quantity-input";

import type {
  PlanCycle,
  PlanItemResponse,
  UpgradePlanInput,
} from "@/features/plan/types";

type AvailableProduct = {
  id: string;
  name: string;
  price: number;
};

type UpgradePlanDialogProps = {
  open: boolean;
  isPending: boolean;
  currentCycle: PlanCycle;
  currentItems: PlanItemResponse[];
  availableProducts: AvailableProduct[];
  onConfirm: (input: UpgradePlanInput) => void;
  onCancel: () => void;
};

const CYCLE_OPTIONS: Array<{ label: string; value: PlanCycle }> = [
  { label: "Mensal", value: "Monthly" },
  { label: "Trimestral", value: "Quarterly" },
  { label: "Anual", value: "Annual" },
  { label: "Personalizado", value: "Custom" },
];

export function UpgradePlanDialog({
  open,
  isPending,
  currentCycle,
  currentItems,
  availableProducts,
  onConfirm,
  onCancel,
}: UpgradePlanDialogProps) {
  const submitRef = useRef<HTMLButtonElement>(null);
  const [cycle, setCycle] = useState<PlanCycle | "">(currentCycle);
  const [items, setItems] = useState(
    currentItems.map((i) => ({
      productId: i.productId,
      productName: i.productName,
      quantity: i.quantity,
    })),
  );
  const [reason, setReason] = useState("");
  const [durationInMonths, setDurationInMonths] = useState<
    number | undefined
  >();
  const [search, setSearch] = useState("");

  const currentItemIds = useMemo(
    () => new Set(currentItems.map((i) => i.productId)),
    [currentItems],
  );

  const addedIds = useMemo(
    () => new Set(items.map((i) => i.productId)),
    [items],
  );

  const term = search.trim().toLowerCase();
  const available = useMemo(() => {
    const list = availableProducts.filter((p) => !addedIds.has(p.id));
    if (!term) return list.slice(0, 6);
    return list.filter((p) => p.name.toLowerCase().includes(term)).slice(0, 6);
  }, [availableProducts, addedIds, term]);

  useEffect(() => {
    if (!open) {
      setCycle(currentCycle);
      setItems(
        currentItems.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          quantity: i.quantity,
        })),
      );
      setReason("");
      setDurationInMonths(undefined);
      setSearch("");
      return;
    }
    submitRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) {
        event.stopPropagation();
        onCancel();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, isPending, onCancel, currentCycle, currentItems]);

  function addProduct(product: AvailableProduct) {
    setItems((prev) => [
      ...prev,
      { productId: product.id, productName: product.name, quantity: 1 },
    ]);
    setSearch("");
  }

  function removeNewItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function handleSubmit() {
    const input: UpgradePlanInput = {};
    if (cycle && cycle !== currentCycle) {
      input.cycle = cycle as PlanCycle;
      if (cycle === "Custom" && durationInMonths) {
        input.durationInMonths = durationInMonths;
      }
    }
    const changedItems = items.filter((item) => {
      const original = currentItems.find((o) => o.productId === item.productId);
      return !original || item.quantity > original.quantity;
    });
    if (changedItems.length > 0) {
      input.items = changedItems.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      }));
    }
    if (reason.trim()) input.reason = reason.trim();
    onConfirm(input);
  }

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        tabIndex={-1}
        disabled={isPending}
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-black/30 backdrop-blur-[2px]"
        aria-label="Fechar"
      />
      <div className="border-border bg-card relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border p-6 shadow-2xl shadow-black/40">
        <h3 className="text-foreground text-lg font-semibold tracking-tight">
          Upgrade do plano
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Aumente o ciclo, ajuste quantidades ou adicione novos produtos.
        </p>

        <div className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-foreground block text-sm font-medium">
              Ciclo
            </label>
            <select
              value={cycle}
              onChange={(e) => setCycle(e.target.value as PlanCycle)}
              className="border-border bg-background text-foreground w-full rounded-lg border px-3 py-2.5 text-sm"
            >
              {CYCLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {cycle === "Custom" ? (
            <div className="space-y-1.5">
              <label className="text-foreground block text-sm font-medium">
                Duração (meses)
              </label>
              <input
                type="number"
                min={2}
                max={60}
                value={durationInMonths ?? ""}
                onChange={(e) =>
                  setDurationInMonths(parseInt(e.target.value, 10) || undefined)
                }
                className="border-border bg-background text-foreground w-32 rounded-lg border px-3 py-2.5 text-sm"
              />
            </div>
          ) : null}

          <div className="space-y-1.5">
            <label className="text-foreground block text-sm font-medium">
              Itens
            </label>
            <div className="divide-border border-border divide-y rounded-lg border">
              {items.map((item, idx) => {
                const isNew = !currentItemIds.has(item.productId);
                return (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between px-4 py-2.5"
                  >
                    <span className="text-foreground text-sm">
                      {item.productName}
                    </span>
                    <div className="flex items-center gap-2">
                      <QuantityInput
                        value={item.quantity}
                        min={1}
                        onChange={(qty) => {
                          const updated = [...items];
                          updated[idx] = { ...item, quantity: qty };
                          setItems(updated);
                        }}
                      />
                      {isNew ? (
                        <button
                          type="button"
                          onClick={() => removeNewItem(item.productId)}
                          className="text-muted-foreground hover:text-red-500 transition"
                          aria-label={`Remover ${item.productName}`}
                        >
                          <Icon
                            icon={Icons.trash}
                            className="h-4 w-4"
                            aria-hidden
                          />
                        </button>
                      ) : (
                        <span className="h-4 w-4" aria-hidden />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 pt-1">
              <div className="relative">
                <Icon
                  icon={Icons.search}
                  aria-hidden
                  className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Adicionar produto…"
                  aria-label="Buscar produto para adicionar"
                  className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring/30 w-full rounded-lg border py-2.5 pr-4 pl-9 text-sm transition focus:ring-2 focus:outline-none"
                />
              </div>

              {available.length > 0 ? (
                <div className="divide-border border-border max-h-48 divide-y overflow-y-auto rounded-lg border">
                  {available.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addProduct(product)}
                      className="hover:bg-muted/50 flex w-full items-center gap-3 px-4 py-2.5 text-left transition"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-500">
                        <Icon
                          icon={Icons.package}
                          className="h-3.5 w-3.5"
                          aria-hidden
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground truncate text-sm font-medium">
                          {product.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                      <Icon
                        icon={Icons.plus}
                        className="text-muted-foreground h-4 w-4"
                        aria-hidden
                      />
                    </button>
                  ))}
                </div>
              ) : search.trim() ? (
                <p className="text-muted-foreground text-center text-sm py-2">
                  Nenhum produto encontrado.
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-foreground block text-sm font-medium">
              Motivo{" "}
              <span className="text-muted-foreground text-xs">(opcional)</span>
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isPending}
              placeholder="Motivo do upgrade…"
              className="bg-muted/40 text-foreground placeholder:text-muted-foreground/60 w-full rounded-lg px-4 py-2.5 text-sm outline-none"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse justify-end gap-2 sm:flex-row sm:gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={onCancel}
            className="border-border text-foreground hover:bg-muted inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50"
          >
            Voltar
          </button>
          <button
            ref={submitRef}
            type="button"
            disabled={isPending}
            onClick={handleSubmit}
            className="inline-flex items-center justify-center rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:opacity-50"
          >
            {isPending ? "Aplicando…" : "Aplicar upgrade"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
