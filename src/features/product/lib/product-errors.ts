import type { CreateProductSchema } from "@/features/product/schemas/create-product.schema";

import type { ApiResponse } from "@/shared/types/api";

export type ProductFieldErrors = Partial<
  Record<keyof CreateProductSchema, string>
>;

export type ParsedProductError = {
  fieldErrors: ProductFieldErrors;
  message: string;
};

const FIELD_ALIASES: Record<string, keyof CreateProductSchema> = {
  name: "name",
  productname: "name",
  type: "type",
  typeproduct: "type",
  price: "price",
  quantity: "quantity",
  stockquantity: "quantity",
};

const FALLBACK_MESSAGE =
  "Não foi possível cadastrar o produto. Tente novamente.";

export function parseProductError(
  envelope: unknown,
  status: number,
): ParsedProductError {
  const fieldErrors: ProductFieldErrors = {};

  const error =
    envelope && typeof envelope === "object"
      ? (envelope as ApiResponse<unknown>).error
      : null;

  if (error?.details?.length) {
    for (const detail of error.details) {
      const key = FIELD_ALIASES[detail.field?.toLowerCase() ?? ""];
      if (key && detail.messages?.length && !fieldErrors[key]) {
        fieldErrors[key] = detail.messages[0];
      }
    }
  }

  const baseMessage = error?.message ?? defaultMessageForStatus(status);

  return { fieldErrors, message: baseMessage };
}

function defaultMessageForStatus(status: number): string {
  if (status === 409) return "Já existe um produto ativo com esse nome.";
  if (status === 403) return "Você não tem permissão para criar produtos.";
  if (status >= 500) return "Erro interno do servidor. Tente novamente.";
  return FALLBACK_MESSAGE;
}
