"use client";

import { Icon } from "@iconify/react";

import { cn } from "@/shared/lib/cn";
import { Icons } from "@/shared/lib/icons";

import type { CustomerDocumentType } from "@/features/customer/types";

type Option = {
  description: string;
  icon: typeof Icons.userCog;
  label: string;
  value: CustomerDocumentType;
};

const OPTIONS: Option[] = [
  {
    description: "Cadastro com CPF.",
    icon: Icons.userCog,
    label: "Pessoa física",
    value: "PF",
  },
  {
    description: "Cadastro com CNPJ.",
    icon: Icons.fileText,
    label: "Pessoa jurídica",
    value: "PJ",
  },
];

type CustomerDocumentTypeSelectorProps = {
  error?: string;
  onChange: (value: CustomerDocumentType) => void;
  required?: boolean;
  value: CustomerDocumentType | undefined;
};

export function CustomerDocumentTypeSelector({
  error,
  onChange,
  required,
  value,
}: CustomerDocumentTypeSelectorProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-foreground text-sm font-medium">
        Tipo de cliente{" "}
        {required ? <span className="text-red-500">*</span> : null}
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
                "bg-background flex w-full items-start gap-3 rounded-xl border p-4 text-left transition",
                "focus:ring-2 focus:ring-cyan-400/40 focus:outline-none",
                "hover:border-cyan-400/60",
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
      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </fieldset>
  );
}
