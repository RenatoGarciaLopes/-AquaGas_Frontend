import {
  format,
  subDays,
  subMonths,
  endOfMonth,
  endOfToday,
  startOfMonth,
  startOfToday,
} from "date-fns";

export type DateRangePreset =
  | "today"
  | "last7"
  | "last30"
  | "thisMonth"
  | "lastMonth";

export type DateRange = { start: string; end: string };

const ISO = "yyyy-MM-dd";

function toRange(start: Date, end: Date): DateRange {
  return { start: format(start, ISO), end: format(end, ISO) };
}

export function getPresetRange(preset: DateRangePreset): DateRange {
  const today = startOfToday();
  switch (preset) {
    case "today":
      return toRange(today, endOfToday());
    case "last7":
      return toRange(subDays(today, 6), endOfToday());
    case "last30":
      return toRange(subDays(today, 29), endOfToday());
    case "thisMonth":
      return toRange(startOfMonth(today), endOfToday());
    case "lastMonth": {
      const lastMonth = subMonths(today, 1);
      return toRange(startOfMonth(lastMonth), endOfMonth(lastMonth));
    }
  }
}

export const PRESET_LABELS: Record<DateRangePreset, string> = {
  today: "Hoje",
  last7: "Últimos 7 dias",
  last30: "Últimos 30 dias",
  thisMonth: "Mês atual",
  lastMonth: "Mês anterior",
};

export const PRESETS: DateRangePreset[] = [
  "today",
  "last7",
  "last30",
  "thisMonth",
  "lastMonth",
];

export const DEFAULT_PRESET: DateRangePreset = "last30";

/** Detecta se um par start/end corresponde a algum preset (para sincronizar UI). */
export function detectPreset(range: DateRange): DateRangePreset | null {
  for (const preset of PRESETS) {
    const target = getPresetRange(preset);
    if (target.start === range.start && target.end === range.end) return preset;
  }
  return null;
}
