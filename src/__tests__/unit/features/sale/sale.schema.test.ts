import { describe, expect, it } from "vitest";

import { cancelSaleSchema } from "@/features/sale/schemas/cancel-sale.schema";
import { registerSaleSchema } from "@/features/sale/schemas/sale.schema";

describe("registerSaleSchema", () => {
  it("aceita venda balcão com item e desconto opcional", () => {
    expect(
      registerSaleSchema.safeParse({
        customerId: null,
        discount: 5,
        saleItems: [
          { productId: "550e8400-e29b-41d4-a716-446655440000", quantity: 1 },
        ],
      }).success,
    ).toBe(true);
  });

  it("rejeita venda sem itens, desconto inválido e quantidade zero", () => {
    expect(
      registerSaleSchema.safeParse({
        discount: 101,
        saleItems: [],
      }).success,
    ).toBe(false);

    expect(
      registerSaleSchema.safeParse({
        saleItems: [
          { productId: "550e8400-e29b-41d4-a716-446655440000", quantity: 0 },
        ],
      }).success,
    ).toBe(false);
  });
});

describe("cancelSaleSchema", () => {
  it("valida motivo de cancelamento", () => {
    expect(
      cancelSaleSchema.safeParse({ reason: "Cliente desistiu" }).success,
    ).toBe(true);
    expect(cancelSaleSchema.safeParse({ reason: "x" }).success).toBe(false);
  });
});
