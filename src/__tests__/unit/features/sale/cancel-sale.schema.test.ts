import { it, expect, describe } from "vitest";

import { cancelSaleSchema } from "@/features/sale/schemas/cancel-sale.schema";

describe("cancelSaleSchema", () => {
  it("aceita motivo válido", () => {
    expect(
      cancelSaleSchema.safeParse({ reason: "Cliente solicitou cancelamento" })
        .success,
    ).toBe(true);
  });

  it("rejeita motivo vazio", () => {
    const result = cancelSaleSchema.safeParse({ reason: "" });

    expect(result.success).toBe(false);
  });
});
