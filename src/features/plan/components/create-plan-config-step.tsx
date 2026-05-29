"use client";

import type { FieldErrors } from "react-hook-form";

import { cn } from "@/shared/lib/cn";
import { Icons } from "@/shared/lib/icons";
import { onlyDecimalKeys, onlyDecimalPaste } from "@/shared/lib/masks";

import { FormField } from "@/shared/ui/form-field";
import { FormSection } from "@/shared/ui/form-section";
import { QuantityInput } from "@/shared/ui/quantity-input";

import type { CreatePlanSchema } from "@/features/plan/schemas/create-plan.schema";
import { RecurringDatesSection } from "@/features/plan/components/recurring-dates-section";

type CreatePlanConfigStepProps = {
  errors: FieldErrors<CreatePlanSchema>;
  cycle: CreatePlanSchema["cycle"];
  deliveryDay: number;
  billingDay: number;
  durationInMonths: number | undefined;
  discount: number | undefined;
  canDiscount: boolean;
  onCycleChange: (v: CreatePlanSchema["cycle"]) => void;
  onDeliveryDayChange: (v: number) => void;
  onBillingDayChange: (v: number) => void;
  onDurationInMonthsChange: (v: number) => void;
  onDiscountChange: (v: number | undefined) => void;
};

const CYCLE_OPTIONS: Array<{
  label: string;
  value: CreatePlanSchema["cycle"];
}> = [
  { label: "Mensal", value: "Monthly" },
  { label: "Trimestral", value: "Quarterly" },
  { label: "Anual", value: "Annual" },
  { label: "Personalizado", value: "Custom" },
];

export function CreatePlanConfigStep({
  errors,
  cycle,
  deliveryDay,
  billingDay,
  durationInMonths,
  discount,
  canDiscount,
  onCycleChange,
  onDeliveryDayChange,
  onBillingDayChange,
  onDurationInMonthsChange,
  onDiscountChange,
}: CreatePlanConfigStepProps) {
  const discountValue = canDiscount ? (discount ?? 0) : 0;
  const canDecrement = canDiscount && discountValue > 0;
  const canIncrement = canDiscount && discountValue < 100;

  function clampDiscount(next: number) {
    if (Number.isNaN(next)) return 0;
    const rounded = Math.round(next * 2) / 2;
    return Math.min(Math.max(0, rounded), 100);
  }

  function handleDiscountInput(raw: string) {
    const normalized = raw.replace(",", ".");
    onDiscountChange(clampDiscount(Number(normalized || 0)));
  }

  function adjustDiscount(delta: number) {
    const next = clampDiscount(discountValue + delta);
    if (next !== discountValue) onDiscountChange(next);
  }

  return (
    <div className="space-y-6">
      <FormSection
        title="Ciclo do plano"
        description="Selecione a periodicidade do contrato."
        icon={Icons.calendar}
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 md:grid-cols-4">
          {CYCLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onCycleChange(opt.value)}
              className={`rounded-lg border px-4 py-3 text-sm font-medium transition ${
                cycle === opt.value
                  ? "border-cyan-500 bg-cyan-500/10 text-cyan-500"
                  : "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {errors.cycle ? (
          <p className="px-1 text-xs font-medium text-red-700 dark:text-red-300">
            {errors.cycle.message}
          </p>
        ) : null}

        {cycle === "Custom" ? (
          <div className="mt-4 max-w-xs">
            <FormField
              htmlFor="durationInMonths"
              label="Duração (meses)"
              required
              error={errors.durationInMonths?.message}
            >
              <QuantityInput
                id="durationInMonths"
                value={durationInMonths ?? 2}
                min={2}
                max={60}
                onChange={onDurationInMonthsChange}
              />
            </FormField>
          </div>
        ) : null}
      </FormSection>

      <RecurringDatesSection
        deliveryDay={deliveryDay}
        billingDay={billingDay}
        deliveryDayError={errors.deliveryDay?.message}
        billingDayError={errors.billingDay?.message}
        onDeliveryDayChange={onDeliveryDayChange}
        onBillingDayChange={onBillingDayChange}
      />

      <section className="border-border bg-card rounded-lg border p-4">
        <div
          className={cn(
            "bg-muted/40 hover:bg-muted/60 focus-within:bg-muted/60",
            "flex min-h-14 flex-wrap items-center gap-2 rounded-xl border border-transparent px-3 py-2 transition",
            !canDiscount && "cursor-not-allowed opacity-60",
          )}
        >
          <div className="min-w-0 flex-1">
            <label
              htmlFor="plan-discount"
              className="text-muted-foreground block text-xs font-medium"
            >
              Desconto
            </label>
            <input
              id="plan-discount"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              disabled={!canDiscount}
              value={discountValue}
              onChange={(e) => handleDiscountInput(e.target.value)}
              onKeyDown={onlyDecimalKeys}
              onPaste={onlyDecimalPaste}
              className="text-foreground placeholder:text-muted-foreground/60 mt-0.5 w-full border-0 bg-transparent p-0 text-sm leading-tight shadow-none outline-none focus:ring-0 focus:outline-none disabled:cursor-not-allowed"
            />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              aria-label="Diminuir desconto"
              onClick={() => adjustDiscount(-0.5)}
              disabled={!canDecrement}
              className="text-muted-foreground hover:bg-muted hover:text-foreground border-border inline-flex h-7 w-7 items-center justify-center rounded-md border text-base leading-none font-semibold transition focus:ring-2 focus:ring-cyan-400/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
            >
              −
            </button>
            <button
              type="button"
              aria-label="Aumentar desconto"
              onClick={() => adjustDiscount(0.5)}
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
            ? "Aplicado sobre o valor do plano."
            : "Apenas gerentes podem aplicar desconto."}
        </p>
        {errors.discount?.message ? (
          <p className="mt-1 px-1 text-xs font-medium text-red-700 dark:text-red-300">
            {errors.discount.message}
          </p>
        ) : null}
      </section>
    </div>
  );
}
