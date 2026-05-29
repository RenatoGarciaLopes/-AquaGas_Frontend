"use client";

import { Icon } from "@iconify/react";
import { ptBR } from "date-fns/locale";
import { createPortal } from "react-dom";
import { useRef, useState, useEffect } from "react";
import {
  format,
  isAfter,
  isToday,
  isBefore,
  parseISO,
  addMonths,
  endOfWeek,
  isSameDay,
  subMonths,
  endOfMonth,
  isSameMonth,
  startOfWeek,
  startOfMonth,
  eachDayOfInterval,
} from "date-fns";

import { cn } from "@/shared/lib/cn";
import { Icons } from "@/shared/lib/icons";

// ─── Constants ────────────────────────────────────────────────────────────────

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const POPOVER_HEIGHT = 320;

// ─── Types ────────────────────────────────────────────────────────────────────

export type DatePickerProps = {
  disabled?: boolean;
  label: string;
  max?: string;
  min?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value?: string;
};

// ─── DatePicker ───────────────────────────────────────────────────────────────

export function DatePicker({
  disabled = false,
  label,
  max,
  min,
  onChange,
  placeholder = "dd/mm/aaaa",
  value,
}: DatePickerProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<React.CSSProperties>({});

  const selected = value ? parseISO(value) : undefined;
  const minDate = min ? parseISO(min) : undefined;
  const maxDate = max ? parseISO(max) : undefined;
  const [viewMonth, setViewMonth] = useState<Date>(selected ?? new Date());

  function openCalendar() {
    if (disabled) return;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const spaceBelow = window.innerHeight - rect.bottom;
    setPos(
      spaceBelow < POPOVER_HEIGHT && rect.top > POPOVER_HEIGHT
        ? { bottom: window.innerHeight - rect.top + 4, left: rect.left }
        : { top: rect.bottom + 4, left: rect.left },
    );
    setViewMonth(selected ?? new Date());
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      if (
        !popoverRef.current?.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function handleSelect(day: Date) {
    onChange(format(day, "yyyy-MM-dd"));
    setOpen(false);
  }

  function isDayDisabled(day: Date) {
    if (minDate && isBefore(day, minDate)) return true;
    if (maxDate && isAfter(day, maxDate)) return true;
    return false;
  }

  const calStart = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 0 });
  const calEnd = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  return (
    <>
      {/* Trigger — visual idêntico ao TextField (floating label) */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={openCalendar}
        className={cn(
          "bg-muted/40 hover:bg-muted/60 focus-within:bg-muted/60 w-full rounded-lg px-4 py-2.5 text-left transition focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          open && "bg-muted/60",
        )}
      >
        <span className="text-muted-foreground block text-xs font-medium">
          {label}
        </span>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-sm",
              selected ? "text-foreground" : "text-muted-foreground/50",
            )}
          >
            {selected ? format(selected, "dd/MM/yyyy") : placeholder}
          </span>
          <Icon
            icon={Icons.calendar}
            aria-hidden
            className="text-muted-foreground h-4 w-4 shrink-0"
          />
        </div>
      </button>

      {/* Popover calendar */}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popoverRef}
            style={{ position: "fixed", ...pos }}
            className="border-border bg-card z-50 w-72 overflow-hidden rounded-2xl border p-4 shadow-xl shadow-black/15"
          >
            {/* Month navigation */}
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setViewMonth((m) => subMonths(m, 1))}
                aria-label="Mês anterior"
                className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg p-1.5 transition"
              >
                <Icon
                  icon={Icons.chevronLeft}
                  aria-hidden
                  className="h-4 w-4"
                />
              </button>

              <span className="text-foreground text-sm font-semibold capitalize">
                {format(viewMonth, "MMMM yyyy", { locale: ptBR })}
              </span>

              <button
                type="button"
                onClick={() => setViewMonth((m) => addMonths(m, 1))}
                aria-label="Próximo mês"
                className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg p-1.5 transition"
              >
                <Icon
                  icon={Icons.chevronRight}
                  aria-hidden
                  className="h-4 w-4"
                />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="mb-1 grid grid-cols-7">
              {WEEKDAYS.map((d) => (
                <span
                  key={d}
                  className="text-muted-foreground py-1 text-center text-xs font-medium"
                >
                  {d}
                </span>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {days.map((day) => {
                const outside = !isSameMonth(day, viewMonth);
                const isSelected = selected ? isSameDay(day, selected) : false;
                const isDisabled = isDayDisabled(day);
                const today = isToday(day);

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    disabled={outside || isDisabled}
                    onClick={() => handleSelect(day)}
                    aria-label={format(day, "dd/MM/yyyy")}
                    aria-pressed={isSelected}
                    className={cn(
                      "mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm transition",
                      outside && "pointer-events-none opacity-0",
                      !outside &&
                        !isSelected &&
                        !isDisabled &&
                        "text-foreground hover:bg-muted cursor-pointer",
                      !outside &&
                        today &&
                        !isSelected &&
                        "font-semibold text-cyan-500 ring-1 ring-cyan-500",
                      isSelected &&
                        "cursor-pointer bg-cyan-500 font-semibold text-white hover:bg-cyan-600",
                      !outside &&
                        isDisabled &&
                        "text-muted-foreground/30 cursor-not-allowed",
                    )}
                  >
                    {outside ? null : format(day, "d")}
                  </button>
                );
              })}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
