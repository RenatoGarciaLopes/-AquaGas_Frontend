import { it, expect, describe } from "vitest";

import { ApiError } from "@/shared/api/errors";

import {
  parseProductError,
  parseEditDetailsError,
  parseStockAdjustmentError,
} from "@/features/product/lib/product-errors";

describe("product error parsers", () => {
  it("mapeia aliases do backend para campos de criação", () => {
    const parsed = parseProductError(
      new ApiError({
        fieldErrors: {
          productName: ["Nome duplicado."],
          stockQuantity: ["Quantidade inválida."],
        },
        message: "Erro de validação",
        status: 400,
      }),
      400,
    );

    expect(parsed.fieldErrors).toEqual({
      name: "Nome duplicado.",
      quantity: "Quantidade inválida.",
    });
  });

  it("filtra campos que não pertencem ao formulário de detalhes", () => {
    const parsed = parseEditDetailsError(
      new ApiError({
        fieldErrors: {
          name: ["Nome inválido."],
          quantity: ["Quantidade não pertence a este form."],
        },
        message: "Erro",
        status: 400,
      }),
      400,
    );

    expect(parsed.fieldErrors).toEqual({ name: "Nome inválido." });
  });

  it("mapeia estoque insuficiente para quantity no ajuste de estoque", () => {
    const parsed = parseStockAdjustmentError(
      {
        error: {
          code: "INSUFFICIENT_STOCK",
          message: "Estoque insuficiente. Atual: 2",
        },
        success: false,
      },
      409,
    );

    expect(parsed).toMatchObject({
      code: "INSUFFICIENT_STOCK",
      fieldErrors: { quantity: "Estoque insuficiente. Atual: 2" },
      message: "Estoque insuficiente. Atual: 2",
    });
  });

  it("roteia o conflito de tipo bloqueado (CONFLICT) para o campo type, traduzido", () => {
    const parsed = parseEditDetailsError(
      {
        error: {
          code: "CONFLICT",
          message: "Cannot change product type while stock exists",
        },
        success: false,
      },
      409,
    );

    expect(parsed.fieldErrors).toEqual({
      type: "Não é possível alterar o tipo enquanto houver estoque.",
    });
    expect(parsed.message).toBe(
      "Não é possível alterar o tipo enquanto houver estoque.",
    );
  });
});
