import { Icon } from "@iconify/react";

import { Icons } from "@/shared/lib/icons";

import { getStockLevel } from "@/features/product/lib/product-format";

export function ProductStockCell({ quantity }: { quantity: number }) {
  const level = getStockLevel(quantity);

  if (level === "out") {
    return (
      <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
        Sem estoque
      </span>
    );
  }

  if (level === "low") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
        <Icon icon={Icons.alertTriangle} aria-hidden className="h-3.5 w-3.5" />
        {quantity}
      </span>
    );
  }

  return <span className="text-foreground">{quantity}</span>;
}
