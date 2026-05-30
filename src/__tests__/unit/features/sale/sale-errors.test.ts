import { it, expect, describe } from "vitest";

import { ApiError } from "@/shared/api/errors";

import { parseSaleError } from "@/features/sale/lib/sale-errors";

describe("sale error parser", () => {
  it("mapeia aliases e traduz mensagens de campo conhecidas", () => {
    const parsed = parseSaleError(
      new ApiError({
        fieldErrors: {
          discount: ["Discount cannot be greater than 100"],
          items: ["Informe ao menos um item."],
        },
        message: "Erro de validação",
        status: 400,
      }),
      400,
    );

    expect(parsed.fieldErrors).toEqual({
      discount: "Desconto não pode ser maior que 100%.",
      saleItems: "Informe ao menos um item.",
    });
  });

  it("mapeia estoque insuficiente para saleItems e usa fallback de venda", () => {
    expect(
      parseSaleError(
        {
          error: {
            code: "INSUFFICIENT_STOCK",
            message: "Estoque insuficiente para Água Mineral 20L.",
          },
          success: false,
        },
        409,
      ).fieldErrors,
    ).toEqual({
      saleItems: "Estoque insuficiente para Água Mineral 20L.",
    });

    expect(parseSaleError({ success: false }, 409).message).toBe(
      "Estoque insuficiente para um ou mais produtos.",
    );
  });
});
