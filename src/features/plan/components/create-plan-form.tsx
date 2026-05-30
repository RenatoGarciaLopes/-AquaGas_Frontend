"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import type { FieldPath } from "react-hook-form";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useWizard } from "@/shared/hooks/use-wizard";
import { useCreatePlan } from "@/features/plan/hooks/use-create-plan";

import { Icons } from "@/shared/lib/icons";

import { ApiError } from "@/shared/api/errors";
import { type StepperStep } from "@/shared/ui/stepper";
import { WizardShell } from "@/shared/layouts/wizard-shell";

import type { RegisterPlanInput } from "@/features/plan/types";
import { CreatePlanItemsStep } from "@/features/plan/components/create-plan-items-step";
import { CreatePlanConfigStep } from "@/features/plan/components/create-plan-config-step";
import { CreatePlanCustomerStep } from "@/features/plan/components/create-plan-customer-step";
import {
  createPlanSchema,
  type CreatePlanSchema,
} from "@/features/plan/schemas/create-plan.schema";

type Customer = {
  id: string;
  name: string;
  document: string;
  typeDocument?: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
  type: string;
};

type CreatePlanFormProps = {
  customers: Customer[];
  products: Product[];
  canDiscount: boolean;
};

const STEPS: StepperStep[] = [
  { label: "Cliente" },
  { label: "Configuração" },
  { label: "Itens" },
];

const STEP_FIELDS: Array<Array<FieldPath<CreatePlanSchema>>> = [
  ["customerId"],
  ["cycle", "deliveryDay", "billingDay", "discount", "durationInMonths"],
  ["items"],
];

const STEP_TITLES = [
  "Selecione o cliente",
  "Configure o plano",
  "Adicione os itens",
];

function toRegisterPlanInput(data: CreatePlanSchema): RegisterPlanInput {
  const input: RegisterPlanInput = {
    customerId: data.customerId,
    cycle: data.cycle,
    deliveryDay: data.deliveryDay,
    billingDay: data.billingDay,
    items: data.items.map((i) => ({
      productId: i.productId,
      quantity: i.quantity,
    })),
  };
  if (data.discount != null && data.discount > 0) {
    input.discount = data.discount;
  }
  if (data.cycle === "Custom" && data.durationInMonths) {
    input.durationInMonths = data.durationInMonths;
  }
  return input;
}

export function CreatePlanForm({
  customers,
  products,
  canDiscount,
}: CreatePlanFormProps) {
  const router = useRouter();
  const createPlan = useCreatePlan();
  const [requestError, setRequestError] = useState<string | null>(null);
  const [ignoreWarnings, setIgnoreWarnings] = useState(false);

  const form = useForm<CreatePlanSchema>({
    resolver: zodResolver(createPlanSchema),
    mode: "onTouched",
    defaultValues: {
      customerId: "",
      cycle: "Monthly",
      deliveryDay: 1,
      billingDay: 1,
      discount: undefined,
      durationInMonths: undefined,
      items: [],
    },
  });

  const {
    handleSubmit,
    setValue,
    control,
    trigger,
    formState: { errors, isSubmitting },
  } = form;

  const wizard = useWizard<CreatePlanSchema>({
    steps: STEPS.length,
    stepFields: STEP_FIELDS,
    trigger,
  });

  const watchedValues = useWatch({ control });
  const cycle = useWatch({ control, name: "cycle" });
  const items = useWatch({ control, name: "items" }) ?? [];

  const onSubmit = handleSubmit(async (data) => {
    setRequestError(null);

    const input = toRegisterPlanInput(data);
    if (ignoreWarnings) {
      input.ignoreWarnings = true;
    }

    try {
      const response = await createPlan.mutateAsync(input);
      const planId = response.data?.id;
      router.push(planId ? `/plans/${planId}` : "/plans");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.fieldErrors) {
          const entries = Object.entries(error.fieldErrors);
          const mapped: Partial<Record<FieldPath<CreatePlanSchema>, string>> =
            {};
          for (const [field, messages] of entries) {
            const msg = Array.isArray(messages) ? messages[0] : messages;
            if (msg) {
              mapped[field.toLowerCase() as FieldPath<CreatePlanSchema>] = msg;
            }
          }
          for (const [field, message] of Object.entries(mapped)) {
            if (typeof message === "string") {
              form.setError(field as FieldPath<CreatePlanSchema>, { message });
            }
          }
          wizard.jumpToFieldError(mapped);
        }
        setRequestError(error.message);
      } else {
        setRequestError("Erro inesperado. Tente novamente.");
      }
    }
  });

  return (
    <div className="space-y-6">
      <Link
        href="/plans"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition"
      >
        <Icon icon={Icons.chevronLeft} className="h-4 w-4" aria-hidden />
        Voltar para planos
      </Link>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (!wizard.isLast) return;
          void onSubmit(event);
        }}
        onKeyDownCapture={(event) => {
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
              <div className="space-y-2">
                <p
                  role="alert"
                  aria-live="polite"
                  className="rounded-lg border border-red-500/35 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-300/40 dark:bg-red-500/10 dark:text-red-100"
                >
                  {requestError}
                </p>
                {!ignoreWarnings ? (
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={ignoreWarnings}
                      onChange={(e) => setIgnoreWarnings(e.target.checked)}
                      className="h-4 w-4 rounded border-amber-300"
                    />
                    <span className="text-muted-foreground">
                      Prosseguir mesmo assim
                    </span>
                  </label>
                ) : null}
              </div>
            ) : null
          }
          back={
            wizard.isFirst ? (
              <Link
                href="/plans"
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition"
              >
                <Icon
                  icon={Icons.chevronLeft}
                  className="h-4 w-4"
                  aria-hidden
                />
                Cancelar
              </Link>
            ) : (
              <button
                type="button"
                onClick={wizard.goBack}
                disabled={isSubmitting || createPlan.isPending}
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
                disabled={isSubmitting || createPlan.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 focus:ring-2 focus:ring-cyan-300/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting || createPlan.isPending
                  ? "Criando plano…"
                  : "Criar plano"}
                {!isSubmitting && !createPlan.isPending ? (
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
            <CreatePlanCustomerStep
              customers={customers}
              selectedId={watchedValues.customerId ?? ""}
              onSelect={(id) =>
                setValue("customerId", id, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              error={errors.customerId?.message}
            />
          ) : null}

          {wizard.step === 1 ? (
            <CreatePlanConfigStep
              errors={errors}
              cycle={cycle}
              deliveryDay={watchedValues.deliveryDay ?? 1}
              billingDay={watchedValues.billingDay ?? 1}
              durationInMonths={watchedValues.durationInMonths}
              discount={watchedValues.discount}
              canDiscount={canDiscount}
              onCycleChange={(c) => {
                setValue("cycle", c, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
                if (c === "Custom" && !watchedValues.durationInMonths) {
                  setValue("durationInMonths", 2, { shouldDirty: true });
                }
              }}
              onDeliveryDayChange={(v) =>
                setValue("deliveryDay", v, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              onBillingDayChange={(v) =>
                setValue("billingDay", v, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              onDurationInMonthsChange={(v) =>
                setValue("durationInMonths", v, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              onDiscountChange={(v) =>
                setValue("discount", v, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
          ) : null}

          {wizard.step === 2 ? (
            <CreatePlanItemsStep
              products={products}
              items={items}
              onItemsChange={(newItems) =>
                setValue("items", newItems, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              error={errors.items?.message ?? errors.items?.root?.message}
            />
          ) : null}
        </WizardShell>
      </form>
    </div>
  );
}
