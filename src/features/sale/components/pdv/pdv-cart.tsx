"use client";

import { Icon } from "@iconify/react";

import { cn } from "@/shared/lib/cn";
import { Icons } from "@/shared/lib/icons";
import { formatCurrency } from "@/shared/lib/formatters";
import { onlyIntegerKeys, onlyIntegerPaste } from "@/shared/lib/masks";

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
          const inputId = `cart-quantity-${item.product.id}`;
          const max = item.product.quantity;
          const canDecrement = item.quantity > 1;
          const canIncrement = item.quantity < max;

          function adjust(delta: number) {
            const next = Math.min(
              Math.max(1, Math.trunc(item.quantity + delta)),
              max,
            );
            if (next !== item.quantity) {
              onQuantityChange(item.product.id, next);
            }
          }

          function handleInputChange(raw: string) {
            const parsed = Number(raw || 1);
            const safe = Math.min(Math.max(1, Math.trunc(parsed)), max);
            onQuantityChange(item.product.id, safe);
          }

          return (
            <div
              key={item.product.id}
              className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_13rem_7rem_2.5rem] sm:items-center"
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
                  {formatCurrency(item.product.price)} un. · estoque {max}
                </p>
              </div>

              <div
                className={cn(
                  "bg-muted/40 hover:bg-muted/60 focus-within:bg-muted/60",
                  "flex h-[58px] items-center rounded-xl border border-transparent px-3 transition",
                )}
              >
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor={inputId}
                    className="text-muted-foreground block text-xs font-medium"
                  >
                    Quantidade
                  </label>
                  <input
                    id={inputId}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={item.quantity}
                    onChange={(event) => handleInputChange(event.target.value)}
                    onKeyDown={onlyIntegerKeys}
                    onPaste={onlyIntegerPaste}
                    className="text-foreground placeholder:text-muted-foreground/60 mt-0.5 w-full border-0 bg-transparent p-0 text-sm leading-tight shadow-none outline-none focus:ring-0 focus:outline-none"
                  />
                </div>
                <div className="ml-2 flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label="Diminuir quantidade"
                    onClick={() => adjust(-1)}
                    disabled={!canDecrement}
                    className="text-muted-foreground hover:bg-muted hover:text-foreground border-border inline-flex h-7 w-7 items-center justify-center rounded-md border text-base leading-none font-semibold transition focus:ring-2 focus:ring-cyan-400/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    aria-label="Aumentar quantidade"
                    onClick={() => adjust(1)}
                    disabled={!canIncrement}
                    className="text-muted-foreground hover:bg-muted hover:text-foreground border-border inline-flex h-7 w-7 items-center justify-center rounded-md border text-base leading-none font-semibold transition focus:ring-2 focus:ring-cyan-400/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

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
