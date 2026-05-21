import type { ProductType } from "@/features/product/types";
import { PRODUCT_TYPE_LABEL } from "@/features/product/lib/product-format";

const TYPE_STYLES: Record<ProductType, string> = {
  Water:
    "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900/50 dark:bg-cyan-950/40 dark:text-cyan-300",
  Gas: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300",
};

export function ProductTypeBadge({ type }: { type: ProductType }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${TYPE_STYLES[type]}`}
    >
      {PRODUCT_TYPE_LABEL[type]}
    </span>
  );
}
