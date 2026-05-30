"use client";

import { formatCurrency } from "@/shared/lib/formatters";

type PdvTotalsProps = {
  discount: number;
  discountValue: number;
  itemCount: number;
  subtotal: number;
  total: number;
};

export function PdvTotals({
  discount,
  discountValue,
  itemCount,
  subtotal,
  total,
}: PdvTotalsProps) {
  return (
    <section className="border-border bg-card rounded-lg border p-4">
      <h2 className="text-foreground text-base font-semibold">Resumo</h2>

      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Itens</dt>
          <dd className="text-foreground font-medium">{itemCount}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="text-foreground font-medium">
            {formatCurrency(subtotal)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Desconto ({discount}%)</dt>
          <dd className="text-foreground font-medium">
            - {formatCurrency(discountValue)}
          </dd>
        </div>
      </dl>

      <div className="bg-primary/10 mt-4 rounded-lg p-4">
        <span className="text-muted-foreground text-sm font-medium">Total</span>
        <p className="text-foreground mt-1 text-3xl font-semibold tracking-tight">
          {formatCurrency(total)}
        </p>
      </div>
    </section>
  );
}
