import { ApiError } from "@/shared/api/errors";

import type { ApiResponse } from "@/shared/types/api";

type CustomerField =
  | "address.cep"
  | "address.city"
  | "address.complement"
  | "address.neighborhood"
  | "address.number"
  | "address.street"
  | "document"
  | "email"
  | "name"
  | "phone";

const FIELD_ALIASES: Record<string, CustomerField> = {
  address: "address.street",
  addressid: "address.cep",
  cep: "address.cep",
  city: "address.city",
  cnpj: "document",
  cpf: "document",
  document: "document",
  email: "email",
  name: "name",
  neighborhood: "address.neighborhood",
  number: "address.number",
  phone: "phone",
  street: "address.street",
};

type ParsedCustomerError = {
  code?: string;
  fieldErrors: Partial<Record<CustomerField, string>>;
  message: string;
};

export function parseCustomerError(
  envelope: unknown,
  status: number,
): ParsedCustomerError {
  const fieldErrors: Partial<Record<CustomerField, string>> = {};

  if (envelope instanceof ApiError) {
    for (const [field, value] of Object.entries(envelope.fieldErrors ?? {})) {
      const key = FIELD_ALIASES[field.toLowerCase()];
      const message = Array.isArray(value) ? value[0] : value;
      if (key && message && !fieldErrors[key]) {
        fieldErrors[key] = message;
      }
    }

    if (status === 409 && !fieldErrors.document) {
      fieldErrors.document = envelope.message;
    }

    return {
      code: envelope.code,
      fieldErrors,
      message: envelope.message || defaultMessageForStatus(status),
    };
  }

  const error =
    envelope && typeof envelope === "object"
      ? (envelope as ApiResponse<unknown>).error
      : null;

  if (Array.isArray(error?.details)) {
    for (const detail of error.details) {
      const key = FIELD_ALIASES[detail.field?.toLowerCase() ?? ""];
      const messages = detail.messages ?? detail.message;
      if (key && messages?.length && !fieldErrors[key]) {
        fieldErrors[key] = messages[0];
      }
    }
  } else if (error?.details && typeof error.details === "object") {
    for (const [field, messages] of Object.entries(error.details)) {
      const key = FIELD_ALIASES[field.toLowerCase()];
      if (key && messages.length > 0 && !fieldErrors[key]) {
        fieldErrors[key] = messages[0];
      }
    }
  }

  if (status === 409 && !fieldErrors.document) {
    fieldErrors.document =
      error?.message ?? "Já existe um cliente com esse documento.";
  }

  return {
    code: error?.code,
    fieldErrors,
    message: error?.message ?? defaultMessageForStatus(status),
  };
}

function defaultMessageForStatus(status: number) {
  if (status === 409) return "Já existe um cliente com esse documento.";
  if (status === 403) return "Você não tem permissão para esta operação.";
  if (status >= 500) return "Erro interno do servidor. Tente novamente.";
  return "Não foi possível salvar o cliente. Tente novamente.";
}
