"use client";

import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import { cn } from "@/shared/lib/cn";

type ReasonDialogProps = {
  danger?: boolean;
  description?: string;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: (data: Record<string, string>) => void;
  open: boolean;
  placeholder?: string;
  schema: z.ZodTypeAny;
  showDateField?: boolean;
  submitLabel: string;
  title: string;
};

export function ReasonDialog({
  danger,
  description,
  isPending,
  onCancel,
  onConfirm,
  open,
  placeholder = "Descreva o motivo…",
  schema,
  showDateField = false,
  submitLabel,
  title,
}: ReasonDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  if (!open || typeof document === "undefined") return null;

  const fieldErrors = errors as Record<string, { message?: string }>;

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
        onClick={() => {
          reset();
          onCancel();
        }}
        className="absolute inset-0 cursor-default bg-black/30 backdrop-blur-[2px]"
        aria-label="Fechar"
      />
      <div className="border-border bg-card relative z-10 w-full max-w-md rounded-2xl border p-6 shadow-2xl shadow-black/40">
        <h3 className="text-foreground text-lg font-semibold">{title}</h3>
        {description ? (
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        ) : null}
        <form
          onSubmit={handleSubmit((data) => {
            onConfirm(data as Record<string, string>);
            reset();
          })}
          className="mt-4 space-y-4"
          noValidate
        >
          {showDateField ? (
            <div className="space-y-1.5">
              <label className="text-foreground block text-sm font-medium">
                Nova data <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                {...register("newDate")}
                disabled={isPending}
                className="border-border bg-background text-foreground w-full rounded-lg border px-3 py-2.5 text-sm"
              />
              {fieldErrors.newDate?.message ? (
                <p className="px-1 text-xs font-medium text-red-700 dark:text-red-300">
                  {fieldErrors.newDate.message}
                </p>
              ) : null}
            </div>
          ) : null}
          <div className="space-y-1.5">
            <label className="text-foreground block text-sm font-medium">
              Motivo <span className="text-red-500">*</span>
            </label>
            <div
              className={cn(
                "bg-muted/40 rounded-lg px-4 py-2.5",
                fieldErrors.reason ? "ring-1 ring-red-500/70" : "",
              )}
            >
              <textarea
                rows={3}
                {...register("reason")}
                disabled={isPending}
                placeholder={placeholder}
                className="text-foreground placeholder:text-muted-foreground/60 w-full resize-none border-0 bg-transparent text-sm outline-none disabled:opacity-50"
              />
            </div>
            {fieldErrors.reason?.message ? (
              <p className="px-1 text-xs font-medium text-red-700 dark:text-red-300">
                {fieldErrors.reason.message}
              </p>
            ) : null}
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                reset();
                onCancel();
              }}
              className="border-border text-foreground hover:bg-muted rounded-lg border px-4 py-2.5 text-sm font-semibold transition disabled:opacity-50"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={cn(
                "rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50",
                danger
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-cyan-500 hover:bg-cyan-600",
              )}
            >
              {isPending ? "Processando…" : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
