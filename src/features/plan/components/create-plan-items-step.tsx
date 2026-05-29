"use client";

import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";

import { Icons } from "@/shared/lib/icons";
import { formatCurrency } from "@/shared/lib/formatters";

import { QuantityInput } from "@/shared/ui/quantity-input";

type Product = {
  id: string;
  name: string;
  price: number;
  type: string;
};

type PlanItem = {
  productId: string;
  quantity: number;
};

type CreatePlanItemsStepProps = {
  products: Product[];
  items: PlanItem[];
  onItemsChange: (items: PlanItem[]) => void;
  error?: string;
};

export function CreatePlanItemsStep({
  products,
  items,
  onItemsChange,
  error,
}: CreatePlanItemsStepProps) {
  const [search, setSearch] = useState("");
  const term = search.trim().toLowerCase();

  const addedIds = new Set(items.map((i) => i.productId));

  const available = useMemo(() => {
    const list = products.filter((p) => !addedIds.has(p.id));
    if (!term) return list.slice(0, 6);
    return list.filter((p) => p.name.toLowerCase().includes(term)).slice(0, 6);
  }, [products, addedIds, term]);

  function addProduct(productId: string) {
    onItemsChange([...items, { productId, quantity: 1 }]);
    setSearch("");
  }

  function removeProduct(productId: string) {
    onItemsChange(items.filter((i) => i.productId !== productId));
  }

  function updateQuantity(productId: string, quantity: number) {
    onItemsChange(
      items.map((i) =>
        i.productId === productId
          ? { ...i, quantity: Math.max(1, quantity) }
          : i,
      ),
    );
  }

  function getProduct(productId: string) {
    return products.find((p) => p.id === productId);
  }

  return (
    <div className="space-y-5">
      {items.length > 0 ? (
        <div className="border-border divide-border divide-y rounded-lg border">
          {items.map((item) => {
            const product = getProduct(item.productId);
            if (!product) return null;
            return (
              <div
                key={item.productId}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-foreground text-sm font-medium">
                    {product.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatCurrency(product.price)} / un
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <QuantityInput
                    value={item.quantity}
                    min={1}
                    onChange={(qty) => updateQuantity(item.productId, qty)}
                  />
                  <button
                    type="button"
                    onClick={() => removeProduct(item.productId)}
                    className="text-muted-foreground transition hover:text-red-500"
                    aria-label={`Remover ${product.name}`}
                  >
                    <Icon icon={Icons.trash} className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {error ? (
        <p className="px-1 text-xs font-medium text-red-700 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <div className="space-y-3">
        <div className="relative">
          <Icon
            icon={Icons.search}
            aria-hidden
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produto para adicionar…"
            aria-label="Buscar produto"
            className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring/30 w-full rounded-lg border py-2.5 pr-4 pl-9 text-sm transition focus:ring-2 focus:outline-none"
          />
        </div>

        {available.length > 0 ? (
          <div className="divide-border border-border max-h-60 divide-y overflow-y-auto rounded-lg border">
            {available.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => addProduct(product.id)}
                className="hover:bg-muted/50 flex w-full items-center gap-3 px-4 py-3 text-left transition"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-500">
                  <Icon icon={Icons.package} className="h-4 w-4" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-sm font-medium">
                    {product.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {formatCurrency(product.price)}
                  </p>
                </div>
                <Icon
                  icon={Icons.plus}
                  className="text-muted-foreground h-4 w-4"
                  aria-hidden
                />
              </button>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-center text-sm">
            {items.length === products.length
              ? "Todos os produtos já foram adicionados."
              : "Nenhum produto encontrado."}
          </p>
        )}
      </div>
    </div>
  );
}
