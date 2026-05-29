"use client";

import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Icons } from "@/shared/lib/icons";

import { ApiError } from "@/shared/api/errors";

import { cancelSale } from "@/features/sale/api/sale-client.api";
import { CancelSaleDialog } from "@/features/sale/components/cancel-sale-dialog";
import type { CancelSaleFormData } from "@/features/sale/schemas/cancel-sale.schema";

type CancelSaleButtonProps = {
  saleId: string;
  createdAt: string;
};

export function CancelSaleButton({ saleId, createdAt }: CancelSaleButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  // Janela de cancelamento é relativa ao "agora" da renderização. Não há como
  // saber se passou de 24h sem ler o relógio do cliente.
  const expired = useMemo(
    () =>
      // eslint-disable-next-line react-hooks/purity
      Date.now() - new Date(createdAt).getTime() > 24 * 60 * 60 * 1000,
    [createdAt],
  );

  async function handleConfirm(data: CancelSaleFormData) {
    setIsPending(true);
    try {
      await cancelSale(saleId, { reason: data.reason });
      setDialogOpen(false);
      toast.success("Venda cancelada com sucesso.");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        toast.error(error.message);
        setDialogOpen(false);
        return;
      }
      if (error instanceof ApiError && error.status === 403) return;
      if (error instanceof ApiError && error.status === 401) return;
      toast.error("Não foi possível cancelar a venda.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <>
      <span
        title={
          expired
            ? "Não é possível cancelar uma venda com mais de 24 horas."
            : undefined
        }
        className={expired ? "cursor-not-allowed" : undefined}
      >
        <button
          type="button"
          disabled={expired}
          onClick={() => !expired && setDialogOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 focus:ring-2 focus:ring-red-300/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-400 dark:hover:bg-red-400/20"
        >
          <Icon icon={Icons.x} className="h-4 w-4" aria-hidden />
          Cancelar venda
        </button>
      </span>

      <CancelSaleDialog
        open={dialogOpen}
        isPending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setDialogOpen(false)}
      />
    </>
  );
}
