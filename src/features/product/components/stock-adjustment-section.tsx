"use client";

import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { cn } from "@/shared/lib/cn";
import { Icons } from "@/shared/lib/icons";
import { applyBackendErrors } from "@/shared/lib/errors";
import { onlyIntegerKeys, onlyIntegerPaste } from "@/shared/lib/masks";

import { apiPatch } from "@/shared/api/client";
import { ApiError } from "@/shared/api/errors";
import { TextField } from "@/shared/ui/form-field";

import type { ProductResponse } from "@/features/product/types";
import { parseStockAdjustmentError } from "@/features/product/lib/product-errors";
import { ProductStockCell } from "@/features/product/components/product-stock-cell";
import {
  adjustStockSchema,
  type AdjustStockSchema,
} from "@/features/product/schemas/edit-product.schema";

type Props = {
  onDirtyChange?: (dirty: boolean) => void;
  product: ProductResponse;
};

const MOVEMENT_OPTIONS = [
  {
    description: "Reposição ou devolução",
    icon: Icons.arrowDown,
    label: "Entrada",
    value: "Entry",
  },
  {
    description: "Venda ou perda",
    icon: Icons.arrowUp,
    label: "Saída",
    value: "Exit",
  },
] as const;

export function StockAdjustmentSection({ onDirtyChange, product }: Props) {
  const router = useRouter();
  const [requestError, setRequestError] = useState<string | null>(null);

  const form = useForm<AdjustStockSchema>({
    resolver: zodResolver(adjustStockSchema),
    mode: "onTouched",
    defaultValues: {
      stockMovementType:
        undefined as unknown as AdjustStockSchema["stockMovementType"],
      quantity: undefined as unknown as number,
      reason: "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = form;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const selectedMovement = useWatch({ control, name: "stockMovementType" });
  const quantityValue = useWatch({ control, name: "quantity" });

  function adjustQuantity(delta: number) {
    const raw = getValues("quantity");
    const current = Number.isFinite(Number(raw)) ? Number(raw) : 0;
    const next = Math.max(0, Math.trunc(current) + delta);
    setValue("quantity", next, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  const canDecrement =
    Number.isFinite(Number(quantityValue)) && Number(quantityValue) > 0;

  const onSubmit = handleSubmit(async (data) => {
    setRequestError(null);

    try {
      await apiPatch(`/api/products/${product.id}/stock`, data);
      toast.success(
        data.stockMovementType === "Entry"
          ? `Entrada de ${data.quantity} un. registrada.`
          : `Saída de ${data.quantity} un. registrada.`,
      );
      reset({
        stockMovementType:
          undefined as unknown as AdjustStockSchema["stockMovementType"],
        quantity: undefined as unknown as number,
        reason: "",
      });
      router.refresh();
      return;
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 0;
      const { fieldErrors, message } = parseStockAdjustmentError(error, status);

      applyBackendErrors(form, fieldErrors);

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
      id="tabpanel-stock"
      role="tabpanel"
      aria-labelledby="tab-stock"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit(event);
      }}
      className="space-y-6"
    >
      <header>
        <h2 className="text-foreground text-xl font-semibold tracking-tight">
          Estoque
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Registre entradas e saídas de estoque. O motivo fica registrado no
          histórico de movimentações.
        </p>
      </header>

      <div className="border-border bg-muted/30 flex items-center justify-between rounded-xl border px-4 py-3">
        <div>
          <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
            Estoque atual
          </p>
          <p className="text-foreground mt-1 text-2xl font-semibold">
            {product.quantity}{" "}
            <span className="text-muted-foreground text-sm font-normal">
              unidades
            </span>
          </p>
        </div>
        <ProductStockCell quantity={product.quantity} />
      </div>

      {requestError ? (
        <p
          role="alert"
          aria-live="polite"
          className="rounded-lg border border-red-300/40 bg-red-500/10 px-4 py-3 text-sm text-red-200"
        >
          {requestError}
        </p>
      ) : null}

      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <p
            id="movement-type-label"
            className="text-foreground text-sm font-medium"
          >
            Tipo de movimentação{" "}
            <span className="text-red-500" aria-hidden>
              *
            </span>
          </p>
        </div>

        <div className="grid gap-3 lg:grid-cols-3 lg:items-start">
          <div
            className={cn(
              "bg-muted/40 hover:bg-muted/60 focus-within:bg-muted/60 flex h-[58px] items-center rounded-xl border border-transparent px-3 transition",
              errors.quantity ? "ring-1 ring-red-400/70" : "",
            )}
          >
            <div className="min-w-0 flex-1">
              <label
                htmlFor="stock-quantity"
                className="text-muted-foreground block text-xs font-medium"
              >
                Quantidade <span className="text-red-500">*</span>
              </label>
              <input
                id="stock-quantity"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                placeholder="0"
                onKeyDown={onlyIntegerKeys}
                onPaste={onlyIntegerPaste}
                aria-invalid={errors.quantity ? "true" : "false"}
                className="text-foreground placeholder:text-muted-foreground/60 mt-0.5 w-full border-0 bg-transparent p-0 text-sm leading-tight shadow-none outline-none focus:ring-0 focus:outline-none"
                {...register("quantity")}
              />
            </div>
            <div className="ml-2 flex shrink-0 items-center gap-1">
              <button
                type="button"
                aria-label="Diminuir quantidade"
                onClick={() => adjustQuantity(-1)}
                disabled={!canDecrement}
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

          {errors.quantity?.message ? (
            <p
              role="alert"
              className="px-1 text-xs text-red-400 lg:col-span-1 lg:col-start-1 lg:row-start-2"
            >
              {errors.quantity.message}
            </p>
          ) : (
            <p className="text-muted-foreground px-1 text-xs lg:col-span-1 lg:col-start-1 lg:row-start-2">
              Número de unidades movimentadas.
            </p>
          )}

          <div
            role="radiogroup"
            aria-labelledby="movement-type-label"
            aria-describedby="movement-type-hint"
            aria-invalid={errors.stockMovementType ? "true" : "false"}
            className="contents"
          >
            {MOVEMENT_OPTIONS.map((option) => {
              const isActive = selectedMovement === option.value;
              return (
                <button
                  key={option.value}
                  id={`movement-${option.value}`}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  onClick={() =>
                    setValue("stockMovementType", option.value, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  className={cn(
                    "bg-background flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition",
                    "hover:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/40 focus:outline-none",
                    isActive
                      ? "border-cyan-400 ring-2 ring-cyan-400/30"
                      : "border-border",
                  )}
                >
                  <span
                    className={cn(
                      "rounded-lg p-1.5",
                      isActive
                        ? "bg-cyan-500/15 text-cyan-400"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon icon={option.icon} className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="flex-1 leading-tight">
                    <span className="text-foreground block text-sm font-semibold">
                      {option.label}
                    </span>
                    <span className="text-muted-foreground block text-[11px]">
                      {option.description}
                    </span>
                  </span>
                </button>
              );
            })}

            {errors.stockMovementType?.message ? (
              <p
                role="alert"
                className="px-1 text-xs text-red-400 lg:col-span-2 lg:col-start-2 lg:row-start-2"
              >
                {errors.stockMovementType.message}
              </p>
            ) : (
              <p
                id="movement-type-hint"
                className="text-muted-foreground px-1 text-xs lg:col-span-2 lg:col-start-2 lg:row-start-2"
              >
                Entrada aumenta o estoque, saída reduz.
              </p>
            )}
          </div>
        </div>
      </div>

      <TextField
        id="stock-reason"
        type="text"
        label="Motivo"
        required
        autoComplete="off"
        placeholder="Ex.: Reposição de fornecedor"
        hint="Mínimo de 3 caracteres. Fica registrado no histórico."
        error={errors.reason?.message}
        {...register("reason")}
      />

      <footer className="border-border flex items-center justify-end gap-3 border-t pt-6">
        <button
          type="button"
          onClick={() =>
            reset({
              stockMovementType:
                undefined as unknown as AdjustStockSchema["stockMovementType"],
              quantity: undefined as unknown as number,
              reason: "",
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
          {isSubmitting ? "Registrando..." : "Registrar movimentação"}
          {!isSubmitting ? (
            <Icon icon={Icons.check} className="h-4 w-4" aria-hidden />
          ) : null}
        </button>
      </footer>
    </form>
  );
}
