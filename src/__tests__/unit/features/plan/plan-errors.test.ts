import { it, expect, describe } from "vitest";

import { ApiError } from "@/shared/api/errors";

import {
  parseCreatePlanError,
  parsePlanActionError,
  parseUpgradePlanError,
  parseDowngradePlanError,
} from "@/features/plan/lib/plan-errors";

describe("plan error parsers", () => {
  it("mapeia aliases do backend para campos do wizard de criação", () => {
    const parsed = parseCreatePlanError(
      new ApiError({
        fieldErrors: {
          billingDay: ["Dia inválido."],
          customerId: ["Selecione um cliente."],
          planItems: ["Adicione itens ao plano."],
        },
        message: "Erro de validação",
        status: 400,
      }),
      400,
    );

    expect(parsed.fieldErrors).toEqual({
      billingDay: "Dia inválido.",
      customerId: "Selecione um cliente.",
      items: "Adicione itens ao plano.",
    });
  });

  it("roteia estoque insuficiente para itens sem depender de details", () => {
    const parsed = parseCreatePlanError(
      {
        error: {
          code: "INSUFFICIENT_STOCK",
          message: "Estoque insuficiente para Água Mineral 20L.",
        },
        success: false,
      },
      409,
    );

    expect(parsed).toMatchObject({
      code: "INSUFFICIENT_STOCK",
      fieldErrors: { items: "Estoque insuficiente para Água Mineral 20L." },
      message: "Estoque insuficiente para Água Mineral 20L.",
    });
  });

  it("filtra campos conforme a operação de upgrade e downgrade", () => {
    const parsedUpgrade = parseUpgradePlanError(
      new ApiError({
        fieldErrors: {
          customerId: ["Não pertence ao diálogo."],
          durationInMonths: ["Duração inválida."],
          items: ["Itens inválidos."],
        },
        message: "Erro",
        status: 400,
      }),
      400,
    );

    const parsedDowngrade = parseDowngradePlanError(
      new ApiError({
        fieldErrors: {
          billingDay: ["Não pertence ao diálogo."],
          reason: ["Informe um motivo."],
        },
        message: "Erro",
        status: 400,
      }),
      400,
    );

    expect(parsedUpgrade.fieldErrors).toEqual({
      durationInMonths: "Duração inválida.",
      items: "Itens inválidos.",
    });
    expect(parsedDowngrade.fieldErrors).toEqual({
      reason: "Informe um motivo.",
    });
  });

  it("traduz conflitos conhecidos de ciclo de vida e usa defaults por status", () => {
    expect(
      parsePlanActionError(
        {
          error: {
            code: "CONFLICT",
            message: "Cannot cancel a finished plan",
          },
          success: false,
        },
        409,
      ).message,
    ).toBe("Não é possível cancelar um plano finalizado.");

    expect(parsePlanActionError({ success: false }, 403).message).toBe(
      "Você não tem permissão para esta operação.",
    );
    expect(parsePlanActionError({ success: false }, 500).message).toBe(
      "Erro interno do servidor. Tente novamente.",
    );
  });
});
