"use client";

import { Icon } from "@iconify/react";

import { cn } from "@/shared/lib/cn";
import { Icons } from "@/shared/lib/icons";

import type { ProductType } from "@/features/product/types";

type Option = {
  description: string;
  icon: typeof Icons.droplets;
  label: string;
  value: ProductType;
};

const OPTIONS: Option[] = [
  {
    description: "Galões, garrafões e similares.",
    icon: Icons.droplets,
    label: "Água",
    value: "Water",
  },
  {
    description: "Botijões de GLP.",
    icon: Icons.flame,
    label: "Gás",
    value: "Gas",
  },
];

type ProductTypeSelectorProps = {
  disabled?: boolean;
  disabledReason?: string;
  error?: string;
  hint?: string;
  onChange: (value: ProductType) => void;
  required?: boolean;
  value: ProductType | undefined;
};

export function ProductTypeSelector({
  disabled = false,
  disabledReason,
  error,
  hint,
  onChange,
  required,
  value,
}: ProductTypeSelectorProps) {
  const showTooltip = disabled && Boolean(disabledReason);

  return (
    <fieldset className="space-y-2">
      <legend className="text-foreground text-sm font-medium">
        Tipo {required ? <span className="text-red-500">*</span> : null}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {OPTIONS.map((option) => {
          const isActive = value === option.value;
          const tooltipId = showTooltip
            ? `product-type-${option.value}-tooltip`
            : undefined;

          return (
            <div key={option.value} className="group relative">
              <button
                type="button"
                onClick={() => onChange(option.value)}
                aria-pressed={isActive}
                aria-disabled={disabled}
                aria-describedby={tooltipId}
                disabled={disabled}
                className={cn(
                  "bg-background flex w-full items-start gap-3 rounded-xl border p-4 text-left transition",
                  "focus:ring-2 focus:ring-cyan-400/40 focus:outline-none",
                  !disabled && "hover:border-cyan-400/60",
                  isActive
                    ? "border-cyan-400 ring-2 ring-cyan-400/30"
                    : "border-border",
                  disabled && "cursor-not-allowed opacity-60",
                )}
              >
                <span
                  className={cn(
                    "rounded-lg p-2",
                    isActive
                      ? "bg-cyan-500/15 text-cyan-400"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon icon={option.icon} className="h-5 w-5" aria-hidden />
                </span>
                <span className="flex-1">
                  <span className="text-foreground block text-sm font-semibold">
                    {option.label}
                  </span>
                  <span className="text-muted-foreground mt-1 block text-xs">
                    {option.description}
                  </span>
                </span>
              </button>

              {showTooltip ? (
                <span
                  id={tooltipId}
                  role="tooltip"
                  className={cn(
                    "pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max max-w-xs -translate-x-1/2",
                    "rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg",
                    "opacity-0 transition-opacity duration-150",
                    "group-focus-within:opacity-100 group-hover:opacity-100",
                    "after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-slate-900 after:content-['']",
                  )}
                >
                  {disabledReason}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      {hint && !error ? (
        <p className="text-muted-foreground text-xs">{hint}</p>
      ) : null}
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </fieldset>
  );
}
