"use client";

import { Icon } from "@iconify/react";

import { Icons } from "@/shared/lib/icons";
import { formatCurrency } from "@/shared/lib/formatters";

import { EmptyState } from "@/shared/ui/empty-state";

import type { CartItem } from "@/features/sale/store/cart-store";

type PdvCartProps = {
  items: CartItem[];
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
};

export function PdvCart({ items, onQuantityChange, onRemove }: PdvCartProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Carrinho vazio"
        description="Adicione pelo menos um produto para finalizar a venda."
      />
    );
  }

  return (
    <section className="border-border bg-card rounded-lg border">
      <div className="border-border border-b px-4 py-3">
        <h2 className="text-foreground text-base font-semibold">Carrinho</h2>
        <p className="text-muted-foreground text-sm">
          Ajuste quantidades antes de finalizar.
        </p>
      </div>

      <div className="divide-border divide-y">
        {items.map((item) => {
          const lineTotal = item.product.price * item.quantity;
          return (
            <div
              key={item.product.id}
              className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_9rem_7rem_2.5rem] sm:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-foreground truncate text-sm font-medium">
                    {item.product.name}
                  </h3>
                  <span className="border-border bg-muted text-muted-foreground rounded-full border px-2 py-0.5 text-xs font-medium">
                    {item.product.type === "Gas" ? "Gás" : "Água"}
                  </span>
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {formatCurrency(item.product.price)} un. · estoque{" "}
                  {item.product.quantity}
                </p>
              </div>

              <label className="space-y-1">
                <span className="text-muted-foreground text-xs font-medium">
                  Quantidade
                </span>
                <input
                  type="number"
                  min={1}
                  max={item.product.quantity}
                  value={item.quantity}
                  onChange={(event) =>
                    onQuantityChange(
                      item.product.id,
                      Number(event.target.value || 1),
                    )
                  }
                  className="border-input bg-background text-foreground focus:ring-ring/40 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2"
                />
              </label>

              <div className="sm:text-right">
                <span className="text-muted-foreground text-xs font-medium">
                  Total
                </span>
                <p className="text-foreground text-sm font-semibold">
                  {formatCurrency(lineTotal)}
                </p>
              </div>

              <button
                type="button"
                aria-label={`Remover ${item.product.name}`}
                onClick={() => onRemove(item.product.id)}
                className="border-border text-muted-foreground inline-flex h-10 w-10 items-center justify-center rounded-lg border transition hover:bg-red-500/10 hover:text-red-400"
              >
                <Icon icon={Icons.trash} aria-hidden className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
