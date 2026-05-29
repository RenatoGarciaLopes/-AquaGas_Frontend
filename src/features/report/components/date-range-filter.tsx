"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { DateRangePicker } from "@/shared/ui/date-range-picker";

import {
  PRESETS,
  detectPreset,
  PRESET_LABELS,
  getPresetRange,
  type DateRangePreset,
} from "@/features/report/lib/date-presets";

type DateRangeFilterProps = {
  start: string;
  end: string;
};

export function DateRangeFilter({ end, start }: DateRangeFilterProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const value = { start, end };
  const activePreset = detectPreset(value);

  function commit(next: { start: string; end: string }) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("start", next.start);
    params.set("end", next.end);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  const presets = PRESETS.map((key) => ({
    key,
    label: PRESET_LABELS[key],
    range: () => getPresetRange(key),
  }));

  return (
    <DateRangePicker<DateRangePreset>
      value={value}
      activePreset={activePreset}
      presets={presets}
      onChange={(next) => commit(next)}
    />
  );
}
