"use client";

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

  return (
    <section className="border-border bg-card rounded-lg border p-4">
      <label htmlFor="sale-discount" className="text-sm font-medium">
        Desconto
      </label>
      <div className="mt-2 flex items-center gap-2">
        <input
          id="sale-discount"
          type="number"
          min={0}
          max={100}
          step={0.5}
          disabled={!canDiscount}
          value={canDiscount ? discount : 0}
          onChange={(event) => onChange(Number(event.target.value || 0))}
          className="border-input bg-background text-foreground focus:ring-ring/40 w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <span className="text-muted-foreground text-sm font-medium">%</span>
      </div>
      <p className="text-muted-foreground mt-2 text-xs">
        {canDiscount
          ? "Aplicado sobre o subtotal da venda."
          : "Apenas gerentes podem aplicar desconto."}
      </p>
    </section>
  );
}
