import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

/**
 * Aplica um map de erros vindos do backend (já normalizado para
 * `{ campo: mensagem }`) nos respectivos inputs do react-hook-form.
 *
 * O parser que conhece os nomes de campo de cada feature mora em
 * `features/<m>/lib/*-errors.ts`. Esta função é só o aplicador genérico.
 */
export function applyBackendErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
  fieldErrors: Partial<Record<FieldPath<T>, string>>,
): void {
  for (const [field, message] of Object.entries(fieldErrors)) {
    if (typeof message === "string" && message.length > 0) {
      form.setError(field as FieldPath<T>, { message });
    }
  }
}
