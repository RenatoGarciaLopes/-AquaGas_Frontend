"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";

import type { Funcionario } from "@/features/funcionario/types";

type RowActionsProps = {
  canManage: boolean;
  funcionario: Funcionario;
};

export function RowActions({ canManage, funcionario }: RowActionsProps) {
  const [isDeactivating, setIsDeactivating] = useState(false);
  const router = useRouter();
  const isInactive = funcionario.status.toUpperCase() === "INATIVO";

  async function handleDeactivate() {
    const confirmed = window.confirm(
      `Deseja desativar ${funcionario.name}? Esta ação pode impactar acessos futuros.`,
    );

    if (!confirmed) {
      return;
    }

    setIsDeactivating(true);

    try {
      const response = await fetch(`/api/funcionarios/${funcionario.id}`, {
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
      router.refresh();
    } finally {
      setIsDeactivating(false);
    }
  }

  return (
    <details className="relative inline-block text-left">
      <summary
        className="inline-flex cursor-pointer list-none items-center rounded-lg border border-white/10 p-2 text-slate-200 transition hover:bg-white/10 focus:ring-2 focus:ring-cyan-300/40 focus:outline-none"
        aria-label={`Ações de ${funcionario.name}`}
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden />
      </summary>
      <div className="absolute right-0 z-20 mt-2 min-w-40 overflow-hidden rounded-xl border border-white/10 bg-[#102b4d] py-1 shadow-2xl shadow-black/30">
        <Link
          href={`/funcionarios/${funcionario.id}`}
          className="block px-3 py-2 text-sm text-white transition hover:bg-white/10"
        >
          Ver
        </Link>
        {canManage ? (
          <>
            <Link
              href={`/funcionarios/${funcionario.id}/editar`}
              className="block px-3 py-2 text-sm text-white transition hover:bg-white/10"
            >
              Editar
            </Link>
            <button
              type="button"
              disabled={isDeactivating || isInactive}
              onClick={handleDeactivate}
              className="block w-full px-3 py-2 text-left text-sm text-red-100 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeactivating ? "Desativando..." : "Desativar"}
            </button>
          </>
        ) : null}
      </div>
    </details>
  );
}
