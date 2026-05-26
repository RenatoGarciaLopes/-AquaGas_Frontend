import { describe, expect, it } from "vitest";

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

  it("mapeia tipo bloqueado para type", () => {
    const parsed = parseEditDetailsError(
      {
        error: {
          code: "PRODUCT_TYPE_LOCKED",
          message: "Tipo bloqueado.",
        },
        success: false,
      },
      409,
    );

    expect(parsed.fieldErrors).toEqual({ type: "Tipo bloqueado." });
  });
});
