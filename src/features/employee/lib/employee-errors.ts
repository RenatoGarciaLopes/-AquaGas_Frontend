import type { CreateEmployeeSchema } from "@/features/employee/schemas/create-employee.schema";

import type { ApiResponse } from "@/shared/types/api";

export type EmployeeFieldErrors = Partial<
  Record<keyof CreateEmployeeSchema, string>
>;

export type ParsedEmployeeError = {
  fieldErrors: EmployeeFieldErrors;
  message: string;
};

const FIELD_ALIASES: Record<string, keyof CreateEmployeeSchema> = {
  cpf: "cpf",
  email: "email",
  name: "name",
  password: "password",
  phone: "phone",
  role: "role",
  username: "userName",
};

const FALLBACK_MESSAGE =
  "Não foi possível cadastrar o funcionário. Tente novamente.";

export function parseEmployeeError(
  envelope: unknown,
  status: number,
): ParsedEmployeeError {
  const fieldErrors: EmployeeFieldErrors = {};

  const error =
    envelope && typeof envelope === "object"
      ? (envelope as ApiResponse<unknown>).error
      : null;

  if (error?.details?.length) {
    for (const detail of error.details) {
      const key = FIELD_ALIASES[detail.field?.toLowerCase() ?? ""];
      const messages = "messages" in detail ? detail.messages : detail.message;
      if (key && messages?.length && !fieldErrors[key]) {
        fieldErrors[key] = translateFieldMessage(key, messages[0]);
      }
    }
  }

  const message = error?.message ?? defaultMessageForStatus(status);

  if (status === 409) {
    const conflictField = conflictFieldFromMessage(message);
    if (conflictField && !fieldErrors[conflictField]) {
      fieldErrors[conflictField] = conflictMessage(conflictField);
    }
  }

  return { fieldErrors, message: defaultMessageForStatus(status, message) };
}

function conflictFieldFromMessage(
  message: string,
): keyof CreateEmployeeSchema | null {
  const normalized = message.toLowerCase();
  if (normalized.includes("cpf")) return "cpf";
  if (normalized.includes("username") || normalized.includes("user")) {
    return "userName";
  }
  if (normalized.includes("email")) return "email";
  return null;
}

function conflictMessage(field: keyof CreateEmployeeSchema): string {
  if (field === "cpf") return "CPF já cadastrado";
  if (field === "userName") return "Usuário já existente";
  if (field === "email") return "Email já cadastrado";
  return "Registro já existente";
}

function translateFieldMessage(
  field: keyof CreateEmployeeSchema,
  message: string,
): string {
  if (field === "cpf") return "CPF inválido";
  if (field === "phone") return "Telefone inválido";
  if (field === "email") return "Email inválido";
  if (field === "password") return "Senha inválida";
  if (field === "role") return "Cargo inválido";
  if (field === "userName") return message || "Informe o usuário";
  return message;
}

function defaultMessageForStatus(status: number, message?: string): string {
  if (status === 409) return message ?? "Funcionário já cadastrado.";
  if (status === 403) return "Você não tem permissão para criar funcionários.";
  if (status >= 500) return "Erro ao criar funcionário";
  return message ?? FALLBACK_MESSAGE;
}
