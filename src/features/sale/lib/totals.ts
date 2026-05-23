import type { CartItem } from "@/features/sale/store/cart-store";

export function calculateSaleTotals(items: CartItem[], discount: number) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const safeDiscount = Math.min(Math.max(discount, 0), 100);
  const discountValue = subtotal * (safeDiscount / 100);
  const total = subtotal - discountValue;

  return {
    discount: safeDiscount,
    discountValue,
    subtotal,
    total,
  };
}
