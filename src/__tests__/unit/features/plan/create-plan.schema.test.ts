import { it, expect, describe } from "vitest";

import { createPlanSchema } from "@/features/plan/schemas/create-plan.schema";

describe("createPlanSchema", () => {
  it("aceita dias recorrentes de 1 a 31", () => {
    const result = createPlanSchema.safeParse({
      billingDay: 29,
      customerId: "customer-1",
      cycle: "Monthly",
      deliveryDay: 31,
      items: [{ productId: "product-1", quantity: 1 }],
    });

    expect(result.success).toBe(true);
  });

  it("rejeita dias fora do intervalo permitido", () => {
    const result = createPlanSchema.safeParse({
      billingDay: 32,
      customerId: "customer-1",
      cycle: "Monthly",
      deliveryDay: 0,
      items: [{ productId: "product-1", quantity: 1 }],
    });

    expect(result.success).toBe(false);
  });
});
