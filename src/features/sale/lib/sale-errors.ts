import { createErrorParser } from "@/shared/lib/create-error-parser";
import { defaultMessageForStatus } from "@/shared/lib/error-messages";

type SaleField = "discount" | "saleItems";

const FIELD_ALIASES: Record<string, SaleField> = {
  discount: "discount",
  saleitems: "saleItems",
  items: "saleItems",
};

export type SaleFieldErrors = Partial<Record<SaleField, string>>;

/**
 * Parser for sale creation and cancellation errors.
 *
 * The existing `saleErrorMessage()` in `pdv-shell.tsx` handles the PDV
 * toast flow and is not replaced here. This parser is intended for use
 * in form-based contexts (future cancel-sale form, etc.).
 */
export const parseSaleError = createErrorParser<SaleField>({
  fieldAliases: FIELD_ALIASES,
  translateMessages: true,
  defaultMessage: (status) => defaultMessageForStatus(status, "sale"),
  codeHandlers: {
    INSUFFICIENT_STOCK: (_, message, fieldErrors) => {
      if (!fieldErrors["saleItems"]) {
        fieldErrors["saleItems"] = message;
      }
    },
  },
});
