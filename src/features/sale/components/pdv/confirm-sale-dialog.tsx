"use client";

import { formatCurrency } from "@/shared/lib/formatters";

import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

import type { SaleCustomer } from "@/features/sale/types";
import type { CartItem } from "@/features/sale/store/cart-store";

type ConfirmSaleDialogProps = {
  customer: SaleCustomer | null;
  discount: number;
  items: CartItem[];
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
  pending: boolean;
  total: number;
};

export function ConfirmSaleDialog({
  customer,
  discount,
  items,
  onCancel,
  onConfirm,
  open,
  pending,
  total,
}: ConfirmSaleDialogProps) {
  const description = `${items.length} item(ns) · ${
    customer?.name ?? "Venda balcão"
  } · desconto ${discount}% · total ${formatCurrency(total)}`;

  return (
    <ConfirmDialog
      open={open}
      title="Finalizar venda?"
      description={description}
      cancelLabel="Voltar"
      confirmLabel={pending ? "Finalizando..." : "Finalizar venda"}
      onCancel={pending ? () => undefined : onCancel}
      onConfirm={pending ? () => undefined : onConfirm}
    />
  );
}
