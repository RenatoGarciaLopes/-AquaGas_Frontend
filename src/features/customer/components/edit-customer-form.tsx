"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useForm,
  useWatch,
  type FieldPath,
  type UseFormRegisterReturn,
} from "react-hook-form";
import {
  useRef,
  useMemo,
  useState,
  useEffect,
  useCallback,
  type MouseEvent,
  type ChangeEvent,
} from "react";

import { useViaCepLookup } from "@/shared/hooks/use-viacep-lookup";
import { useUpdateCustomer } from "@/features/customer/hooks/use-update-customer";

import { Icons } from "@/shared/lib/icons";
import { onlyDigits } from "@/shared/lib/formatters";
import { applyBackendErrors } from "@/shared/lib/errors";
import { maskCep, maskPhone, maskCustomerDocument } from "@/shared/lib/masks";

import { ApiError } from "@/shared/api/errors";
import { TextField } from "@/shared/ui/form-field";
import { FormSection } from "@/shared/ui/form-section";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { SettingsShell } from "@/shared/layouts/settings-shell";

import { parseCustomerError } from "@/features/customer/lib/customer-errors";
import { CustomerDocumentTypeSelector } from "@/features/customer/components/customer-document-type-selector";
import type {
  CustomerResponse,
  UpdateCustomerInput,
  CustomerDocumentType,
} from "@/features/customer/types";
import {
  editCustomerIdentitySchema,
  type EditCustomerIdentitySchema,
  editCustomerContactAddressSchema,
  type EditCustomerContactAddressSchema,
} from "@/features/customer/schemas/edit-customer.schema";

type TabId = "identity" | "contact";
type PendingAction =
  | { type: "back" }
  | { type: "tab"; tab: TabId }
  | { type: "to-index" };

const TABS = [
  { id: "identity", label: "Identificação", icon: Icons.userCog },
  { id: "contact", label: "Contato e endereço", icon: Icons.mapPoint },
] as const;

type Props = {
  customer: CustomerResponse;
};

function resolveInitialTab(value: string | null): TabId {
  return value === "contact" ? "contact" : "identity";
}

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
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

function customerTypeFromDocument(
  customer: CustomerResponse,
): CustomerDocumentType {
  return customer.typeDocument === "PJ" ? "PJ" : "PF";
}

function formatInitialDocument(customer: CustomerResponse) {
  const type = customerTypeFromDocument(customer);
  return maskCustomerDocument(customer.document, type);
}

function toIdentityPayload(
  data: EditCustomerIdentitySchema,
): UpdateCustomerInput {
  return {
    document: onlyDigits(data.document),
    name: normalizeName(data.name),
  };
}

function toContactPayload(
  data: EditCustomerContactAddressSchema,
  addressId: string | null,
): UpdateCustomerInput {
  const payload: UpdateCustomerInput = {
    email: data.email.trim().toLowerCase(),
    phone: onlyDigits(data.phone),
  };

  if (addressId && data.address) {
    payload.address = {
      addressId,
      cep: onlyDigits(data.address.cep),
      city: data.address.city.trim(),
      complement: data.address.complement?.trim() || null,
      neighborhood: data.address.neighborhood.trim(),
      number: data.address.number.trim(),
      street: data.address.street.trim(),
    };
  }

  return payload;
}

export function EditCustomerForm({ customer }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<TabId>(() =>
    resolveInitialTab(initialTabParam),
  );
  // Em mobile: o índice de seções é o estado inicial (a menos que a URL traga
  // ?tab=... — por exemplo, vindo de um deeplink). Em lg+ esse estado é
  // ignorado (CSS controla a renderização).
  const [mobileIndexOpen, setMobileIndexOpen] = useState<boolean>(
    () => initialTabParam === null,
  );
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );

  const dirtyRef = useRef<Record<TabId, boolean>>({
    contact: false,
    identity: false,
  });

  const hasUnsavedChanges = useCallback(
    () => Object.values(dirtyRef.current).some(Boolean),
    [],
  );

  useEffect(() => {
    function onBeforeUnload(event: BeforeUnloadEvent) {
      if (!hasUnsavedChanges()) return;
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleIdentityDirty = useCallback((dirty: boolean) => {
    dirtyRef.current.identity = dirty;
  }, []);

  const handleContactDirty = useCallback((dirty: boolean) => {
    dirtyRef.current.contact = dirty;
  }, []);

  function handleTabChange(next: string) {
    const nextTab = next as TabId;
    // Em mobile, clicar em uma seção fecha o índice e abre o conteúdo.
    if (mobileIndexOpen) setMobileIndexOpen(false);

    if (nextTab === activeTab) return;

    if (dirtyRef.current[activeTab]) {
      setPendingAction({ tab: nextTab, type: "tab" });
      return;
    }

    setActiveTab(nextTab);
  }

  function handleBackToIndex() {
    if (dirtyRef.current[activeTab]) {
      setPendingAction({ type: "to-index" });
      return;
    }
    setMobileIndexOpen(true);
  }

  function handleBackClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!hasUnsavedChanges()) return;
    event.preventDefault();
    setPendingAction({ type: "back" });
  }

  function confirmDiscard() {
    if (pendingAction?.type === "tab") {
      dirtyRef.current[activeTab] = false;
      setActiveTab(pendingAction.tab);
      setPendingAction(null);
      return;
    }

    if (pendingAction?.type === "to-index") {
      dirtyRef.current[activeTab] = false;
      setMobileIndexOpen(true);
      setPendingAction(null);
      return;
    }

    if (pendingAction?.type === "back") {
      setPendingAction(null);
      router.push("/customers");
    }
  }

  return (
    <>
      <SettingsShell
        ariaLabel="Seções de edição do cliente"
        tabs={[...TABS]}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        mobileIndex={{
          showIndex: mobileIndexOpen,
          onBackToIndex: handleBackToIndex,
          heading: "O que deseja editar?",
          description: `${customer.name}${
            customer.typeDocument === "PJ" ? " · CNPJ" : " · CPF"
          }`,
        }}
        back={
          <Link
            href="/customers"
            onClick={handleBackClick}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition"
          >
            <Icon icon={Icons.chevronLeft} className="h-4 w-4" aria-hidden />
            Voltar para clientes
          </Link>
        }
      >
        {activeTab === "identity" ? (
          <EditCustomerIdentitySection
            key={`identity-${customer.id}-${customer.document}`}
            customer={customer}
            onDirtyChange={handleIdentityDirty}
          />
        ) : null}

        {activeTab === "contact" ? (
          <EditCustomerContactAddressSection
            key={`contact-${customer.id}-${customer.address?.id ?? "no-address"}`}
            customer={customer}
            onDirtyChange={handleContactDirty}
          />
        ) : null}
      </SettingsShell>

      <ConfirmDialog
        open={pendingAction !== null}
        variant="danger"
        title="Descartar alterações?"
        description="Você tem alterações não salvas nesta seção. Se continuar, elas serão perdidas."
        confirmLabel="Descartar"
        cancelLabel="Continuar editando"
        onConfirm={confirmDiscard}
        onCancel={() => setPendingAction(null)}
      />
    </>
  );
}

type SectionProps = {
  customer: CustomerResponse;
  onDirtyChange?: (dirty: boolean) => void;
};

function EditCustomerIdentitySection({
  customer,
  onDirtyChange,
}: SectionProps) {
  const router = useRouter();
  const updateCustomer = useUpdateCustomer(customer.id);
  const [requestError, setRequestError] = useState<string | null>(null);

  const defaults = useMemo<EditCustomerIdentitySchema>(
    () => ({
      document: formatInitialDocument(customer),
      name: customer.name ?? "",
      type: customerTypeFromDocument(customer),
    }),
    [customer],
  );

  const form = useForm<EditCustomerIdentitySchema>({
    resolver: zodResolver(editCustomerIdentitySchema),
    mode: "onTouched",
    defaultValues: defaults,
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = form;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const selectedType = useWatch({ control, name: "type" });
  const documentRegister = register("document");

  function updateType(type: EditCustomerIdentitySchema["type"]) {
    setValue("type", type, { shouldDirty: true, shouldValidate: true });
    setValue(
      "document",
      maskCustomerDocument(form.getValues("document"), type),
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  }

  const onSubmit = handleSubmit(async (data) => {
    setRequestError(null);

    try {
      await updateCustomer.mutateAsync(toIdentityPayload(data));
      reset({
        ...data,
        document: maskCustomerDocument(data.document, data.type),
        name: normalizeName(data.name),
      });
      router.refresh();
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 0;
      const { fieldErrors, message } = parseCustomerError(error, status);

      applyBackendErrors(form, fieldErrors);

      if (status === 409 && !fieldErrors.document) {
        form.setError("document", { message });
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
      id="tabpanel-identity"
      role="tabpanel"
      aria-labelledby="tab-identity"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit(event);
      }}
      className="space-y-6"
    >
      <header>
        <h2 className="text-foreground text-xl font-semibold tracking-tight">
          Identificação
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Atualize nome e documento fiscal do cliente.
        </p>
      </header>

      {requestError ? <RequestError message={requestError} /> : null}

      <div className="space-y-5">
        <CustomerDocumentTypeSelector
          required
          value={selectedType}
          onChange={updateType}
          error={errors.type?.message}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="edit-customer-name"
            type="text"
            label="Nome"
            required
            autoComplete="name"
            placeholder="Ex.: Maria Silva"
            error={errors.name?.message}
            {...register("name")}
          />
          <TextField
            id="edit-customer-document"
            type="text"
            label={selectedType === "PJ" ? "CNPJ" : "CPF"}
            required
            inputMode="numeric"
            autoComplete="off"
            placeholder={
              selectedType === "PJ" ? "00.000.000/0000-00" : "000.000.000-00"
            }
            error={errors.document?.message}
            {...maskedRegister(documentRegister, (value) =>
              maskCustomerDocument(value, selectedType),
            )}
          />
        </div>
      </div>

      <EditFooter
        isDirty={isDirty}
        isSubmitting={isSubmitting || updateCustomer.isPending}
        onDiscard={() => reset(defaults)}
      />
    </form>
  );
}

function EditCustomerContactAddressSection({
  customer,
  onDirtyChange,
}: SectionProps) {
  const router = useRouter();
  const updateCustomer = useUpdateCustomer(customer.id);
  const viacep = useViaCepLookup();
  const [requestError, setRequestError] = useState<string | null>(null);
  const addressId = customer.address?.id ?? null;

  const defaults = useMemo<EditCustomerContactAddressSchema>(() => {
    const base = {
      email: customer.email ?? "",
      phone: maskPhone(customer.phone ?? ""),
    };

    if (!customer.address) return base;

    return {
      ...base,
      address: {
        cep: maskCep(customer.address.cep ?? ""),
        city: customer.address.city ?? "",
        complement: customer.address.complement ?? "",
        neighborhood: customer.address.neighborhood ?? "",
        number: customer.address.number ?? "",
        street: customer.address.street ?? "",
      },
    };
  }, [customer]);

  const form = useForm<EditCustomerContactAddressSchema>({
    resolver: zodResolver(editCustomerContactAddressSchema),
    mode: "onTouched",
    defaultValues: defaults,
  });

  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    clearErrors,
    setError,
    reset,
    getValues,
    formState,
  } = form;
  const { dirtyFields, errors, isDirty, isSubmitting } = formState;

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  const phoneRegister = register("phone");
  const cepRegister = register(
    "address.cep" as FieldPath<EditCustomerContactAddressSchema>,
  );

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
      const isFieldDirty = Boolean(dirtyFields.address?.[key]);
      const hasValue = Boolean(current?.[key]?.trim());
      if (isFieldDirty && hasValue) return;
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
      await updateCustomer.mutateAsync(toContactPayload(data, addressId));
      reset(data);
      router.refresh();
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 0;
      const { fieldErrors, message } = parseCustomerError(error, status);

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
      id="tabpanel-contact"
      role="tabpanel"
      aria-labelledby="tab-contact"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit(event);
      }}
      className="space-y-6"
    >
      <header>
        <h2 className="text-foreground text-xl font-semibold tracking-tight">
          Contato e endereço
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Atualize os canais de contato e o endereço principal.
        </p>
      </header>

      {requestError ? <RequestError message={requestError} /> : null}

      <FormSection
        title="Contato"
        description="Como falaremos com este cliente."
        icon={Icons.phone}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            id="edit-customer-email"
            type="email"
            label="Email"
            required
            autoComplete="email"
            placeholder="cliente@email.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <TextField
            id="edit-customer-phone"
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
      </FormSection>

      {addressId ? (
        <FormSection
          title="Endereço"
          description="Informe o CEP para preenchermos rua, bairro e cidade automaticamente."
          icon={Icons.mapPoint}
        >
          <div className="grid gap-5 sm:grid-cols-[200px_1fr]">
            <div className="relative">
              <TextField
                id="edit-customer-cep"
                type="text"
                label="CEP"
                required
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="00000-000"
                error={errors.address?.cep?.message}
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
              id="edit-customer-street"
              type="text"
              label="Rua"
              required
              autoComplete="address-line1"
              placeholder="Rua das Águas"
              error={errors.address?.street?.message}
              {...register("address.street")}
            />
            <TextField
              id="edit-customer-number"
              type="text"
              label="Número"
              required
              autoComplete="address-line2"
              placeholder="123"
              error={errors.address?.number?.message}
              {...register("address.number")}
            />
            <TextField
              id="edit-customer-complement"
              type="text"
              label="Complemento"
              autoComplete="off"
              placeholder="Apto, bloco, referência"
              error={errors.address?.complement?.message}
              {...register("address.complement")}
            />
          </div>

          <div
            className="grid gap-5 sm:grid-cols-2"
            aria-busy={viacep.status === "loading"}
          >
            <TextField
              id="edit-customer-neighborhood"
              type="text"
              label="Bairro"
              required
              autoComplete="address-level3"
              placeholder="Centro"
              error={errors.address?.neighborhood?.message}
              {...register("address.neighborhood")}
            />
            <TextField
              id="edit-customer-city"
              type="text"
              label="Cidade"
              required
              autoComplete="address-level2"
              placeholder="São Paulo"
              error={errors.address?.city?.message}
              {...register("address.city")}
            />
          </div>
        </FormSection>
      ) : (
        <p
          role="status"
          className="rounded-lg border border-amber-300/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
        >
          Este cliente não possui endereço principal retornado pelo backend.
          Salve apenas os dados de contato ou recadastre o endereço quando essa
          operação estiver disponível.
        </p>
      )}

      <EditFooter
        isDirty={isDirty}
        isSubmitting={isSubmitting || updateCustomer.isPending}
        onDiscard={() => reset(defaults)}
      />
    </form>
  );
}

function RequestError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      aria-live="polite"
      className="rounded-lg border border-red-500/35 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-300/40 dark:bg-red-500/10 dark:text-red-100"
    >
      {message}
    </p>
  );
}

function EditFooter({
  isDirty,
  isSubmitting,
  onDiscard,
}: {
  isDirty: boolean;
  isSubmitting: boolean;
  onDiscard: () => void;
}) {
  return (
    <footer className="border-border flex items-center justify-end gap-3 border-t pt-6">
      <button
        type="button"
        onClick={onDiscard}
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
  );
}
