import { it, expect, describe } from "vitest";

import { ApiError } from "@/shared/api/errors";

import { parseCustomerError } from "@/features/customer/lib/customer-errors";

describe("parseCustomerError", () => {
  describe("a partir de ApiError", () => {
    it("mapeia fieldErrors do backend para os campos do form (cpf → document)", () => {
      const apiError = new ApiError({
        fieldErrors: { cpf: ["Documento já cadastrado."] },
        message: "Conflict.",
        status: 409,
      });

      const parsed = parseCustomerError(apiError, 409);

      expect(parsed.fieldErrors.document).toBe("Documento já cadastrado.");
    });

    it("mapeia aliases de endereço (cep, street, city, neighborhood, number) para address.*", () => {
      const apiError = new ApiError({
        fieldErrors: {
          cep: ["CEP inválido."],
          city: ["Cidade obrigatória."],
          neighborhood: ["Bairro obrigatório."],
          number: ["Número obrigatório."],
          street: ["Rua obrigatória."],
        },
        message: "Validation failed.",
        status: 400,
      });

      const parsed = parseCustomerError(apiError, 400);

      expect(parsed.fieldErrors["address.cep"]).toBe("CEP inválido.");
      expect(parsed.fieldErrors["address.city"]).toBe("Cidade obrigatória.");
      expect(parsed.fieldErrors["address.neighborhood"]).toBe(
        "Bairro obrigatório.",
      );
      expect(parsed.fieldErrors["address.number"]).toBe("Número obrigatório.");
      expect(parsed.fieldErrors["address.street"]).toBe("Rua obrigatória.");
    });

    it("em 409 sem fieldErrors, joga a mensagem no campo document", () => {
      const apiError = new ApiError({
        message: "Cliente duplicado.",
        status: 409,
      });

      const parsed = parseCustomerError(apiError, 409);

      expect(parsed.fieldErrors.document).toBe("Cliente duplicado.");
    });

    it("preserva o code original", () => {
      const apiError = new ApiError({
        code: "CUSTOMER_DUPLICATE",
        message: "x",
        status: 409,
      });

      const parsed = parseCustomerError(apiError, 409);
      expect(parsed.code).toBe("CUSTOMER_DUPLICATE");
    });
  });

  describe("a partir de envelope ApiResponse cru", () => {
    it("lê details em formato Array<{ field, messages }>", () => {
      const envelope = {
        data: null,
        error: {
          code: "VALIDATION",
          details: [{ field: "email", messages: ["Email inválido."] }],
          message: "Validation failed.",
        },
        success: false,
        timestamp: "2026-05-23T00:00:00.000Z",
      };

      const parsed = parseCustomerError(envelope, 400);
      expect(parsed.fieldErrors.email).toBe("Email inválido.");
    });

    it("lê details em formato Record<field, string[]>", () => {
      const envelope = {
        data: null,
        error: {
          details: { phone: ["Telefone inválido."] },
          message: "Validation failed.",
        },
        success: false,
        timestamp: "2026-05-23T00:00:00.000Z",
      };

      const parsed = parseCustomerError(envelope, 400);
      expect(parsed.fieldErrors.phone).toBe("Telefone inválido.");
    });
  });

  describe("mensagens default por status", () => {
    it("403 sem ApiError retorna mensagem de permissão", () => {
      const parsed = parseCustomerError({}, 403);
      expect(parsed.message).toBe("Você não tem permissão para esta operação.");
    });

    it("500 retorna mensagem de erro interno", () => {
      const parsed = parseCustomerError({}, 500);
      expect(parsed.message).toBe("Erro interno do servidor. Tente novamente.");
    });

    it("erro genérico (4xx desconhecido) retorna mensagem padrão", () => {
      const parsed = parseCustomerError({}, 422);
      expect(parsed.message).toBe(
        "Não foi possível salvar o cliente. Tente novamente.",
      );
    });
  });

  describe("entrada desconhecida", () => {
    it("não quebra com null/undefined", () => {
      expect(() => parseCustomerError(null, 0)).not.toThrow();
      expect(() => parseCustomerError(undefined, 0)).not.toThrow();
    });
  });
});
