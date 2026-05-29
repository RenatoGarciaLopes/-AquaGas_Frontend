import {
  translateFieldMessage,
  translateConflictMessage,
} from "@/shared/lib/error-messages";

import { ApiError } from "@/shared/api/errors";

import type { ApiResponse } from "@/shared/types/api";

export type FieldAliasMap<TField extends string> = Record<string, TField>;

export type CodeHandler<TField extends string> = (
  code: string,
  message: string,
  fieldErrors: Partial<Record<TField, string>>,
) => void;

export type ParsedError<TField extends string> = {
  code?: string;
  fieldErrors: Partial<Record<TField, string>>;
  message: string;
};

export type ErrorParserOptions<TField extends string> = {
  fieldAliases: FieldAliasMap<TField>;
  codeHandlers?: Partial<Record<string, CodeHandler<TField>>>;
  defaultMessage: (status: number) => string;
  /** Translate field-level messages from English to Portuguese. Default: true. */
  translateMessages?: boolean;
};

/**
 * Factory that returns a typed error parser for a specific module's form.
 *
 * Handles both the `ApiError` path (thrown by the axios interceptor) and the
 * raw `ApiResponse` envelope path (returned directly from route handlers).
 * Field names are normalised via `fieldAliases`, and top-level messages are
 * translated via `translateConflictMessage`.
 */
export function createErrorParser<TField extends string>(
  options: ErrorParserOptions<TField>,
): (envelope: unknown, status: number) => ParsedError<TField> {
  const {
    fieldAliases,
    codeHandlers = {},
    defaultMessage,
    translateMessages = true,
  } = options;

  const translate = translateMessages
    ? translateFieldMessage
    : (m: string) => m;

  return function parseError(
    envelope: unknown,
    status: number,
  ): ParsedError<TField> {
    const fieldErrors: Partial<Record<TField, string>> = {};

    // ── Branch A: ApiError (thrown by axios interceptor) ──────────────────
    if (envelope instanceof ApiError) {
      for (const [field, value] of Object.entries(envelope.fieldErrors ?? {})) {
        const key = fieldAliases[field.toLowerCase()];
        const raw = Array.isArray(value) ? value[0] : value;
        if (key && raw && !fieldErrors[key]) {
          fieldErrors[key] = translate(raw);
        }
      }

      const { code } = envelope;
      if (code && codeHandlers[code]) {
        codeHandlers[code]!(code, envelope.message, fieldErrors);
      }

      return {
        code,
        fieldErrors,
        message:
          translateConflictMessage(envelope.message) || defaultMessage(status),
      };
    }

    // ── Branch B: raw ApiResponse envelope ────────────────────────────────
    const error =
      envelope && typeof envelope === "object"
        ? (envelope as ApiResponse<unknown>).error
        : null;

    if (Array.isArray(error?.details) && error.details.length > 0) {
      for (const detail of error.details) {
        const key = fieldAliases[detail.field?.toLowerCase() ?? ""];
        const msgs = detail.messages ?? detail.message;
        if (key && msgs?.length && !fieldErrors[key]) {
          fieldErrors[key] = translate(msgs[0]);
        }
      }
    } else if (error?.details && typeof error.details === "object") {
      for (const [field, messages] of Object.entries(error.details)) {
        const key = fieldAliases[field.toLowerCase()];
        if (key && (messages as string[]).length > 0 && !fieldErrors[key]) {
          fieldErrors[key] = translate((messages as string[])[0]);
        }
      }
    }

    const code = error?.code;
    if (code && codeHandlers[code]) {
      codeHandlers[code]!(code, error?.message ?? "", fieldErrors);
    }

    return {
      code,
      fieldErrors,
      message: error?.message
        ? translateConflictMessage(error.message)
        : defaultMessage(status),
    };
  };
}
