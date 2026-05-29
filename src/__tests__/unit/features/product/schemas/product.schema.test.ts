import { it, expect, describe } from "vitest";

import { createProductSchema } from "@/features/product/schemas/create-product.schema";
import {
  adjustStockSchema,
  editProductDetailsSchema,
} from "@/features/product/schemas/edit-product.schema";

describe("createProductSchema", () => {
  it("aceita produto válido", () => {
    expect(
      createProductSchema.safeParse({
        name: "Água Mineral 20L",
        price: 12.5,
        quantity: 0,
        type: "Water",
      }).success,
    ).toBe(true);
  });

  it("rejeita nome curto, preço não positivo e estoque negativo", () => {
    const result = createProductSchema.safeParse({
      name: "A",
      price: 0,
      quantity: -1,
      type: "Gas",
    });

    expect(result.success).toBe(false);
    expect(result.error?.flatten().fieldErrors).toMatchObject({
      name: expect.any(Array),
      price: expect.any(Array),
      quantity: expect.any(Array),
    });
  });
});

describe("editProductDetailsSchema", () => {
  it("rejeita preço zero", () => {
    expect(
      editProductDetailsSchema.safeParse({
        name: "Gás 13kg",
        price: 0,
        type: "Gas",
      }).success,
    ).toBe(false);
  });
});

describe("adjustStockSchema", () => {
  it("aceita entrada válida e rejeita quantidade zero", () => {
    expect(
      adjustStockSchema.safeParse({
        quantity: 1,
        reason: "Reposição",
        stockMovementType: "Entry",
      }).success,
    ).toBe(true);

    expect(
      adjustStockSchema.safeParse({
        quantity: 0,
        reason: "x",
        stockMovementType: "Exit",
      }).success,
    ).toBe(false);
  });
});
