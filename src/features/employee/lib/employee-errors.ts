import { defaultMessageForStatus } from "@/shared/lib/error-messages";
import {
  type ParsedError,
  createErrorParser,
} from "@/shared/lib/create-error-parser";

type AnyEmployeeField =
  | "userName"
  | "password"
  | "role"
  | "name"
  | "cpf"
  | "phone"
  | "email";

const FIELD_ALIASES: Record<string, AnyEmployeeField> = {
  username: "userName",
  password: "password",
  role: "role",
  name: "name",
  cpf: "cpf",
  phone: "phone",
  email: "email",
};

const parseAny = createErrorParser<AnyEmployeeField>({
  fieldAliases: FIELD_ALIASES,
  translateMessages: true,
  defaultMessage: (status) => defaultMessageForStatus(status, "employee"),
});

// ── Field sets per operation ─────────────────────────────────────────────────

const CREATE_FIELDS = [
  "userName",
  "password",
  "role",
  "name",
  "cpf",
  "phone",
  "email",
] as const;

const EDIT_PERSONAL_FIELDS = ["name", "phone", "email"] as const;

export type CreateEmployeeFieldErrors = Partial<
  Record<(typeof CREATE_FIELDS)[number], string>
>;
export type EditPersonalFieldErrors = Partial<
  Record<(typeof EDIT_PERSONAL_FIELDS)[number], string>
>;

// ── Public parsers ───────────────────────────────────────────────────────────

export function parseCreateEmployeeError(
  envelope: unknown,
  status: number,
): ParsedError<(typeof CREATE_FIELDS)[number]> {
  const result = parseAny(envelope, status);
  const allowed = new Set<AnyEmployeeField>(CREATE_FIELDS);
  const filtered: CreateEmployeeFieldErrors = {};
  for (const [k, v] of Object.entries(result.fieldErrors)) {
    if (allowed.has(k as AnyEmployeeField)) {
      filtered[k as (typeof CREATE_FIELDS)[number]] = v;
    }
  }
  return { ...result, fieldErrors: filtered };
}

export function parseEditPersonalError(
  envelope: unknown,
  status: number,
): ParsedError<(typeof EDIT_PERSONAL_FIELDS)[number]> {
  const result = parseAny(envelope, status);
  const allowed = new Set<AnyEmployeeField>(EDIT_PERSONAL_FIELDS);
  const filtered: EditPersonalFieldErrors = {};
  for (const [k, v] of Object.entries(result.fieldErrors)) {
    if (allowed.has(k as AnyEmployeeField)) {
      filtered[k as (typeof EDIT_PERSONAL_FIELDS)[number]] = v;
    }
  }
  return { ...result, fieldErrors: filtered };
}
