"use client";

import { Icon } from "@iconify/react";

import { cn } from "@/shared/lib/cn";
import { Icons } from "@/shared/lib/icons";

import { FormField } from "@/shared/ui/form-field";
import { FormSection } from "@/shared/ui/form-section";

const DAY_OPTIONS = Array.from({ length: 31 }, (_, index) => index + 1);

type RecurringDatesSectionProps = {
  billingDay: number;
  billingDayError?: string;
  deliveryDay: number;
  deliveryDayError?: string;
  onBillingDayChange: (value: number) => void;
  onDeliveryDayChange: (value: number) => void;
};

type DaySelectBlockProps = {
  description: string;
  error?: string;
  id: string;
  label: string;
  onChange: (value: number) => void;
  title: string;
  value: number;
};

export function RecurringDatesSection({
  billingDay,
  billingDayError,
  deliveryDay,
  deliveryDayError,
  onBillingDayChange,
  onDeliveryDayChange,
}: RecurringDatesSectionProps) {
  const billingBeforeDelivery = billingDay < deliveryDay;
  const usesEndOfMonthFallback = deliveryDay >= 29 || billingDay >= 29;

  return (
    <FormSection
      title="Datas recorrentes"
      description="Defina em quais dias do mês a entrega e o vencimento irão acontecer."
      icon={Icons.calendar}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <DaySelectBlock
          id="deliveryDay"
          title="Entrega"
          label="Dia da entrega"
          description="Quando o cliente receberá o produto."
          value={deliveryDay}
          onChange={onDeliveryDayChange}
          error={deliveryDayError}
        />

        <DaySelectBlock
          id="billingDay"
          title="Vencimento"
          label="Dia de vencimento"
          description="Até quando o cliente deverá pagar."
          value={billingDay}
          onChange={onBillingDayChange}
          error={billingDayError}
        />
      </div>

      <div className="space-y-3">
        <p className="rounded-lg border border-cyan-500/20 bg-cyan-50/70 px-4 py-3 text-sm text-cyan-950 dark:border-cyan-300/20 dark:bg-cyan-500/10 dark:text-cyan-100">
          <span className="font-semibold">Resumo:</span> entrega todo dia{" "}
          {deliveryDay} e vencimento todo dia {billingDay}.
        </p>

        {billingBeforeDelivery ? (
          <p
            role="note"
            className="flex gap-2 rounded-lg border border-amber-300/70 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-300/30 dark:bg-amber-400/10 dark:text-amber-100"
          >
            <Icon
              icon={Icons.alertTriangle}
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden
            />
            <span>
              O vencimento está antes da entrega. Confirme se essa é a regra
              desejada.
            </span>
          </p>
        ) : null}

        {usesEndOfMonthFallback ? (
          <p className="text-muted-foreground px-1 text-xs">
            Em meses que não possuem esse dia, será usado o último dia do mês.
          </p>
        ) : null}
      </div>
    </FormSection>
  );
}

function DaySelectBlock({
  description,
  error,
  id,
  label,
  onChange,
  title,
  value,
}: DaySelectBlockProps) {
  const descriptionId = `${id}-description`;

  return (
    <div className="border-border/70 bg-background/70 rounded-lg border p-4">
      <p className="text-muted-foreground mb-3 text-xs font-semibold tracking-wide uppercase">
        {title}
      </p>

      <FormField htmlFor={id} label={label} required error={error}>
        <p id={descriptionId} className="text-muted-foreground text-xs">
          {description}
        </p>

        <div className="relative mt-3">
          <select
            id={id}
            value={value}
            onChange={(event) => onChange(Number(event.target.value))}
            aria-describedby={descriptionId}
            aria-invalid={error ? "true" : "false"}
            className={cn(
              "border-border bg-muted/40 text-foreground hover:bg-muted/60 h-11 w-full appearance-none rounded-lg border px-3 pr-10 text-sm font-medium transition outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-400/30",
              error
                ? "border-red-500/70 focus:border-red-500 focus:ring-red-400/30"
                : "",
            )}
          >
            {DAY_OPTIONS.map((day) => (
              <option key={day} value={day}>
                Dia {day}
              </option>
            ))}
          </select>
          <Icon
            icon={Icons.chevronDown}
            className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2"
            aria-hidden
          />
        </div>
      </FormField>
    </div>
  );
}
