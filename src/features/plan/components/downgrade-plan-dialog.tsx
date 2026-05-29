"use client";

import { Icon } from "@iconify/react";
import { createPortal } from "react-dom";
import { useRef, useState, useEffect } from "react";

import { Icons } from "@/shared/lib/icons";

import { QuantityInput } from "@/shared/ui/quantity-input";

import type {
  PlanCycle,
  PlanItemResponse,
  DowngradePlanInput,
} from "@/features/plan/types";

type DowngradePlanDialogProps = {
  open: boolean;
  isPending: boolean;
  currentCycle: PlanCycle;
  currentItems: PlanItemResponse[];
  onConfirm: (input: DowngradePlanInput) => void;
  onCancel: () => void;
};

const CYCLE_OPTIONS: Array<{ label: string; value: PlanCycle }> = [
  { label: "Mensal", value: "Monthly" },
  { label: "Trimestral", value: "Quarterly" },
  { label: "Anual", value: "Annual" },
  { label: "Personalizado", value: "Custom" },
];

export function DowngradePlanDialog({
  open,
  isPending,
  currentCycle,
  currentItems,
  onConfirm,
  onCancel,
}: DowngradePlanDialogProps) {
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
  const [error, setError] = useState<string | null>(null);

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
      setError(null);
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

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function handleSubmit() {
    const trimmed = reason.trim();
    if (trimmed.length < 5) {
      setError("Motivo deve ter no mínimo 5 caracteres.");
      return;
    }
    setError(null);

    const input: DowngradePlanInput = { reason: trimmed };
    if (cycle && cycle !== currentCycle) {
      input.cycle = cycle as PlanCycle;
      if (cycle === "Custom" && durationInMonths) {
        input.durationInMonths = durationInMonths;
      }
    }

    const changedItems = items
      .filter((item) => {
        const original = currentItems.find(
          (o) => o.productId === item.productId,
        );
        return original && item.quantity < original.quantity;
      })
      .map((i) => ({ productId: i.productId, quantity: i.quantity }));

    const removedItems = currentItems
      .filter((ci) => !items.find((i) => i.productId === ci.productId))
      .map((ci) => ({ productId: ci.productId, quantity: 0 }));

    const allChangedItems = [...changedItems, ...removedItems];
    if (allChangedItems.length > 0) {
      input.items = allChangedItems;
    }

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
      <div className="border-border bg-card relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border p-4 shadow-2xl shadow-black/40 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-400">
            <Icon icon={Icons.alertTriangle} className="h-5 w-5" aria-hidden />
          </div>
          <div className="flex-1">
            <h3 className="text-foreground text-lg font-semibold tracking-tight">
              Downgrade do plano
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Reduza o ciclo ou as quantidades. Uma multa contratual poderá ser
              gerada.
            </p>
          </div>
        </div>

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
            <div className="divide-border border-border max-h-[40vh] divide-y overflow-y-auto rounded-lg border">
              {items.map((item, idx) => {
                const originalQty = currentItems.find(
                  (o) => o.productId === item.productId,
                )?.quantity;
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
                        max={originalQty}
                        onChange={(qty) => {
                          const updated = [...items];
                          updated[idx] = { ...item, quantity: qty };
                          setItems(updated);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="text-muted-foreground transition hover:text-red-500"
                        aria-label={`Remover ${item.productName}`}
                      >
                        <Icon
                          icon={Icons.trash}
                          className="h-4 w-4"
                          aria-hidden
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-foreground block text-sm font-medium">
              Motivo{" "}
              <span className="text-red-500" aria-hidden>
                *
              </span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError(null);
              }}
              disabled={isPending}
              placeholder="Descreva o motivo do downgrade (mínimo 5 caracteres)…"
              className="bg-muted/40 text-foreground placeholder:text-muted-foreground/60 w-full rounded-lg px-4 py-2.5 text-sm outline-none"
            />
            {error ? (
              <p className="px-1 text-xs font-medium text-red-700 dark:text-red-300">
                {error}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse justify-end gap-2 sm:flex-row sm:gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={onCancel}
            className="border-border text-foreground hover:bg-muted inline-flex w-full items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50 sm:w-auto"
          >
            Voltar
          </button>
          <button
            ref={submitRef}
            type="button"
            disabled={isPending}
            onClick={handleSubmit}
            className="inline-flex w-full items-center justify-center rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50 sm:w-auto"
          >
            {isPending ? "Aplicando…" : "Aplicar downgrade"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
