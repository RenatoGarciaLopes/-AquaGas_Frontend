import { ApiError, type ApiFieldErrors } from "@/shared/api/errors";

import type { CreateFuncionarioPayload } from "@/features/funcionario/schemas/create-funcionario-schema";

type ApiErrorEnvelope = {
  code?: string;
  error?: {
    code?: string;
    fieldErrors?: ApiFieldErrors;
    message?: string;
  } | null;
  fieldErrors?: ApiFieldErrors;
  message?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeFieldErrors(
  payload: ApiErrorEnvelope | undefined,
  status: number,
) {
  const fieldErrors = payload?.error?.fieldErrors ?? payload?.fieldErrors;

  if (fieldErrors && status === 409) {
    return Object.fromEntries(
      Object.entries(fieldErrors).map(([field, message]) => {
        const normalizedField = field.toLowerCase();

        if (normalizedField === "cpf") {
          return [field, "CPF já cadastrado"];
        }

        if (
          normalizedField === "username" ||
          normalizedField === "user_name" ||
          normalizedField === "usuario"
        ) {
          return [field, "Usuário já existente"];
        }

        return [field, message];
      }),
    );
  }

  if (fieldErrors || status !== 409) {
    return fieldErrors;
  }

  const message = `${payload?.error?.message ?? payload?.message ?? ""}`.toLowerCase();

  if (message.includes("cpf")) {
    return { cpf: "CPF já cadastrado" };
  }

  if (message.includes("usuario") || message.includes("user")) {
    return { userName: "Usuário já existente" };
  }

  return undefined;
}

function getErrorMessage(payload: ApiErrorEnvelope | undefined) {
  return payload?.error?.message ?? payload?.message ?? "Erro ao criar funcionário";
}

export async function createFuncionario(data: CreateFuncionarioPayload) {
  const response = await fetch("/api/funcionarios", {
    body: JSON.stringify(data),
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
  });
  const payload = (await response.json().catch(() => null)) as unknown;
  const errorPayload = isRecord(payload) ? (payload as ApiErrorEnvelope) : undefined;

  if (!response.ok) {
    throw new ApiError({
      code: errorPayload?.error?.code ?? errorPayload?.code,
      fieldErrors: normalizeFieldErrors(errorPayload, response.status),
      message: getErrorMessage(errorPayload),
      status: response.status,
    });
  }

  return payload;
}
