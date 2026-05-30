import { DEFAULT_PRESET, getPresetRange } from "./date-presets";

type SearchParamsInput =
  | Promise<Record<string, string | string[] | undefined>>
  | Record<string, string | string[] | undefined>
  | undefined;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isValidIsoDate(value: string | undefined): value is string {
  return typeof value === "string" && ISO_DATE.test(value);
}

export type RangeFilters = { start: string; end: string };

export async function resolveRangeFilters(
  searchParams: SearchParamsInput,
): Promise<RangeFilters> {
  const params = searchParams ? await searchParams : {};
  const rawStart = firstParam(params.start);
  const rawEnd = firstParam(params.end);

  if (
    isValidIsoDate(rawStart) &&
    isValidIsoDate(rawEnd) &&
    rawStart <= rawEnd
  ) {
    return { start: rawStart, end: rawEnd };
  }

  return getPresetRange(DEFAULT_PRESET);
}

export async function readParam(
  searchParams: SearchParamsInput,
  key: string,
): Promise<string | undefined> {
  const params = searchParams ? await searchParams : {};
  const value = firstParam(params[key]);
  return value?.trim() || undefined;
}
