"use client";

import { Icon } from "@iconify/react";
import { createPortal } from "react-dom";
import { useRef, useEffect } from "react";

import { cn } from "@/shared/lib/cn";
import { Icons } from "@/shared/lib/icons";

type ConfirmVariant = "default" | "danger";

type ConfirmDialogProps = {
  cancelLabel?: string;
  confirmLabel?: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  title: string;
  variant?: ConfirmVariant;
};

const TITLE_ID = "confirm-dialog-title";
const DESCRIPTION_ID = "confirm-dialog-description";

/**
 * Modal de confirmação reutilizável.
 *
 * Controlado pelo pai via `open`. Fecha por backdrop, tecla Escape ou pelos
 * botões. Em uso típico:
 *
 * ```tsx
 * <ConfirmDialog
 *   open={pending !== null}
 *   title="Descartar alterações?"
 *   description="Você tem alterações não salvas."
 *   confirmLabel="Descartar"
 *   variant="danger"
 *   onConfirm={...}
 *   onCancel={...}
 * />
 * ```
 */
export function ConfirmDialog({
  cancelLabel = "Cancelar",
  confirmLabel = "Confirmar",
  description,
  onCancel,
  onConfirm,
  open,
  title,
  variant = "default",
}: ConfirmDialogProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    // Foca o botão de confirmar quando o modal abre (substitui autoFocus).
    confirmButtonRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
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
  }, [open, onCancel]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  const isDanger = variant === "danger";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={TITLE_ID}
      aria-describedby={description ? DESCRIPTION_ID : undefined}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Fechar"
        tabIndex={-1}
        onClick={onCancel}
        className="absolute inset-0 cursor-default bg-black/30 backdrop-blur-[2px]"
      />

      <div className="border-border bg-card relative z-10 w-full max-w-md rounded-2xl border p-6 shadow-2xl shadow-black/40">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
              isDanger
                ? "bg-red-500/15 text-red-400"
                : "bg-cyan-500/15 text-cyan-400",
            )}
          >
            <Icon
              icon={isDanger ? Icons.alertTriangle : Icons.alertTriangle}
              className="h-5 w-5"
              aria-hidden
            />
          </div>

          <div className="flex-1">
            <h3
              id={TITLE_ID}
              className="text-foreground text-lg font-semibold tracking-tight"
            >
              {title}
            </h3>
            {description ? (
              <p
                id={DESCRIPTION_ID}
                className="text-muted-foreground mt-1.5 text-sm"
              >
                {description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse justify-end gap-2 sm:flex-row sm:gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="border-border text-foreground hover:bg-muted inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-semibold transition focus:ring-2 focus:ring-cyan-300/40 focus:outline-none"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={onConfirm}
            className={cn(
              "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition focus:ring-2 focus:outline-none",
              isDanger
                ? "bg-red-500 hover:bg-red-600 focus:ring-red-300/50"
                : "bg-cyan-500 hover:bg-cyan-600 focus:ring-cyan-300/50",
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
