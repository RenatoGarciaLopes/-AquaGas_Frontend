"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@iconify/react";
import type { ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FieldPath, UseFormRegisterReturn } from "react-hook-form";

import { useWizard } from "@/shared/hooks/use-wizard";
import { useCreateCustomer } from "@/features/customer/hooks/use-create-customer";

import { Icons } from "@/shared/lib/icons";
import { onlyDigits } from "@/shared/lib/formatters";
import { applyBackendErrors } from "@/shared/lib/errors";
import { maskCep, maskPhone, maskCustomerDocument } from "@/shared/lib/masks";

import { ApiError } from "@/shared/api/errors";
import { TextField } from "@/shared/ui/form-field";
import { type StepperStep } from "@/shared/ui/stepper";
import { WizardShell } from "@/shared/layouts/wizard-shell";

import type { RegisterCustomerInput } from "@/features/customer/types";
import { parseCustomerError } from "@/features/customer/lib/customer-errors";
import { CustomerDocumentTypeSelector } from "@/features/customer/components/customer-document-type-selector";
import {
  createCustomerSchema,
  type CreateCustomerSchema,
} from "@/features/customer/schemas/create-customer.schema";

const STEPS: StepperStep[] = [
  { label: "Identificação" },
  { label: "Contato e endereço" },
];

const STEP_FIELDS: Array<Array<FieldPath<CreateCustomerSchema>>> = [
  ["type", "name", "document"],
  [
    "email",
    "phone",
    "address.cep",
    "address.street",
    "address.number",
    "address.neighborhood",
    "address.city",
    "address.complement",
  ],
];

const STEP_TITLES = ["Identificação", "Contato e endereço"];

function toRegisterCustomerInput(
  data: CreateCustomerSchema,
): RegisterCustomerInput {
  return {
    address: {
      cep: onlyDigits(data.address.cep),
      city: data.address.city.trim(),
      complement: data.address.complement?.trim() || null,
      neighborhood: data.address.neighborhood.trim(),
      number: data.address.number.trim(),
      street: data.address.street.trim(),
    },
    document: onlyDigits(data.document),
    email: data.email.trim().toLowerCase(),
    name: data.name.trim().replace(/\s+/g, " "),
    phone: onlyDigits(data.phone),
  };
}

function maskedRegister(
  registerResult: UseFormRegisterReturn,
  mask: (value: string) => string,
) {
  return {
    ...registerResult,
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      event.target.value = mask(event.target.value);
      void registerResult.onChange(event);
    },
  };
}

export function CreateCustomerForm() {
  const router = useRouter();
  const createCustomer = useCreateCustomer();
  const [requestError, setRequestError] = useState<string | null>(null);

  const form = useForm<CreateCustomerSchema>({
    resolver: zodResolver(createCustomerSchema),
    mode: "onTouched",
    defaultValues: {
      address: {
        cep: "",
        city: "",
        complement: "",
        neighborhood: "",
        number: "",
        street: "",
      },
      document: "",
      email: "",
      name: "",
      phone: "",
      type: "PF",
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

  const wizard = useWizard<CreateCustomerSchema>({
    steps: STEPS.length,
    stepFields: STEP_FIELDS,
    trigger,
  });

  const values = useWatch({ control });
  const selectedType = useWatch({ control, name: "type" });

  function updateType(type: CreateCustomerSchema["type"]) {
    setValue("type", type, { shouldDirty: true, shouldValidate: true });
    setValue("document", maskCustomerDocument(values.document ?? "", type), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  const documentRegister = register("document");
  const phoneRegister = register("phone");
  const cepRegister = register("address.cep");

  const onSubmit = handleSubmit(async (data) => {
    setRequestError(null);

    try {
      await createCustomer.mutateAsync(toRegisterCustomerInput(data));
      router.push("/customers");
      router.refresh();
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 0;
      const { fieldErrors, message } = parseCustomerError(error, status);

      applyBackendErrors(form, fieldErrors);
      wizard.jumpToFieldError(fieldErrors);

      if (status === 403) {
        return;
      }

      setRequestError(message);
    }
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
              href="/customers"
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition"
            >
              <Icon icon={Icons.chevronLeft} className="h-4 w-4" aria-hidden />
              Cancelar
            </Link>
          ) : (
            <button
              type="button"
              onClick={wizard.goBack}
              disabled={isSubmitting || createCustomer.isPending}
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
              disabled={isSubmitting || createCustomer.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 focus:ring-2 focus:ring-cyan-300/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting || createCustomer.isPending
                ? "Salvando..."
                : "Salvar cliente"}
              {!isSubmitting && !createCustomer.isPending ? (
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
            <CustomerDocumentTypeSelector
              required
              value={selectedType}
              onChange={updateType}
              error={errors.type?.message}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                id="name"
                type="text"
                label="Nome"
                required
                autoComplete="name"
                placeholder="Ex.: Maria Silva"
                error={errors.name?.message}
                {...register("name")}
              />
              <TextField
                id="document"
                type="text"
                label={selectedType === "PJ" ? "CNPJ" : "CPF"}
                required
                inputMode="numeric"
                autoComplete="off"
                placeholder={
                  selectedType === "PJ"
                    ? "00.000.000/0000-00"
                    : "000.000.000-00"
                }
                error={errors.document?.message}
                {...maskedRegister(documentRegister, (value) =>
                  maskCustomerDocument(value, selectedType),
                )}
              />
            </div>
          </div>
        ) : null}

        {wizard.step === 1 ? (
          <div className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                id="email"
                type="email"
                label="Email"
                required
                autoComplete="email"
                placeholder="cliente@email.com"
                error={errors.email?.message}
                {...register("email")}
              />
              <TextField
                id="phone"
                type="tel"
                label="Telefone"
                required
                inputMode="tel"
                autoComplete="tel"
                placeholder="(11) 99999-9999"
                error={errors.phone?.message}
                {...maskedRegister(phoneRegister, maskPhone)}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                id="cep"
                type="text"
                label="CEP"
                required
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="00000-000"
                error={errors.address?.cep?.message}
                {...maskedRegister(cepRegister, maskCep)}
              />
              <TextField
                id="city"
                type="text"
                label="Cidade"
                required
                autoComplete="address-level2"
                placeholder="São Paulo"
                error={errors.address?.city?.message}
                {...register("address.city")}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-[1fr_160px]">
              <TextField
                id="street"
                type="text"
                label="Rua"
                required
                autoComplete="address-line1"
                placeholder="Rua das Águas"
                error={errors.address?.street?.message}
                {...register("address.street")}
              />
              <TextField
                id="number"
                type="text"
                label="Número"
                required
                autoComplete="address-line2"
                placeholder="123"
                error={errors.address?.number?.message}
                {...register("address.number")}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                id="neighborhood"
                type="text"
                label="Bairro"
                required
                autoComplete="address-level3"
                placeholder="Centro"
                error={errors.address?.neighborhood?.message}
                {...register("address.neighborhood")}
              />
              <TextField
                id="complement"
                type="text"
                label="Complemento"
                autoComplete="off"
                placeholder="Apto, bloco, referência"
                error={errors.address?.complement?.message}
                {...register("address.complement")}
              />
            </div>
          </div>
        ) : null}

      </WizardShell>
    </form>
  );
}
