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
import { useViaCepLookup } from "@/shared/hooks/use-viacep-lookup";
import { useCreateCustomer } from "@/features/customer/hooks/use-create-customer";

import { Icons } from "@/shared/lib/icons";
import { onlyDigits } from "@/shared/lib/formatters";
import { applyBackendErrors } from "@/shared/lib/errors";
import { maskCep, maskPhone, maskCustomerDocument } from "@/shared/lib/masks";

import { ApiError } from "@/shared/api/errors";
import { TextField } from "@/shared/ui/form-field";
import { FormSection } from "@/shared/ui/form-section";
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
  const [finalSubmitAttempted, setFinalSubmitAttempted] = useState(false);

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
    setFocus,
    clearErrors,
    setError,
    control,
    trigger,
    getValues,
    getFieldState,
    formState,
  } = form;
  const { isSubmitting, dirtyFields } = formState;

  const viacep = useViaCepLookup();

  // O resolver pode validar o schema inteiro, mas o wizard só deve exibir
  // erros visuais depois do blur do campo ou do submit final.
  const visibleError = (
    name: FieldPath<CreateCustomerSchema>,
  ): string | undefined => {
    const state = getFieldState(name, formState);
    return state.isTouched || finalSubmitAttempted
      ? state.error?.message
      : undefined;
  };

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

  async function handleCepChange(event: ChangeEvent<HTMLInputElement>) {
    event.target.value = maskCep(event.target.value);
    await cepRegister.onChange(event);

    const digits = onlyDigits(event.target.value);
    if (digits.length !== 8) return;
    if (viacep.lastCep === digits && viacep.status !== "error") return;

    const result = await viacep.lookup(digits);
    if (!result) {
      const message =
        viacep.error?.kind === "not_found"
          ? "CEP não encontrado."
          : viacep.error?.message;
      if (
        viacep.error?.kind === "not_found" ||
        viacep.error?.kind === "invalid"
      ) {
        setError("address.cep", { message: message ?? "CEP inválido." });
      }
      return;
    }

    clearErrors("address.cep");
    const current = getValues("address");
    const fill = (key: "street" | "neighborhood" | "city", value: string) => {
      if (!value) return;
      const isDirty = Boolean(dirtyFields.address?.[key]);
      const hasValue = Boolean(current[key]?.trim());
      if (isDirty && hasValue) return;
      setValue(`address.${key}`, value, {
        shouldDirty: false,
        shouldValidate: true,
      });
    };
    fill("street", result.street);
    fill("neighborhood", result.neighborhood);
    fill("city", result.city);

    setFocus("address.number");
  }

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
    <div className="space-y-6">
      <Link
        href="/customers"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition"
      >
        <Icon icon={Icons.chevronLeft} className="h-4 w-4" aria-hidden />
        Voltar para clientes
      </Link>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          if (!wizard.isLast) {
            return;
          }
          setFinalSubmitAttempted(true);
          void onSubmit(event);
        }}
        onKeyDownCapture={(event) => {
          // Em passos não-finais do wizard, Enter num input dispararia o submit
          // implícito do form — marcando isSubmitted=true e fazendo todos os
          // campos de passos futuros aparecerem em vermelho ao montarem.
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
                className="rounded-lg border border-red-500/35 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-300/40 dark:bg-red-500/10 dark:text-red-100"
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
                disabled={isSubmitting || createCustomer.isPending}
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
              <CustomerDocumentTypeSelector
                required
                value={selectedType}
                onChange={updateType}
                error={visibleError("type")}
              />

              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  id="name"
                  type="text"
                  label="Nome"
                  required
                  autoComplete="name"
                  placeholder="Ex.: Maria Silva"
                  error={visibleError("name")}
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
                  error={visibleError("document")}
                  {...maskedRegister(documentRegister, (value) =>
                    maskCustomerDocument(value, selectedType),
                  )}
                />
              </div>
            </div>
          ) : null}

          {wizard.step === 1 ? (
            <div className="space-y-6">
              <FormSection
                title="Contato"
                description="Como falaremos com este cliente."
                icon={Icons.phone}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField
                    id="email"
                    type="email"
                    label="Email"
                    required
                    autoComplete="email"
                    placeholder="cliente@email.com"
                    error={visibleError("email")}
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
                    error={visibleError("phone")}
                    {...maskedRegister(phoneRegister, maskPhone)}
                  />
                </div>
              </FormSection>

              <FormSection
                title="Endereço"
                description="Informe o CEP para preenchermos rua, bairro e cidade automaticamente."
                icon={Icons.mapPoint}
              >
                <div className="grid gap-5 sm:grid-cols-[200px_1fr]">
                  <div className="relative">
                    <TextField
                      id="cep"
                      type="text"
                      label="CEP"
                      required
                      inputMode="numeric"
                      autoComplete="postal-code"
                      placeholder="00000-000"
                      error={visibleError("address.cep")}
                      {...cepRegister}
                      onChange={handleCepChange}
                    />
                    {viacep.status === "loading" ? (
                      <span
                        className="text-muted-foreground absolute top-3 right-4 inline-flex items-center gap-1.5 text-xs"
                        aria-live="polite"
                      >
                        <Icon
                          icon={Icons.refresh}
                          className="h-3.5 w-3.5 animate-spin"
                          aria-hidden
                        />
                        Buscando...
                      </span>
                    ) : null}
                  </div>
                  {viacep.error?.kind === "network" ? (
                    <p
                      role="alert"
                      className="flex items-center rounded-lg border border-amber-300/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200"
                    >
                      Não foi possível consultar o CEP. Preencha o endereço
                      manualmente.
                    </p>
                  ) : (
                    <div className="hidden sm:block" />
                  )}
                </div>

                <div
                  className="grid gap-5 sm:grid-cols-[1fr_120px_1fr]"
                  aria-busy={viacep.status === "loading"}
                >
                  <TextField
                    id="street"
                    type="text"
                    label="Rua"
                    required
                    autoComplete="address-line1"
                    placeholder="Rua das Águas"
                    error={visibleError("address.street")}
                    {...register("address.street")}
                  />
                  <TextField
                    id="number"
                    type="text"
                    label="Número"
                    required
                    autoComplete="address-line2"
                    placeholder="123"
                    error={visibleError("address.number")}
                    {...register("address.number")}
                  />
                  <TextField
                    id="complement"
                    type="text"
                    label="Complemento"
                    autoComplete="off"
                    placeholder="Apto, bloco, referência"
                    error={visibleError("address.complement")}
                    {...register("address.complement")}
                  />
                </div>

                <div
                  className="grid gap-5 sm:grid-cols-2"
                  aria-busy={viacep.status === "loading"}
                >
                  <TextField
                    id="neighborhood"
                    type="text"
                    label="Bairro"
                    required
                    autoComplete="address-level3"
                    placeholder="Centro"
                    error={visibleError("address.neighborhood")}
                    {...register("address.neighborhood")}
                  />
                  <TextField
                    id="city"
                    type="text"
                    label="Cidade"
                    required
                    autoComplete="address-level2"
                    placeholder="São Paulo"
                    error={visibleError("address.city")}
                    {...register("address.city")}
                  />
                </div>
              </FormSection>
            </div>
          ) : null}
        </WizardShell>
      </form>
    </div>
  );
}
