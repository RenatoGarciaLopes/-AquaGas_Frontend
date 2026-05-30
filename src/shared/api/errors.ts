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
