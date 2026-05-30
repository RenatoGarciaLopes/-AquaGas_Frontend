import {
  type ParsedError,
  createErrorParser,
} from "@/shared/lib/create-error-parser";
import {
  defaultMessageForStatus,
  translateConflictMessage,
} from "@/shared/lib/error-messages";

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

const TYPE_LOCKED_PATTERN = /cannot change product type while stock exists/i;

/**
 * O backend não envia códigos específicos — apenas os 6 genéricos
 * (CONFLICT, INSUFFICIENT_STOCK, ...). Por isso roteamos para o campo correto
 * a partir do código + texto da mensagem, traduzindo via dicionário central.
 */
const parseAny = createErrorParser<AnyProductField>({
  fieldAliases: FIELD_ALIASES,
  translateMessages: true,
  defaultMessage: (status) => defaultMessageForStatus(status, "product"),
  codeHandlers: {
    INSUFFICIENT_STOCK: (_code, message, fieldErrors) => {
      if (!fieldErrors.quantity) {
        fieldErrors.quantity =
          translateConflictMessage(message) ||
          "Quantidade superior ao estoque disponível.";
      }
    },
    CONFLICT: (_code, message, fieldErrors) => {
      if (TYPE_LOCKED_PATTERN.test(message) && !fieldErrors.type) {
        fieldErrors.type =
          translateConflictMessage(message) ||
          "Não é possível alterar o tipo enquanto houver estoque.";
      }
    },
  },
});

// ── Field sets per operation ─────────────────────────────────────────────────

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

// ── Public parsers ───────────────────────────────────────────────────────────

function filterFields<Field extends AnyProductField>(
  result: ParsedError<AnyProductField>,
  allowed: ReadonlyArray<Field>,
): ParsedError<Field> {
  const allowedSet = new Set<AnyProductField>(allowed);
  const fieldErrors: Partial<Record<Field, string>> = {};
  for (const [key, value] of Object.entries(result.fieldErrors)) {
    if (allowedSet.has(key as AnyProductField)) {
      fieldErrors[key as Field] = value as string;
    }
  }
  return { ...result, fieldErrors };
}

export function parseProductError(envelope: unknown, status: number) {
  return filterFields(parseAny(envelope, status), CREATE_FIELDS);
}

export function parseEditDetailsError(envelope: unknown, status: number) {
  return filterFields(parseAny(envelope, status), DETAILS_FIELDS);
}

export function parseStockAdjustmentError(envelope: unknown, status: number) {
  return filterFields(parseAny(envelope, status), STOCK_FIELDS);
}
