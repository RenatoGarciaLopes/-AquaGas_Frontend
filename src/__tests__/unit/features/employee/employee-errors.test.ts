import { it, expect, describe } from "vitest";

import { ApiError } from "@/shared/api/errors";

import {
  parseEditPersonalError,
  parseCreateEmployeeError,
} from "@/features/employee/lib/employee-errors";

describe("employee error parsers", () => {
  it("mapeia aliases do backend para o formulário de criação", () => {
    const parsed = parseCreateEmployeeError(
      new ApiError({
        fieldErrors: {
          email: ["Invalid email"],
          userName: ["Username already registered"],
        },
        message: "Erro de validação",
        status: 400,
      }),
      400,
    );

    expect(parsed.fieldErrors).toEqual({
      email: "E-mail inválido.",
      userName: "Username already registered",
    });
  });

  it("filtra campos que não pertencem à edição de dados pessoais", () => {
    const parsed = parseEditPersonalError(
      {
        error: {
          details: {
            email: ["Invalid email"],
            password: ["Password cannot be empty"],
            phone: ["Invalid phone"],
          },
          message: "Erro",
        },
        success: false,
      },
      400,
    );

    expect(parsed.fieldErrors).toEqual({
      email: "E-mail inválido.",
      phone: "Telefone inválido.",
    });
  });

  it("usa defaults do domínio para conflitos e falhas de servidor", () => {
    expect(parseCreateEmployeeError({ success: false }, 409).message).toBe(
      "Conflito de dados do funcionário.",
    );
    expect(parseCreateEmployeeError({ success: false }, 500).message).toBe(
      "Erro interno do servidor. Tente novamente.",
    );
  });
});
