import { it, expect, describe } from "vitest";

import { suspendPlanSchema } from "@/features/plan/schemas/suspend-plan.schema";
import { upgradePlanSchema } from "@/features/plan/schemas/upgrade-plan.schema";
import { waivePenaltySchema } from "@/features/plan/schemas/waive-penalty.schema";
import { downgradePlanSchema } from "@/features/plan/schemas/downgrade-plan.schema";
import { cancelPenaltySchema } from "@/features/plan/schemas/cancel-penalty.schema";
import { cancelDeliverySchema } from "@/features/plan/schemas/cancel-delivery.schema";
import { rescheduleDeliverySchema } from "@/features/plan/schemas/reschedule-delivery.schema";

describe("plan action schemas", () => {
  it("exige duração quando o ciclo do upgrade é personalizado", () => {
    const result = upgradePlanSchema.safeParse({
      cycle: "Custom",
      items: [{ productId: "product-1", quantity: 2 }],
    });

    expect(result.success).toBe(false);
    if (result.success) throw new Error("Expected validation to fail");
    expect(result.error.flatten().fieldErrors.durationInMonths).toContain(
      "Duração é obrigatória para ciclo personalizado.",
    );
  });

  it("rejeita upgrade sem alteração de ciclo ou itens", () => {
    const result = upgradePlanSchema.safeParse({ reason: "Cliente pediu" });

    expect(result.success).toBe(false);
    if (result.success) throw new Error("Expected validation to fail");
    expect(result.error.flatten().fieldErrors.cycle).toContain(
      "Informe ao menos uma alteração (ciclo ou itens).",
    );
  });

  it("permite downgrade zerando a quantidade de um item e exige motivo útil", () => {
    expect(
      downgradePlanSchema.safeParse({
        items: [{ productId: "product-1", quantity: 0 }],
        reason: "Plano reduzido a pedido do cliente",
      }).success,
    ).toBe(true);

    expect(
      downgradePlanSchema.safeParse({
        items: [{ productId: "product-1", quantity: 0 }],
        reason: "abc",
      }).success,
    ).toBe(false);
  });

  it("valida motivos de suspensão, entrega e reagendamento", () => {
    expect(suspendPlanSchema.safeParse({ reason: "" }).success).toBe(false);
    expect(cancelDeliverySchema.safeParse({ reason: "" }).success).toBe(false);
    expect(
      rescheduleDeliverySchema.safeParse({
        newDate: "2026-06-10",
        reason: "rota",
      }).success,
    ).toBe(false);
    expect(
      rescheduleDeliverySchema.safeParse({
        newDate: "2026-06-10",
        reason: "Cliente solicitou outro horário",
      }).success,
    ).toBe(true);
  });

  it("exige justificativa longa para dispensar ou cancelar multa", () => {
    expect(waivePenaltySchema.safeParse({ reason: "curto" }).success).toBe(
      false,
    );
    expect(cancelPenaltySchema.safeParse({ reason: "curto" }).success).toBe(
      false,
    );
    expect(
      waivePenaltySchema.safeParse({ reason: "Ajuste aprovado pela gerência" })
        .success,
    ).toBe(true);
    expect(
      cancelPenaltySchema.safeParse({ reason: "Multa gerada por duplicidade" })
        .success,
    ).toBe(true);
  });
});
