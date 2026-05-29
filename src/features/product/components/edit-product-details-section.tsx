"use client";

import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Icons } from "@/shared/lib/icons";
import { applyBackendErrors } from "@/shared/lib/errors";

import { apiPatch } from "@/shared/api/client";
import { ApiError } from "@/shared/api/errors";
import { TextField } from "@/shared/ui/form-field";
import { CurrencyField } from "@/shared/ui/currency-field";

import type { ProductResponse } from "@/features/product/types";
import { parseEditDetailsError } from "@/features/product/lib/product-errors";
import { ProductTypeSelector } from "@/features/product/components/product-type-selector";
import {
  editProductDetailsSchema,
  type EditProductDetailsSchema,
} from "@/features/product/schemas/edit-product.schema";

type Props = {
  onDirtyChange?: (dirty: boolean) => void;
  product: ProductResponse;
};

export function EditProductDetailsSection({ onDirtyChange, product }: Props) {
  const router = useRouter();
  const [requestError, setRequestError] = useState<string | null>(null);

  const form = useForm<EditProductDetailsSchema>({
    resolver: zodResolver(editProductDetailsSchema),
    mode: "onTouched",
    defaultValues: {
      name: product.name,
      type: product.type,
      price: product.price,
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const selectedType = useWatch({ control, name: "type" });
  const typeLocked = product.quantity > 0;

  const onSubmit = handleSubmit(async (data) => {
    setRequestError(null);

    try {
      await apiPatch(`/api/products/${product.id}`, data);
      toast.success("Dados do produto atualizados.");
      reset(data);
      router.refresh();
      return;
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 0;
      const { fieldErrors, message } = parseEditDetailsError(error, status);

      applyBackendErrors(form, fieldErrors);

      if (status === 409 && !fieldErrors.name) {
        form.setError("name", { message });
      }

      if (status === 403) {
        toast.error(message);
        return;
      }

      setRequestError(message);
    }
  });

  return (
    <form
      noValidate
      id="tabpanel-details"
      role="tabpanel"
      aria-labelledby="tab-details"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit(event);
      }}
      className="space-y-6"
    >
      <header>
        <h2 className="text-foreground text-xl font-semibold tracking-tight">
          Dados do produto
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Atualize nome, tipo e preço do produto.
        </p>
      </header>

      {requestError ? (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-lg border border-red-500/35 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-300/40 dark:bg-red-500/10 dark:text-red-100"
        >
          {requestError}
        </p>
      ) : null}

      <div className="space-y-5">
        <TextField
          id="edit-product-name"
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
          disabled={typeLocked}
          disabledReason={
            typeLocked
              ? "Zere o estoque para alterar o tipo do produto."
              : undefined
          }
          value={selectedType}
          onChange={(value) =>
            setValue("type", value, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          hint={
            typeLocked
              ? "Zere o estoque para alterar o tipo do produto."
              : "Define a categoria do produto no catálogo."
          }
          error={errors.type?.message}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <CurrencyField
            control={control}
            id="edit-product-price"
            name="price"
            label="Preço unitário (R$)"
            required
            placeholder="0,00"
            hint="Valor cobrado por unidade vendida."
          />
        </div>
      </div>

      <footer className="border-border flex items-center justify-end gap-3 border-t pt-6">
        <button
          type="button"
          onClick={() =>
            reset({
              name: product.name,
              type: product.type,
              price: product.price,
            })
          }
          disabled={!isDirty || isSubmitting}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60"
        >
          Descartar
        </button>
        <button
          type="submit"
          disabled={!isDirty || isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 focus:ring-2 focus:ring-cyan-300/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Salvando..." : "Salvar alterações"}
          {!isSubmitting ? (
            <Icon icon={Icons.check} className="h-4 w-4" aria-hidden />
          ) : null}
        </button>
      </footer>
    </form>
  );
}
