"use client";

import type { FieldErrors } from "react-hook-form";

import { Icons } from "@/shared/lib/icons";

import { FormSection } from "@/shared/ui/form-section";
import { QuantityInput } from "@/shared/ui/quantity-input";
import { FormField, TextField } from "@/shared/ui/form-field";

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
  return (
    <div className="space-y-6">
      <FormSection
        title="Ciclo do plano"
        description="Selecione a periodicidade do contrato."
        icon={Icons.calendar}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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

      {canDiscount ? (
        <FormSection
          title="Desconto"
          description="Apenas gerentes podem aplicar desconto."
          icon={Icons.barChart}
        >
          <div className="max-w-xs">
            <TextField
              id="discount"
              type="number"
              inputMode="decimal"
              label="Desconto (%)"
              placeholder="Ex.: 10"
              value={discount ?? ""}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                onDiscountChange(Number.isNaN(v) ? undefined : v);
              }}
              error={errors.discount?.message}
            />
          </div>
        </FormSection>
      ) : null}
    </div>
  );
}
