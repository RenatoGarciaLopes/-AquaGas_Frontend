"use client";

import { Icon } from "@iconify/react";
import { createPortal } from "react-dom";
import { useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { cn } from "@/shared/lib/cn";
import { Icons } from "@/shared/lib/icons";

import {
  cancelSaleSchema,
  type CancelSaleFormData,
} from "@/features/sale/schemas/cancel-sale.schema";

type CancelSaleDialogProps = {
  open: boolean;
  isPending: boolean;
  onConfirm: (data: CancelSaleFormData) => void;
  onCancel: () => void;
};

export function CancelSaleDialog({
  open,
  isPending,
  onConfirm,
  onCancel,
}: CancelSaleDialogProps) {
  const submitRef = useRef<HTMLButtonElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CancelSaleFormData>({
    resolver: zodResolver(cancelSaleSchema),
  });

  useEffect(() => {
    if (!open) {
      reset();
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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, isPending, onCancel, reset]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-sale-title"
      aria-describedby="cancel-sale-description"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Fechar"
        tabIndex={-1}
        disabled={isPending}
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-black/30 backdrop-blur-[2px]"
      />

      <div className="border-border bg-card relative z-10 w-full max-w-md rounded-2xl border p-6 shadow-2xl shadow-black/40">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-400">
            <Icon icon={Icons.alertTriangle} className="h-5 w-5" aria-hidden />
          </div>

          <div className="flex-1">
            <h3
              id="cancel-sale-title"
              className="text-foreground text-lg font-semibold tracking-tight"
            >
              Cancelar venda?
            </h3>
            <p
              id="cancel-sale-description"
              className="text-muted-foreground mt-1.5 text-sm"
            >
              O estoque dos produtos será restaurado automaticamente. Vendas só
              podem ser canceladas dentro de 24 horas após a realização.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onConfirm)}
          className="mt-5 space-y-4"
          noValidate
        >
          <div className="space-y-1.5">
            <label
              htmlFor="cancel-reason"
              className="text-foreground block text-sm font-medium"
            >
              Motivo do cancelamento{" "}
              <span className="text-red-500" aria-hidden="true">
                *
              </span>
            </label>
            <div
              className={cn(
                "bg-muted/40 hover:bg-muted/60 focus-within:bg-muted/60 rounded-lg px-4 py-2.5 transition",
                errors.reason
                  ? "ring-1 ring-red-500/70 dark:ring-red-400/70"
                  : "",
              )}
            >
              <textarea
                id="cancel-reason"
                rows={3}
                disabled={isPending}
                placeholder="Descreva o motivo do cancelamento…"
                aria-invalid={errors.reason ? "true" : "false"}
                aria-describedby={
                  errors.reason ? "cancel-reason-error" : undefined
                }
                className="text-foreground placeholder:text-muted-foreground/60 w-full resize-none border-0 bg-transparent text-sm shadow-none outline-none focus:ring-0 focus:outline-none disabled:opacity-50"
                {...register("reason")}
              />
            </div>
            {errors.reason ? (
              <p
                id="cancel-reason-error"
                className="px-1 text-xs font-medium text-red-700 dark:text-red-300"
              >
                {errors.reason.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row sm:gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={onCancel}
              className="border-border text-foreground hover:bg-muted inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-semibold transition focus:ring-2 focus:ring-cyan-300/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              Voltar
            </button>
            <button
              ref={submitRef}
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 focus:ring-2 focus:ring-red-300/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? "Cancelando…" : "Cancelar venda"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
