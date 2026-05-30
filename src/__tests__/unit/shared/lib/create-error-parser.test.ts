import { it, expect, describe } from "vitest";

import { createErrorParser } from "@/shared/lib/create-error-parser";

import { ApiError } from "@/shared/api/errors";

const parseError = createErrorParser<"name" | "quantity">({
  fieldAliases: {
    name: "name",
    productname: "name",
    quantity: "quantity",
  },
  codeHandlers: {
    INSUFFICIENT_STOCK: (_, message, fieldErrors) => {
      fieldErrors.quantity ??= message;
    },
  },
  defaultMessage: () => "Fallback",
});

describe("createErrorParser", () => {
  it("normaliza fieldErrors de ApiError usando aliases", () => {
    const parsed = parseError(
      new ApiError({
        fieldErrors: {
          productName: ["Product name is required"],
        },
        message: "Erro",
        status: 400,
      }),
      400,
    );

    expect(parsed.fieldErrors).toEqual({
      name: "Nome do produto é obrigatório.",
    });
  });

  it("aceita details em array com message ou messages", () => {
    const parsed = parseError(
      {
        error: {
          details: [
            { field: "name", message: ["Product name is required"] },
            {
              field: "quantity",
              messages: ["Stock quantity cannot be negative"],
            },
          ],
          message: "Erro",
        },
        success: false,
      },
      400,
    );

    expect(parsed.fieldErrors).toEqual({
      name: "Nome do produto é obrigatório.",
      quantity: "Quantidade em estoque não pode ser negativa.",
    });
  });

  it("aceita details em objeto e não sobrescreve erro de campo com codeHandler", () => {
    const parsed = parseError(
      {
        error: {
          code: "INSUFFICIENT_STOCK",
          details: {
            quantity: ["Quantidade informada excede o estoque atual."],
          },
          message: "Estoque insuficiente.",
        },
        success: false,
      },
      409,
    );

    expect(parsed.fieldErrors).toEqual({
      quantity: "Quantidade informada excede o estoque atual.",
    });
  });

  it("usa codeHandler quando o backend não informa fieldErrors", () => {
    const parsed = parseError(
      {
        error: {
          code: "INSUFFICIENT_STOCK",
          message: "Estoque insuficiente.",
        },
        success: false,
      },
      409,
    );

    expect(parsed.fieldErrors).toEqual({
      quantity: "Estoque insuficiente.",
    });
  });
});
