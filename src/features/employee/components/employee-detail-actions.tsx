"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useRef, useState, useEffect } from "react";

import { Icons } from "@/shared/lib/icons";

type EmployeeDetailActionsProps = {
  employeeId: string;
  employeeName: string;
  isActive?: boolean;
};

export function EmployeeDetailActions({
  employeeId,
  employeeName,
  isActive,
}: EmployeeDetailActionsProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;

    cancelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function handleDeactivate() {
    setIsPending(true);

    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: "DELETE",
      });

      if (response.status === 401) {
        router.push("/login?expired=1");
        return;
      }

      if (response.status === 403) {
        toast.error("Sem permissão");
        return;
      }

      if (!response.ok) {
        toast.error("Não foi possível desativar o funcionário.");
        return;
      }

      toast.success("Funcionário desativado com sucesso.");
      setOpen(false);
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href={`/employees/${employeeId}/edit`}
        className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 focus:ring-2 focus:ring-cyan-300/50 focus:outline-none"
      >
        <Icon icon={Icons.edit} aria-hidden className="h-4 w-4" />
        Editar
      </Link>

      {isActive !== false ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-red-300/40 px-4 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/10 focus:ring-2 focus:ring-red-300/40 focus:outline-none"
        >
          <Icon icon={Icons.trash} aria-hidden className="h-4 w-4" />
          Desativar
        </button>
      ) : null}

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="deactivate-employee-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <div className="border-border bg-card w-full max-w-md rounded-2xl border p-6 shadow-xl">
            <h2
              id="deactivate-employee-title"
              className="text-foreground text-lg font-semibold"
            >
              Desativar funcionário
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Tem certeza que deseja desativar {employeeName}? Esta ação impede
              o acesso do funcionário ao sistema.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                ref={cancelRef}
                type="button"
                disabled={isPending}
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground rounded-lg px-4 py-2 text-sm font-medium transition focus:ring-2 focus:ring-white/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => void handleDeactivate()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 focus:ring-2 focus:ring-red-300/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPending ? "Desativando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
