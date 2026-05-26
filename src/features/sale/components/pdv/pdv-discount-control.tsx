"use client";

import { cn } from "@/shared/lib/cn";
import { onlyDecimalKeys, onlyDecimalPaste } from "@/shared/lib/masks";
import type { UserRole } from "@/shared/auth/roles";

type PdvDiscountControlProps = {
  discount: number;
  role: UserRole | null;
  onChange: (value: number) => void;
};

export function PdvDiscountControl({
  discount,
  role,
  onChange,
}: PdvDiscountControlProps) {
  const canDiscount = role === "GERENTE";
  const value = canDiscount ? discount : 0;
  const canDecrement = canDiscount && value > 0;
  const canIncrement = canDiscount && value < 100;

  function clamp(next: number) {
    if (Number.isNaN(next)) return 0;
    const rounded = Math.round(next * 2) / 2;
    return Math.min(Math.max(0, rounded), 100);
  }

  function handleInputChange(raw: string) {
    const normalized = raw.replace(",", ".");
    onChange(clamp(Number(normalized || 0)));
  }

  function adjust(delta: number) {
    const next = clamp(value + delta);
    if (next !== value) {
      onChange(next);
    }
  }

  return (
    <section className="border-border bg-card rounded-lg border p-4">
      <div
        className={cn(
          "bg-muted/40 hover:bg-muted/60 focus-within:bg-muted/60",
          "flex h-[58px] items-center rounded-xl border border-transparent px-3 transition",
          !canDiscount && "cursor-not-allowed opacity-60",
        )}
      >
        <div className="min-w-0 flex-1">
          <label
            htmlFor="sale-discount"
            className="text-muted-foreground block text-xs font-medium"
          >
            Desconto
          </label>
          <input
            id="sale-discount"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            disabled={!canDiscount}
            value={value}
            onChange={(event) => handleInputChange(event.target.value)}
            onKeyDown={onlyDecimalKeys}
            onPaste={onlyDecimalPaste}
            className="text-foreground placeholder:text-muted-foreground/60 mt-0.5 w-full border-0 bg-transparent p-0 text-sm leading-tight shadow-none outline-none focus:ring-0 focus:outline-none disabled:cursor-not-allowed"
          />
        </div>
        <div className="ml-2 flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label="Diminuir desconto"
            onClick={() => adjust(-0.5)}
            disabled={!canDecrement}
            className="text-muted-foreground hover:bg-muted hover:text-foreground border-border inline-flex h-7 w-7 items-center justify-center rounded-md border text-base leading-none font-semibold transition focus:ring-2 focus:ring-cyan-400/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
          >
            −
          </button>
          <button
            type="button"
            aria-label="Aumentar desconto"
            onClick={() => adjust(0.5)}
            disabled={!canIncrement}
            className="text-muted-foreground hover:bg-muted hover:text-foreground border-border inline-flex h-7 w-7 items-center justify-center rounded-md border text-base leading-none font-semibold transition focus:ring-2 focus:ring-cyan-400/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
          <span className="text-muted-foreground ml-1 text-sm font-medium">
            %
          </span>
        </div>
      </div>
      <p className="text-muted-foreground mt-2 text-xs">
        {canDiscount
          ? "Aplicado sobre o subtotal da venda."
          : "Apenas gerentes podem aplicar desconto."}
      </p>
    </section>
  );
}
