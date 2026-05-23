import { ApiError } from "@/shared/api/errors";

import type { ApiResponse } from "@/shared/types/api";

/**
 * Conjunto canônico de campos que podem aparecer em formulários do módulo
 * produto. Os parsers retornam apenas as chaves pertinentes ao formulário
 * em questão (criar, editar dados, ajustar estoque), mas todos compartilham
 * o mesmo mapa de alias para mapear nomes do backend.
 */
type AnyProductField =
  | "name"
  | "type"
  | "price"
  | "quantity"
  | "stockMovementType"
  | "reason";

const FIELD_ALIASES: Record<string, AnyProductField> = {
  name: "name",
  productname: "name",
  type: "type",
  typeproduct: "type",
  price: "price",
  quantity: "quantity",
  stockquantity: "quantity",
  stockmovementtype: "stockMovementType",
  movementtype: "stockMovementType",
  reason: "reason",
};

const FALLBACK_MESSAGE =
  "Não foi possível concluir a operação. Tente novamente.";

type ParsedProductError<Fields extends AnyProductField> = {
  code?: string;
  fieldErrors: Partial<Record<Fields, string>>;
  message: string;
};

function parse<Fields extends AnyProductField>(
  envelope: unknown,
  status: number,
  allowed: ReadonlyArray<Fields>,
): ParsedProductError<Fields> {
  const fieldErrors: Partial<Record<Fields, string>> = {};
  const allowedSet = new Set<AnyProductField>(allowed);

  if (envelope instanceof ApiError) {
    for (const [field, value] of Object.entries(envelope.fieldErrors ?? {})) {
      const key = FIELD_ALIASES[field.toLowerCase()];
      const message = Array.isArray(value) ? value[0] : value;
      if (
        key &&
        allowedSet.has(key) &&
        message &&
        !fieldErrors[key as Fields]
      ) {
        fieldErrors[key as Fields] = message;
      }
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

  if (Array.isArray(error?.details) && error.details.length > 0) {
    for (const detail of error.details) {
      const key = FIELD_ALIASES[detail.field?.toLowerCase() ?? ""];
      const messages = detail.messages ?? detail.message;
      if (
        key &&
        allowedSet.has(key) &&
        messages?.length &&
        !fieldErrors[key as Fields]
      ) {
        fieldErrors[key as Fields] = messages[0];
      }
    }
  } else if (error?.details && typeof error.details === "object") {
    for (const [field, messages] of Object.entries(error.details)) {
      const key = FIELD_ALIASES[field.toLowerCase()];
      if (
        key &&
        allowedSet.has(key) &&
        messages.length > 0 &&
        !fieldErrors[key as Fields]
      ) {
        fieldErrors[key as Fields] = messages[0];
      }
    }
  }

  const code = error?.code;

  if (
    code === "INSUFFICIENT_STOCK" &&
    allowedSet.has("quantity") &&
    !fieldErrors["quantity" as Fields]
  ) {
    fieldErrors["quantity" as Fields] =
      error?.message ?? "Quantidade superior ao estoque disponível.";
  }

  if (
    code === "PRODUCT_TYPE_LOCKED" &&
    allowedSet.has("type") &&
    !fieldErrors["type" as Fields]
  ) {
    fieldErrors["type" as Fields] =
      error?.message ?? "Tipo não pode ser alterado enquanto houver estoque.";
  }

  return {
    code,
    fieldErrors,
    message: error?.message ?? defaultMessageForStatus(status),
  };
}

const CREATE_FIELDS = ["name", "type", "price", "quantity"] as const;
const DETAILS_FIELDS = ["name", "type", "price"] as const;
const STOCK_FIELDS = ["stockMovementType", "quantity", "reason"] as const;

export type CreateProductFieldErrors = Partial<
  Record<(typeof CREATE_FIELDS)[number], string>
>;
export type EditDetailsFieldErrors = Partial<
  Record<(typeof DETAILS_FIELDS)[number], string>
>;
export type StockFieldErrors = Partial<
  Record<(typeof STOCK_FIELDS)[number], string>
>;

/** @deprecated mantido por compatibilidade com `create-product-form.tsx`. */
export type ProductFieldErrors = CreateProductFieldErrors;

export function parseProductError(envelope: unknown, status: number) {
  return parse(envelope, status, CREATE_FIELDS);
}

export function parseEditDetailsError(envelope: unknown, status: number) {
  return parse(envelope, status, DETAILS_FIELDS);
}

export function parseStockAdjustmentError(envelope: unknown, status: number) {
  return parse(envelope, status, STOCK_FIELDS);
}

function defaultMessageForStatus(status: number): string {
  if (status === 409) return "Já existe um produto ativo com esse nome.";
  if (status === 403) return "Você não tem permissão para esta operação.";
  if (status === 404) return "Produto não encontrado.";
  if (status >= 500) return "Erro interno do servidor. Tente novamente.";
  return FALLBACK_MESSAGE;
}
