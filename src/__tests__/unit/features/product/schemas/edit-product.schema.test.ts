import { describe, expect, it } from "vitest";

import {
  adjustStockSchema,
  editProductDetailsSchema,
} from "@/features/product/schemas/edit-product.schema";

describe("editProduct schemas", () => {
  it("valida detalhes do produto", () => {
    expect(
      editProductDetailsSchema.safeParse({
        name: "Água Mineral",
        price: 12.5,
        type: "Water",
      }).success,
    ).toBe(true);
  });

  it("rejeita preço inválido", () => {
    expect(
      editProductDetailsSchema.safeParse({
        name: "Água Mineral",
        price: 0,
        type: "Water",
      }).success,
    ).toBe(false);
  });

  it("valida ajuste positivo e negativo de estoque", () => {
    expect(
      adjustStockSchema.safeParse({
        quantity: 5,
        reason: "Reposição",
        stockMovementType: "Entry",
      }).success,
    ).toBe(true);
    expect(
      adjustStockSchema.safeParse({
        quantity: 2,
        reason: "Avaria",
        stockMovementType: "Exit",
      }).success,
    ).toBe(true);
  });
});
