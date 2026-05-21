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

import { Icons } from "@/shared/lib/icons";
import { applyBackendErrors } from "@/shared/lib/errors";
import { onlyIntegerKeys, onlyIntegerPaste } from "@/shared/lib/masks";

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
    control,
    trigger,
    formState: { errors, isSubmitting },
  } = form;

  const wizard = useWizard<CreateProductSchema>({
    steps: STEPS.length,
    stepFields: STEP_FIELDS,
    trigger,
  });

  const selectedType = useWatch({ control, name: "type" });

  const onSubmit = handleSubmit(async (data) => {
    setRequestError(null);

    let response: Response;
    try {
      response = await fetch("/api/products", {
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
    } catch {
      setRequestError(
        "Falha de conexão. Verifique sua internet e tente novamente.",
      );
      return;
    }

    if (response.ok) {
      toast.success("Produto criado com sucesso.");
      router.push("/products");
      router.refresh();
      return;
    }

    if (response.status === 401) {
      router.push("/login?expired=1");
      return;
    }

    const payload = await response.json().catch(() => null);
    const { fieldErrors, message } = parseProductError(
      payload,
      response.status,
    );

    applyBackendErrors(form, fieldErrors);

    if (response.status === 409 && !fieldErrors.name) {
      form.setError("name", { message });
    }

    wizard.jumpToFieldError(fieldErrors);

    if (response.status === 403) {
      toast.error(message);
      return;
    }

    setRequestError(message);
  });

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit(event);
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
            <Link
              href="/products"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition"
            >
              <Icon icon={Icons.chevronLeft} className="h-4 w-4" aria-hidden />
              Cancelar
            </Link>
          ) : (
            <button
              type="button"
              onClick={wizard.goBack}
              disabled={isSubmitting}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Icon icon={Icons.chevronLeft} className="h-4 w-4" aria-hidden />
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
              <Icon icon={Icons.chevronRight} className="h-4 w-4" aria-hidden />
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
              error={errors.name?.message}
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
              error={errors.type?.message}
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
            <TextField
              id="quantity"
              type="text"
              label="Quantidade inicial"
              required
              inputMode="numeric"
              autoComplete="off"
              placeholder="0"
              onKeyDown={onlyIntegerKeys}
              onPaste={onlyIntegerPaste}
              hint="Pode ser 0 — você poderá registrar entradas depois."
              error={errors.quantity?.message}
              {...register("quantity")}
            />
          </div>
        ) : null}
      </WizardShell>
    </form>
  );
}
