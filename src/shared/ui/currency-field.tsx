"use client";

import { useController } from "react-hook-form";
import type { Control, FieldPath, FieldValues } from "react-hook-form";

import { numberToBrl, maskBrlInput } from "@/shared/lib/masks";

import { TextField } from "@/shared/ui/form-field";

type CurrencyFieldProps<T extends FieldValues> = {
  control: Control<T>;
  hint?: string;
  id: string;
  label: string;
  name: FieldPath<T>;
  placeholder?: string;
  required?: boolean;
};

/**
 * Campo de valor em BRL com máscara reutilizável.
 *
 * Conecta a máscara `maskBrlInput` ao `react-hook-form` via `useController`:
 * - O estado do formulário guarda o valor em reais (`number | undefined`).
 * - O input exibe a string formatada (`"1.234,56"`).
 *
 * Reutiliza o visual do `TextField` (floating label) — basta passar `control`
 * e `name`, sem precisar mexer no schema (que deve esperar `z.number()`).
 */
export function CurrencyField<T extends FieldValues>({
  control,
  hint,
  id,
  label,
  name,
  placeholder = "0,00",
  required,
}: CurrencyFieldProps<T>) {
  const {
    field: { onBlur, onChange, ref, value },
    fieldState: { error },
  } = useController({ control, name });

  const display = numberToBrl(value as number | null | undefined);

  return (
    <TextField
      id={id}
      type="text"
      label={label}
      required={required}
      inputMode="decimal"
      autoComplete="off"
      placeholder={placeholder}
      hint={hint}
      error={error?.message}
      value={display}
      onChange={(event) => {
        const result = maskBrlInput(event.target.value);
        onChange(result.value);
      }}
      onBlur={onBlur}
      ref={ref}
    />
  );
}
