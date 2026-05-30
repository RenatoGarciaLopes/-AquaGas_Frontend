import { it, expect, describe } from "vitest";

import { calculateSaleTotals } from "@/features/sale/lib/totals";

const ITEMS = [
  {
    product: { id: "p1", name: "Água", price: 10, quantity: 10, type: "Water" },
    quantity: 2,
  },
  {
    product: { id: "p2", name: "Gás", price: 100, quantity: 5, type: "Gas" },
    quantity: 1,
  },
] as const;

describe("calculateSaleTotals", () => {
  it("calcula subtotal, desconto e total", () => {
    expect(calculateSaleTotals([...ITEMS], 10)).toEqual({
      discount: 10,
      discountValue: 12,
      subtotal: 120,
      total: 108,
    });
  });

  it("limita desconto entre 0 e 100", () => {
    expect(calculateSaleTotals([...ITEMS], -10).discount).toBe(0);
    expect(calculateSaleTotals([...ITEMS], 150)).toMatchObject({
      discount: 100,
      total: 0,
    });
  });
});
