"use client";

import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";

import { Icons } from "@/shared/lib/icons";

import type { EmployeeStatus } from "@/features/employee/types";

type DeactivateEmployeeDialogProps = {
  employeeId: string;
  employeeName: string;
  initialStatus: EmployeeStatus;
};

export function DeactivateEmployeeDialog({
  employeeId,
  employeeName,
  initialStatus,
}: DeactivateEmployeeDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [status, setStatus] = useState(initialStatus);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const isInactive = status === "INATIVO";

  useEffect(() => {
    if (!open) return;

    cancelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function handleConfirm() {
    setIsPending(true);

    try {
      const res = await fetch(`/api/employees/${employeeId}`, {
        method: "DELETE",
      });

      if (res.status === 401) {
        router.push("/login?expired=1");
        return;
      }

      if (res.status === 403) {
        toast.error("Sem permissão");
        return;
      }

      if (res.status === 404) {
        toast.error("Funcionário não encontrado.");
        return;
      }

      if (!res.ok) {
        toast.error("Não foi possível desativar o funcionário.");
        return;
      }

      setStatus("INATIVO");
      setOpen(false);
      toast.success(`${employeeName} foi desativado com sucesso.`);
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={isInactive}
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-red-300/40 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus:ring-2 focus:ring-red-300/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Icon icon={Icons.trash} aria-hidden className="h-4 w-4" />
        {isInactive ? "Funcionário inativo" : "Desativar"}
      </button>

      {open ? (
        <div
          aria-labelledby="deactivate-employee-title"
          aria-describedby="deactivate-employee-description"
          aria-modal="true"
          role="alertdialog"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="border-border bg-card w-full max-w-md rounded-2xl border p-6 shadow-xl">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 text-red-600">
              <Icon
                icon={Icons.alertTriangle}
                aria-hidden
                className="h-6 w-6"
              />
            </div>
            <h2
              id="deactivate-employee-title"
              className="text-foreground text-lg font-semibold"
            >
              Desativar funcionário?
            </h2>
            <p
              id="deactivate-employee-description"
              className="text-muted-foreground mt-2 text-sm"
            >
              Esta ação vai desativar {employeeName} e impedir o acesso do
              funcionário ao sistema.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                ref={cancelRef}
                type="button"
                disabled={isPending}
                onClick={() => setOpen(false)}
                className="border-border text-foreground hover:bg-muted focus:ring-ring/40 rounded-lg border px-4 py-2 text-sm font-semibold transition focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleConfirm}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus:ring-2 focus:ring-red-300/60 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "Desativando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
