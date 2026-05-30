"use client";

import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";

import { Icons } from "@/shared/lib/icons";
import { formatCurrency } from "@/shared/lib/formatters";

import type { SaleProduct } from "@/features/sale/types";

type PdvProductSearchProps = {
  products: SaleProduct[];
  onSelect: (product: SaleProduct) => void;
};

export function PdvProductSearch({
  products,
  onSelect,
}: PdvProductSearchProps) {
  const [search, setSearch] = useState("");
  const term = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    const base = term
      ? products.filter((product) => product.name.toLowerCase().includes(term))
      : products;

    return [...base]
      .sort((a, b) => Number(b.quantity > 0) - Number(a.quantity > 0))
      .slice(0, 8);
  }, [products, term]);

  return (
    <section className="border-border bg-card rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-foreground text-base font-semibold">Produtos</h2>
          <p className="text-muted-foreground text-sm">
            Busque e adicione itens ao carrinho.
          </p>
        </div>
      </div>

      <label className="relative block">
        <span className="sr-only">Buscar produto</span>
        <Icon
          icon={Icons.search}
          aria-hidden
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
        />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar produto..."
          className="border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-ring/40 w-full rounded-lg border py-2.5 pr-3 pl-9 text-sm focus:ring-2"
        />
      </label>

      <div className="divide-border border-border mt-3 divide-y overflow-hidden rounded-lg border">
        {filtered.length === 0 ? (
          <div className="text-muted-foreground px-4 py-6 text-center text-sm">
            Nenhum produto encontrado.
          </div>
        ) : (
          filtered.map((product) => {
            const outOfStock = product.quantity <= 0;
            return (
              <button
                key={product.id}
                type="button"
                disabled={outOfStock}
                onClick={() => onSelect(product)}
                className="bg-card hover:bg-muted/50 flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-55"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-foreground truncate text-sm font-medium">
                      {product.name}
                    </span>
                    <span className="border-border bg-muted text-muted-foreground rounded-full border px-2 py-0.5 text-xs font-medium">
                      {product.type === "Gas" ? "Gás" : "Água"}
                    </span>
                    {outOfStock ? (
                      <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
                        Sem estoque
                      </span>
                    ) : null}
                  </div>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {formatCurrency(product.price)} · estoque {product.quantity}
                  </p>
                </div>
                <Icon
                  icon={Icons.plus}
                  aria-hidden
                  className="text-primary h-5 w-5 shrink-0"
                />
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
