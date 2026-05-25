"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import type { FieldPath } from "react-hook-form";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useWizard } from "@/shared/hooks/use-wizard";

import { cn } from "@/shared/lib/cn";
import { Icons } from "@/shared/lib/icons";
import { applyBackendErrors } from "@/shared/lib/errors";
import { onlyIntegerKeys, onlyIntegerPaste } from "@/shared/lib/masks";

import { apiPost } from "@/shared/api/client";
import { ApiError } from "@/shared/api/errors";
import { TextField } from "@/shared/ui/form-field";
import { type StepperStep } from "@/shared/ui/stepper";
import { CurrencyField } from "@/shared/ui/currency-field";
import { WizardShell } from "@/shared/layouts/wizard-shell";

import { parseProductError } from "@/features/product/lib/product-errors";
import { ProductTypeSelector } from "@/features/product/components/product-type-selector";
import {
  createProductSchema,
  type CreateProductSchema,
} from "@/features/product/schemas/create-product.schema";

const STEPS: StepperStep[] = [
  { label: "Identificação" },
  { label: "Preço e estoque" },
];

const STEP_FIELDS: Array<Array<FieldPath<CreateProductSchema>>> = [
  ["name", "type"],
  ["price", "quantity"],
];

const STEP_TITLES = ["Identificação", "Preço e estoque"];

export function CreateProductForm() {
  const router = useRouter();
  const [requestError, setRequestError] = useState<string | null>(null);

  const form = useForm<CreateProductSchema>({
    resolver: zodResolver(createProductSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      type: undefined as unknown as CreateProductSchema["type"],
      price: undefined as unknown as number,
      quantity: undefined as unknown as number,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    trigger,
    getFieldState,
    formState,
  } = form;
  const { isSubmitting, isSubmitted } = formState;

  // Só exibe erro depois que o campo foi tocado ou o form submetido — evita
  // que campos de outros passos do wizard apareçam em vermelho ao avançar.
  const visibleError = (
    name: FieldPath<CreateProductSchema>,
  ): string | undefined => {
    const state = getFieldState(name, formState);
    return state.isTouched || isSubmitted ? state.error?.message : undefined;
  };

  const quantityErrorVisible = Boolean(visibleError("quantity"));

  const quantityValue = useWatch({ control, name: "quantity" });
  const canDecrementQuantity =
    Number.isFinite(Number(quantityValue)) && Number(quantityValue) > 0;

  function adjustQuantity(delta: number) {
    const raw = getValues("quantity");
    const current = Number.isFinite(Number(raw)) ? Number(raw) : 0;
    const next = Math.max(0, Math.trunc(current) + delta);
    setValue("quantity", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  const wizard = useWizard<CreateProductSchema>({
    steps: STEPS.length,
    stepFields: STEP_FIELDS,
    trigger,
  });

  const selectedType = useWatch({ control, name: "type" });

  const onSubmit = handleSubmit(async (data) => {
    setRequestError(null);

    try {
      await apiPost("/api/products", data);
      toast.success("Produto criado com sucesso.");
      router.push("/products");
      router.refresh();
      return;
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 0;
      const { fieldErrors, message } = parseProductError(error, status);

      applyBackendErrors(form, fieldErrors);

      if (status === 409 && !fieldErrors.name) {
        form.setError("name", { message });
      }

      wizard.jumpToFieldError(fieldErrors);

      if (status === 403) {
        toast.error(message);
        return;
      }

      setRequestError(message);
    }
  });

  return (
    <div className="space-y-6">
      <Link
        href="/products"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition"
      >
        <Icon icon={Icons.chevronLeft} className="h-4 w-4" aria-hidden />
        Voltar para produtos
      </Link>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit(event);
        }}
        onKeyDownCapture={(event) => {
          // Em passos não-finais do wizard, Enter num input dispararia o
          // submit implícito do form — marcando isSubmitted=true e fazendo
          // todos os campos de passos futuros aparecerem em vermelho ao
          // montarem.
          if (
            event.key === "Enter" &&
            !wizard.isLast &&
            event.target instanceof HTMLElement &&
            event.target.tagName === "INPUT"
          ) {
            event.preventDefault();
            void wizard.goNext();
          }
        }}
      >
        <WizardShell
          steps={STEPS}
          currentStep={wizard.step}
          progress={wizard.progress}
          title={STEP_TITLES[wizard.step]}
          banner={
            requestError ? (
              <p
                role="alert"
                aria-live="polite"
                className="rounded-lg border border-red-300/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
              >
                {requestError}
              </p>
            ) : null
          }
          back={
            wizard.isFirst ? (
              <span aria-hidden />
            ) : (
              <button
                type="button"
                onClick={wizard.goBack}
                disabled={isSubmitting}
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Icon
                  icon={Icons.chevronLeft}
                  className="h-4 w-4"
                  aria-hidden
                />
                Voltar
              </button>
            )
          }
          next={
            wizard.isLast ? (
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 focus:ring-2 focus:ring-cyan-300/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Salvando..." : "Salvar produto"}
                {!isSubmitting ? (
                  <Icon icon={Icons.check} className="h-4 w-4" aria-hidden />
                ) : null}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void wizard.goNext()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 focus:ring-2 focus:ring-cyan-300/50 focus:outline-none"
              >
                Próximo
                <Icon
                  icon={Icons.chevronRight}
                  className="h-4 w-4"
                  aria-hidden
                />
              </button>
            )
          }
        >
          {wizard.step === 0 ? (
            <div className="space-y-5">
              <TextField
                id="name"
                type="text"
                label="Nome do produto"
                required
                autoComplete="off"
                placeholder="Ex.: Água Mineral 20L"
                hint="Mínimo de 3 caracteres. Deve ser único no catálogo."
                error={visibleError("name")}
                {...register("name")}
              />

              <ProductTypeSelector
                required
                value={selectedType}
                onChange={(value) =>
                  setValue("type", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                hint="Define a categoria do produto no catálogo."
                error={visibleError("type")}
              />
            </div>
          ) : null}

          {wizard.step === 1 ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <CurrencyField
                control={control}
                id="price"
                name="price"
                label="Preço unitário (R$)"
                required
                placeholder="0,00"
                hint="Valor cobrado por unidade vendida."
              />
              <div className="space-y-1.5">
                <div
                  className={cn(
                    "bg-muted/40 hover:bg-muted/60 focus-within:bg-muted/60 flex h-[58px] items-center rounded-xl border border-transparent px-3 transition",
                    quantityErrorVisible ? "ring-1 ring-red-400/70" : "",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <label
                      htmlFor="quantity"
                      className="text-muted-foreground block text-xs font-medium"
                    >
                      Quantidade inicial <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="quantity"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="0"
                      onKeyDown={onlyIntegerKeys}
                      onPaste={onlyIntegerPaste}
                      aria-invalid={quantityErrorVisible ? "true" : "false"}
                      className="text-foreground placeholder:text-muted-foreground/60 mt-0.5 w-full border-0 bg-transparent p-0 text-sm leading-tight shadow-none outline-none focus:ring-0 focus:outline-none"
                      {...register("quantity")}
                    />
                  </div>
                  <div className="ml-2 flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      aria-label="Diminuir quantidade"
                      onClick={() => adjustQuantity(-1)}
                      disabled={!canDecrementQuantity}
                      className="text-muted-foreground hover:bg-muted hover:text-foreground border-border inline-flex h-7 w-7 items-center justify-center rounded-md border text-base leading-none font-semibold transition focus:ring-2 focus:ring-cyan-400/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      −
                    </button>
                    <button
                      type="button"
                      aria-label="Aumentar quantidade"
                      onClick={() => adjustQuantity(1)}
                      className="text-muted-foreground hover:bg-muted hover:text-foreground border-border inline-flex h-7 w-7 items-center justify-center rounded-md border text-base leading-none font-semibold transition focus:ring-2 focus:ring-cyan-400/40 focus:outline-none"
                    >
                      +
                    </button>
                  </div>
                </div>
                {visibleError("quantity") ? (
                  <p className="px-1 text-xs text-red-400">
                    {visibleError("quantity")}
                  </p>
                ) : (
                  <p className="text-muted-foreground px-1 text-xs">
                    Pode ser 0 — você poderá registrar entradas depois.
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </WizardShell>
      </form>
    </div>
  );
}
