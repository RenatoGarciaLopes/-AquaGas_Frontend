"use client";

import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { QuantityInput } from "@/shared/ui/quantity-input";

import type {
  PlanItemResponse,
  PlanCycle,
  UpgradePlanInput,
} from "@/features/plan/types";

type UpgradePlanDialogProps = {
  open: boolean;
  isPending: boolean;
  currentCycle: PlanCycle;
  currentItems: PlanItemResponse[];
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
  onConfirm,
  onCancel,
}: UpgradePlanDialogProps) {
  const submitRef = useRef<HTMLButtonElement>(null);
  const [cycle, setCycle] = useState<PlanCycle | "">(currentCycle);
  const [items, setItems] = useState(
    currentItems.map((i) => ({ productId: i.productId, productName: i.productName, quantity: i.quantity })),
  );
  const [reason, setReason] = useState("");
  const [durationInMonths, setDurationInMonths] = useState<number | undefined>();

  useEffect(() => {
    if (!open) {
      setCycle(currentCycle);
      setItems(currentItems.map((i) => ({ productId: i.productId, productName: i.productName, quantity: i.quantity })));
      setReason("");
      setDurationInMonths(undefined);
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
      input.items = changedItems.map((i) => ({ productId: i.productId, quantity: i.quantity }));
    }
    if (reason.trim()) input.reason = reason.trim();
    onConfirm(input);
  }

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" tabIndex={-1} disabled={isPending} onClick={onCancel} className="absolute inset-0 cursor-default bg-black/30 backdrop-blur-[2px]" aria-label="Fechar" />
      <div className="border-border bg-card relative z-10 w-full max-w-lg rounded-2xl border p-6 shadow-2xl shadow-black/40 max-h-[90vh] overflow-y-auto">
        <h3 className="text-foreground text-lg font-semibold tracking-tight">Upgrade do plano</h3>
        <p className="text-muted-foreground mt-1 text-sm">Aumente o ciclo ou as quantidades dos itens.</p>

        <div className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-foreground block text-sm font-medium">Ciclo</label>
            <select
              value={cycle}
              onChange={(e) => setCycle(e.target.value as PlanCycle)}
              className="border-border bg-background text-foreground w-full rounded-lg border px-3 py-2.5 text-sm"
            >
              {CYCLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {cycle === "Custom" ? (
            <div className="space-y-1.5">
              <label className="text-foreground block text-sm font-medium">Duração (meses)</label>
              <input type="number" min={2} max={60} value={durationInMonths ?? ""} onChange={(e) => setDurationInMonths(parseInt(e.target.value, 10) || undefined)} className="border-border bg-background text-foreground w-32 rounded-lg border px-3 py-2.5 text-sm" />
            </div>
          ) : null}

          <div className="space-y-1.5">
            <label className="text-foreground block text-sm font-medium">Itens</label>
            <div className="divide-border border-border divide-y rounded-lg border">
              {items.map((item, idx) => (
                <div key={item.productId} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-foreground text-sm">{item.productName}</span>
                  <QuantityInput
                    value={item.quantity}
                    min={1}
                    onChange={(qty) => {
                      const updated = [...items];
                      updated[idx] = { ...item, quantity: qty };
                      setItems(updated);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-foreground block text-sm font-medium">Motivo <span className="text-muted-foreground text-xs">(opcional)</span></label>
            <textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} disabled={isPending} placeholder="Motivo do upgrade…" className="bg-muted/40 text-foreground placeholder:text-muted-foreground/60 w-full rounded-lg px-4 py-2.5 text-sm outline-none" />
          </div>
        </div>

        <div className="mt-5 flex flex-col-reverse justify-end gap-2 sm:flex-row sm:gap-3">
          <button type="button" disabled={isPending} onClick={onCancel} className="border-border text-foreground hover:bg-muted inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50">Voltar</button>
          <button ref={submitRef} type="button" disabled={isPending} onClick={handleSubmit} className="inline-flex items-center justify-center rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:opacity-50">
            {isPending ? "Aplicando…" : "Aplicar upgrade"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
