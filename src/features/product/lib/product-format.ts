import type { ProductType } from "@/features/product/types";

export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  Water: "Água",
  Gas: "Gás",
};

export const LOW_STOCK_THRESHOLD = 5;

export type StockLevel = "out" | "low" | "ok";

export function getStockLevel(quantity: number): StockLevel {
  if (quantity <= 0) return "out";
  if (quantity <= LOW_STOCK_THRESHOLD) return "low";
  return "ok";
}
