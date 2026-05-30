"use client";

import { Icon } from "@iconify/react";
import { createPortal } from "react-dom";
import { useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { cn } from "@/shared/lib/cn";
import { Icons } from "@/shared/lib/icons";

import {
  suspendPlanSchema,
  type SuspendPlanFormData,
} from "@/features/plan/schemas/suspend-plan.schema";

type SuspendPlanDialogProps = {
  open: boolean;
  isPending: boolean;
  onConfirm: (data: SuspendPlanFormData) => void;
  onCancel: () => void;
};

export function SuspendPlanDialog({
  open,
  isPending,
  onConfirm,
  onCancel,
}: SuspendPlanDialogProps) {
  const submitRef = useRef<HTMLButtonElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SuspendPlanFormData>({
    resolver: zodResolver(suspendPlanSchema),
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

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="suspend-plan-title"
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
      <div className="border-border bg-card relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border p-4 shadow-2xl shadow-black/40 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-400">
            <Icon icon={Icons.alertTriangle} className="h-5 w-5" aria-hidden />
          </div>
          <div className="flex-1">
            <h3
              id="suspend-plan-title"
              className="text-foreground text-lg font-semibold tracking-tight"
            >
              Suspender plano?
            </h3>
            <p className="text-muted-foreground mt-1.5 text-sm">
              As entregas e cobranças pendentes serão canceladas. O plano poderá
              ser reativado posteriormente.
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
              htmlFor="suspend-reason"
              className="text-foreground block text-sm font-medium"
            >
              Motivo da suspensão{" "}
              <span className="text-red-500" aria-hidden>
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
                id="suspend-reason"
                rows={3}
                disabled={isPending}
                placeholder="Descreva o motivo da suspensão…"
                aria-invalid={errors.reason ? "true" : "false"}
                className="text-foreground placeholder:text-muted-foreground/60 w-full resize-none border-0 bg-transparent text-sm shadow-none outline-none focus:ring-0 focus:outline-none disabled:opacity-50"
                {...register("reason")}
              />
            </div>
            {errors.reason ? (
              <p className="px-1 text-xs font-medium text-red-700 dark:text-red-300">
                {errors.reason.message}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col-reverse justify-end gap-2 sm:flex-row sm:gap-3">
            <button
              type="button"
              disabled={isPending}
              onClick={onCancel}
              className="border-border text-foreground hover:bg-muted inline-flex w-full items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-semibold transition focus:ring-2 focus:ring-cyan-300/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              Voltar
            </button>
            <button
              ref={submitRef}
              type="submit"
              disabled={isPending}
              className="inline-flex w-full items-center justify-center rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-600 focus:ring-2 focus:ring-amber-300/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isPending ? "Suspendendo…" : "Suspender plano"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
