"use client";

import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Icons } from "@/shared/lib/icons";
import { ApiError } from "@/shared/api/errors";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

import { deactivateCustomer } from "@/features/customer/api/customer-client.api";

type DeactivateCustomerButtonProps = {
  id: string;
  name: string;
};

export function DeactivateCustomerButton({
  id,
  name,
}: DeactivateCustomerButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const router = useRouter();

  async function confirmDeactivate() {
    setConfirmOpen(false);
    setIsDeactivating(true);
    try {
      await deactivateCustomer(id);
      toast.success(`${name} foi desativado com sucesso.`);
      router.push("/customers");
    } catch (error) {
      if (error instanceof ApiError && error.status === 403) {
        toast.error("Sem permissão para desativar clientes.");
        return;
      }
      if (error instanceof ApiError && error.status === 401) return;
      toast.error("Não foi possível desativar o cliente.");
    } finally {
      setIsDeactivating(false);
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={isDeactivating}
        onClick={() => setConfirmOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 focus:ring-2 focus:ring-red-300/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-400 dark:hover:bg-red-400/20"
      >
        <Icon icon={Icons.trash} className="h-4 w-4" aria-hidden />
        {isDeactivating ? "Desativando…" : "Desativar"}
      </button>

      <ConfirmDialog
        open={confirmOpen}
        variant="danger"
        title={`Desativar ${name}?`}
        description="O cliente será desativado e não poderá realizar novas compras. Esta ação pode ser revertida pelo suporte."
        confirmLabel="Desativar"
        cancelLabel="Cancelar"
        onConfirm={confirmDeactivate}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
