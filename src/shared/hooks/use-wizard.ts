"use client";

import { useMemo, useState, useCallback } from "react";
import type { FieldPath, FieldValues, UseFormTrigger } from "react-hook-form";

type UseWizardOptions<T extends FieldValues> = {
  /** Quantidade total de passos (>= 1). */
  steps: number;
  /**
   * Campos validados em cada passo, na ordem. `stepFields[i]` é o array de
   * campos do passo `i`. Passos de revisão podem ter array vazio.
   */
  stepFields: Array<Array<FieldPath<T>>>;
  /** `form.trigger` do react-hook-form do form que esse wizard navega. */
  trigger: UseFormTrigger<T>;
};

export type UseWizardReturn = {
  step: number;
  isFirst: boolean;
  isLast: boolean;
  /** 0..100 — `step / (steps - 1) * 100`. */
  progress: number;
  /** Valida o passo atual e avança se válido. Retorna se avançou. */
  goNext: () => Promise<boolean>;
  goBack: () => void;
  /**
   * Reposiciona no primeiro passo que contém algum dos `fieldErrors`.
   * No-op se nenhum campo bater.
   */
  jumpToFieldError: (fieldErrors: Record<string, unknown>) => void;
};

/**
 * State machine genérico de wizard multi-passos.
 *
 * Mantém apenas o índice atual; a fonte de verdade dos dados continua sendo
 * o `useForm` do consumidor. Validação por passo é feita via `trigger`.
 */
export function useWizard<T extends FieldValues>({
  steps,
  stepFields,
  trigger,
}: UseWizardOptions<T>): UseWizardReturn {
  const [step, setStep] = useState(0);

  const goNext = useCallback(async () => {
    const fields = stepFields[step] ?? [];
    const valid = fields.length === 0 ? true : await trigger(fields);
    if (valid) {
      setStep((current) => Math.min(current + 1, steps - 1));
    }
    return valid;
  }, [step, stepFields, steps, trigger]);

  const goBack = useCallback(() => {
    setStep((current) => Math.max(current - 1, 0));
  }, []);

  const jumpToFieldError = useCallback(
    (fieldErrors: Record<string, unknown>) => {
      const target = stepFields.findIndex((fields) =>
        fields.some((field) => fieldErrors[field as string] != null),
      );
      if (target !== -1 && target !== step) {
        setStep(target);
      }
    },
    [stepFields, step],
  );

  return useMemo(
    () => ({
      step,
      isFirst: step === 0,
      isLast: step === steps - 1,
      progress: steps <= 1 ? 100 : (step / (steps - 1)) * 100,
      goNext,
      goBack,
      jumpToFieldError,
    }),
    [step, steps, goNext, goBack, jumpToFieldError],
  );
}
