"use client";

import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@iconify/react";

import { Icons } from "@/shared/lib/icons";

type ReactivatePlanButtonProps = {
  isPending: boolean;
  onConfirm: () => void;
};

export function ReactivatePlanButton({
  isPending,
  onConfirm,
}: ReactivatePlanButtonProps) {
  const [open, setOpen] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isPending) {
        event.stopPropagation();
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, isPending]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-300/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Icon icon={Icons.refresh} className="h-4 w-4" aria-hidden />
        Reativar
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="reactivate-plan-title"
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <button
                type="button"
                aria-label="Fechar"
                tabIndex={-1}
                disabled={isPending}
                onClick={() => setOpen(false)}
                className="absolute inset-0 cursor-default bg-black/30 backdrop-blur-[2px]"
              />
              <div className="border-border bg-card relative z-10 w-full max-w-md rounded-2xl border p-6 shadow-2xl shadow-black/40">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                    <Icon
                      icon={Icons.refresh}
                      className="h-5 w-5"
                      aria-hidden
                    />
                  </div>
                  <div className="flex-1">
                    <h3
                      id="reactivate-plan-title"
                      className="text-foreground text-lg font-semibold tracking-tight"
                    >
                      Reativar plano?
                    </h3>
                    <p className="text-muted-foreground mt-1.5 text-sm">
                      As entregas e cobranças serão reagendadas a partir da data
                      atual. O plano voltará ao status ativo.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-col-reverse justify-end gap-2 sm:flex-row sm:gap-3">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setOpen(false)}
                    className="border-border text-foreground hover:bg-muted inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-semibold transition focus:ring-2 focus:ring-cyan-300/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Voltar
                  </button>
                  <button
                    ref={confirmRef}
                    type="button"
                    disabled={isPending}
                    onClick={() => {
                      onConfirm();
                      setOpen(false);
                    }}
                    className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-300/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isPending ? "Reativando…" : "Reativar plano"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
