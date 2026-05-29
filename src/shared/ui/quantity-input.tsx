"use client";

import { onlyIntegerKeys, onlyIntegerPaste } from "@/shared/lib/masks";

type QuantityInputProps = {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
};

export function QuantityInput({
  id,
  value,
  onChange,
  min = 0,
  max,
  disabled = false,
}: QuantityInputProps) {
  const canDecrement = !disabled && value > min;
  const canIncrement = !disabled && (max === undefined || value < max);

  function clamp(n: number): number {
    const lo = min;
    const hi = max ?? Infinity;
    return Math.min(Math.max(Math.trunc(n), lo), hi);
  }

  function adjust(delta: number) {
    const next = clamp(value + delta);
    if (next !== value) onChange(next);
  }

  function handleChange(raw: string) {
    const parsed = parseInt(raw, 10);
    onChange(clamp(Number.isNaN(parsed) ? min : parsed));
  }

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        aria-label="Diminuir quantidade"
        onClick={() => adjust(-1)}
        disabled={!canDecrement}
        className="border-border text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-7 w-7 items-center justify-center rounded-md border text-base leading-none font-semibold transition focus:ring-2 focus:ring-cyan-400/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
      >
        −
      </button>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        disabled={disabled}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={onlyIntegerKeys}
        onPaste={onlyIntegerPaste}
        className="border-border bg-background text-foreground w-12 rounded-md border px-2 py-1 text-center text-sm disabled:cursor-not-allowed disabled:opacity-60"
      />
      <button
        type="button"
        aria-label="Aumentar quantidade"
        onClick={() => adjust(1)}
        disabled={!canIncrement}
        className="border-border text-muted-foreground hover:bg-muted hover:text-foreground inline-flex h-7 w-7 items-center justify-center rounded-md border text-base leading-none font-semibold transition focus:ring-2 focus:ring-cyan-400/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
      >
        +
      </button>
    </div>
  );
}
