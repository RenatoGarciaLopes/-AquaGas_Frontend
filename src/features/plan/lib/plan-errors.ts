import {
  createErrorParser,
  type ParsedError,
} from "@/shared/lib/create-error-parser";
import { defaultMessageForStatus } from "@/shared/lib/error-messages";

type AnyPlanField =
  | "customerId"
  | "cycle"
  | "deliveryDay"
  | "billingDay"
  | "discount"
  | "durationInMonths"
  | "items"
  | "reason";

const FIELD_ALIASES: Record<string, AnyPlanField> = {
  customerid: "customerId",
  cycle: "cycle",
  deliveryday: "deliveryDay",
  billingday: "billingDay",
  discount: "discount",
  durationinmonths: "durationInMonths",
  items: "items",
  planitems: "items",
  reason: "reason",
};

const parseAny = createErrorParser<AnyPlanField>({
  fieldAliases: FIELD_ALIASES,
  translateMessages: true,
  defaultMessage: (status) => defaultMessageForStatus(status, "plan"),
  codeHandlers: {
    INSUFFICIENT_STOCK: (_, message, fieldErrors) => {
      if (!fieldErrors["items"]) {
        fieldErrors["items"] = message;
      }
    },
  },
});

// ── Field sets per operation ─────────────────────────────────────────────────

const CREATE_FIELDS = [
  "customerId",
  "cycle",
  "deliveryDay",
  "billingDay",
  "discount",
  "durationInMonths",
  "items",
] as const;

const UPGRADE_FIELDS = [
  "cycle",
  "durationInMonths",
  "items",
  "reason",
] as const;

const DOWNGRADE_FIELDS = [
  "cycle",
  "durationInMonths",
  "items",
  "reason",
] as const;

export type CreatePlanFieldErrors = Partial<
  Record<(typeof CREATE_FIELDS)[number], string>
>;
export type UpgradePlanFieldErrors = Partial<
  Record<(typeof UPGRADE_FIELDS)[number], string>
>;
export type DowngradePlanFieldErrors = Partial<
  Record<(typeof DOWNGRADE_FIELDS)[number], string>
>;

// ── Helper ───────────────────────────────────────────────────────────────────

function filterFields<T extends AnyPlanField>(
  fieldErrors: Partial<Record<AnyPlanField, string>>,
  allowed: ReadonlyArray<T>,
): Partial<Record<T, string>> {
  const set = new Set<AnyPlanField>(allowed);
  const out: Partial<Record<T, string>> = {};
  for (const [k, v] of Object.entries(fieldErrors)) {
    if (set.has(k as AnyPlanField)) out[k as T] = v;
  }
  return out;
}

// ── Public parsers ───────────────────────────────────────────────────────────

/** Used by the create-plan wizard form. */
export function parseCreatePlanError(
  envelope: unknown,
  status: number,
): ParsedError<(typeof CREATE_FIELDS)[number]> {
  const result = parseAny(envelope, status);
  return { ...result, fieldErrors: filterFields(result.fieldErrors, CREATE_FIELDS) };
}

/** Used by the upgrade-plan dialog. */
export function parseUpgradePlanError(
  envelope: unknown,
  status: number,
): ParsedError<(typeof UPGRADE_FIELDS)[number]> {
  const result = parseAny(envelope, status);
  return { ...result, fieldErrors: filterFields(result.fieldErrors, UPGRADE_FIELDS) };
}

/** Used by the downgrade-plan dialog. */
export function parseDowngradePlanError(
  envelope: unknown,
  status: number,
): ParsedError<(typeof DOWNGRADE_FIELDS)[number]> {
  const result = parseAny(envelope, status);
  return { ...result, fieldErrors: filterFields(result.fieldErrors, DOWNGRADE_FIELDS) };
}

/**
 * Generic parser for plan lifecycle actions (cancel, suspend, reactivate).
 * These operations have no form fields — only the translated `message` matters.
 */
export function parsePlanActionError(
  envelope: unknown,
  status: number,
): ParsedError<AnyPlanField> {
  return parseAny(envelope, status);
}

/**
 * Parser for sub-entity actions: delivery, billing, penalty.
 * All error information is in the top-level translated `message`.
 */
export function parsePlanSubActionError(
  envelope: unknown,
  status: number,
): ParsedError<AnyPlanField> {
  return parseAny(envelope, status);
}
