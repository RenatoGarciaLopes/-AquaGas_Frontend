import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

export type ApiFieldErrors = Record<string, string[] | string>;

type ApiErrorParams = {
  code?: string;
  fieldErrors?: ApiFieldErrors;
  message: string;
  status: number;
};

export class ApiError extends Error {
  code?: string;
  fieldErrors?: ApiFieldErrors;
  status: number;

  constructor({ code, fieldErrors, message, status }: ApiErrorParams) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.fieldErrors = fieldErrors;
    this.status = status;
  }
}

function firstErrorMessage(value: string[] | string | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function applyBackendErrors<TFieldValues extends FieldValues>(
  fieldErrors: ApiFieldErrors | null | undefined,
  setError: UseFormSetError<TFieldValues>,
  aliases: Partial<Record<string, Path<TFieldValues>>> = {},
) {
  if (!fieldErrors) {
    return false;
  }

  let applied = false;

  Object.entries(fieldErrors).forEach(([field, message]) => {
    const targetField = aliases[field] ?? (field as Path<TFieldValues>);
    const errorMessage = firstErrorMessage(message);

    if (!errorMessage) {
      return;
    }

    setError(targetField, {
      message: errorMessage,
      type: "server",
    });
    applied = true;
  });

  return applied;
}
