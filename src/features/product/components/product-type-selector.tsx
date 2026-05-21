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
  error?: string;
  hint?: string;
  onChange: (value: ProductType) => void;
  required?: boolean;
  value: ProductType | undefined;
};

export function ProductTypeSelector({
  error,
  hint,
  onChange,
  required,
  value,
}: ProductTypeSelectorProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-foreground text-sm font-medium">
        Tipo {required ? <span className="text-red-500">*</span> : null}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {OPTIONS.map((option) => {
          const isActive = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={isActive}
              className={cn(
                "bg-background flex items-start gap-3 rounded-xl border p-4 text-left transition",
                "hover:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/40 focus:outline-none",
                isActive
                  ? "border-cyan-400 ring-2 ring-cyan-400/30"
                  : "border-border",
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
