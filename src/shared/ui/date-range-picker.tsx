"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";

import { cn } from "@/shared/lib/cn";
import { Icons } from "@/shared/lib/icons";

import { DatePicker } from "@/shared/ui/date-picker";

export type DateRangeValue = { start: string; end: string };

export type DateRangePreset<TKey extends string = string> = {
  key: TKey;
  label: string;
  range: () => DateRangeValue;
};

export type DateRangePickerProps<TKey extends string = string> = {
  value: DateRangeValue;
  presets?: DateRangePreset<TKey>[];
  activePreset?: TKey | null;
  onChange: (value: DateRangeValue, presetKey: TKey | null) => void;
  className?: string;
};

export function DateRangePicker<TKey extends string = string>({
  activePreset = null,
  className,
  onChange,
  presets = [],
  value,
}: DateRangePickerProps<TKey>) {
  const [open, setOpen] = useState(false);

  function applyPreset(preset: DateRangePreset<TKey>) {
    onChange(preset.range(), preset.key);
    setOpen(false);
  }

  function applyStart(start: string) {
    const end = start > value.end ? start : value.end;
    onChange({ start, end }, null);
  }

  function applyEnd(end: string) {
    const start = end < value.start ? end : value.start;
    onChange({ start, end }, null);
  }

  const activeLabel =
    presets.find((p) => p.key === activePreset)?.label ?? "Personalizado";

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-stretch",
        className,
      )}
    >
      {presets.length > 0 ? (
        <div className="relative w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="bg-muted/40 hover:bg-muted/60 text-foreground flex h-full w-full items-center justify-between gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition focus:outline-none sm:w-44"
            aria-expanded={open}
            aria-haspopup="listbox"
          >
            <span className="truncate">{activeLabel}</span>
            <Icon
              icon={Icons.chevronDown}
              aria-hidden
              className={cn(
                "text-muted-foreground h-4 w-4 shrink-0 transition",
                open && "rotate-180",
              )}
            />
          </button>

          {open ? (
            <>
              <button
                type="button"
                aria-hidden
                tabIndex={-1}
                onClick={() => setOpen(false)}
                className="fixed inset-0 z-40 cursor-default"
              />
              <ul
                role="listbox"
                className="border-border bg-card absolute top-full left-0 z-50 mt-1 w-48 overflow-hidden rounded-xl border py-1 shadow-xl shadow-black/15"
              >
                {presets.map((preset) => {
                  const active = preset.key === activePreset;
                  return (
                    <li key={preset.key}>
                      <button
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className={cn(
                          "hover:bg-muted flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition",
                          active && "text-cyan-500",
                        )}
                      >
                        <span>{preset.label}</span>
                        {active ? (
                          <Icon
                            icon={Icons.check}
                            aria-hidden
                            className="h-4 w-4"
                          />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          ) : null}
        </div>
      ) : null}

      <div className="grid w-full grid-cols-2 gap-2 sm:w-auto">
        <DatePicker
          label="De"
          value={value.start}
          max={value.end}
          onChange={applyStart}
        />
        <DatePicker
          label="Até"
          value={value.end}
          min={value.start}
          onChange={applyEnd}
        />
      </div>
    </div>
  );
}
