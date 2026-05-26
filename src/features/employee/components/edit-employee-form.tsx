"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Icons } from "@/shared/lib/icons";
import { applyBackendErrors } from "@/shared/lib/errors";
import { digitsOnly, maskCpfInput, maskPhoneInput } from "@/shared/lib/masks";

import { FormField, TextField } from "@/shared/ui/form-field";

import type { UpdateEmployeeInput } from "@/features/employee/types";
import { parseEmployeeError } from "@/features/employee/lib/employee-errors";
import { PasswordStrength } from "@/features/employee/components/password-strength";
import {
  editEmployeeSchema,
  type EditEmployeeSchema,
} from "@/features/employee/schemas/edit-employee.schema";

const ROLE_OPTIONS = [
  { label: "Gerente", value: "Manager" },
  { label: "Funcionário", value: "Employee" },
] as const;

type EditEmployeeFormProps = {
  defaultValues: EditEmployeeSchema;
  employeeId: string;
};

function toPayload(data: EditEmployeeSchema): UpdateEmployeeInput {
  return {
    name: data.name,
    email: data.email.trim() || undefined,
    phone: data.phone,
    userName: data.userName,
    newPassword: data.password || undefined,
    role: data.role,
  };
}

export function EditEmployeeForm({
  defaultValues,
  employeeId,
}: EditEmployeeFormProps) {
  const router = useRouter();

  const form = useForm<EditEmployeeSchema>({
    resolver: zodResolver(editEmployeeSchema),
    mode: "onTouched",
    defaultValues,
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = form;

  const password = useWatch({ control, name: "password" }) ?? "";
  const role = useWatch({ control, name: "role" });

  const onSubmit = handleSubmit(async (data) => {
    let response: Response;

    try {
      response = await fetch(`/api/employees/${employeeId}`, {
        body: JSON.stringify(toPayload(data)),
        headers: { "Content-Type": "application/json" },
        method: "PATCH",
      });
    } catch {
      toast.error("Erro ao atualizar funcionário");
      return;
    }

    if (response.ok) {
      toast.success("Dados atualizados com sucesso");
      router.push(`/employees/${employeeId}`);
      router.refresh();
      return;
    }

    if (response.status === 401) {
      router.push("/login?expired=1");
      return;
    }

    const payload = await response.json().catch(() => null);
    const { fieldErrors, message } = parseEmployeeError(
      payload,
      response.status,
    );

    applyBackendErrors(form, fieldErrors);

    if (response.status >= 500) {
      toast.error("Erro ao atualizar funcionário");
      return;
    }

    if (Object.keys(fieldErrors).length === 0) {
      toast.error(message);
    }
  });

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit(event);
      }}
      className="rounded-2xl border border-white/10 bg-white/[0.03] shadow-xl"
    >
      <div className="space-y-8 p-5 sm:p-8">
        <section className="space-y-5">
          <div>
            <h2 className="text-foreground text-lg font-semibold">
              Acesso ao sistema
            </h2>
            <p className="text-muted-foreground text-sm">
              Atualize o usuário, cargo e senha quando necessário.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              id="userName"
              type="text"
              label="Usuário"
              autoComplete="username"
              placeholder="Ex.: gustavo123"
              error={errors.userName?.message}
              {...register("userName")}
            />

            <FormField
              htmlFor="role"
              label="Cargo"
              required
              error={errors.role?.message}
            >
              <select
                id="role"
                value={role}
                onChange={(event) =>
                  setValue(
                    "role",
                    event.target.value as EditEmployeeSchema["role"],
                    {
                      shouldDirty: true,
                      shouldValidate: true,
                    },
                  )
                }
                className="bg-muted/40 text-foreground w-full rounded-lg border-0 px-4 py-3 text-sm transition outline-none focus:ring-2 focus:ring-cyan-300/50"
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="space-y-2">
            <TextField
              id="password"
              type="password"
              label="Nova senha"
              autoComplete="new-password"
              placeholder="Deixe vazio para manter a senha atual"
              error={errors.password?.message}
              {...register("password")}
            />
            {password ? <PasswordStrength value={password} /> : null}
          </div>
        </section>

        <section className="space-y-5 border-t border-white/10 pt-8">
          <div>
            <h2 className="text-foreground text-lg font-semibold">
              Dados do funcionário
            </h2>
            <p className="text-muted-foreground text-sm">
              O CPF é exibido para conferência e não pode ser alterado.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              id="name"
              type="text"
              label="Nome completo"
              autoComplete="name"
              placeholder="Ex.: Gustavo Sossai"
              error={errors.name?.message}
              {...register("name")}
            />

            <TextField
              id="cpf"
              type="text"
              label="CPF"
              readOnly
              aria-disabled="true"
              inputMode="numeric"
              autoComplete="off"
              placeholder="000.000.000-00"
              error={errors.cpf?.message}
              className="cursor-not-allowed opacity-70"
              {...register("cpf", {
                onChange: (event) => {
                  const masked = maskCpfInput(event.target.value);
                  setValue("cpf", masked, {
                    shouldDirty: true,
                    shouldValidate: digitsOnly(masked).length === 11,
                  });
                },
              })}
            />

            <TextField
              id="phone"
              type="text"
              label="Telefone"
              inputMode="tel"
              autoComplete="tel"
              placeholder="(44) 99999-9999"
              maxLength={15}
              error={errors.phone?.message}
              {...register("phone", {
                onChange: (event) => {
                  const masked = maskPhoneInput(event.target.value);
                  setValue("phone", masked, {
                    shouldDirty: true,
                    shouldValidate: digitsOnly(masked).length >= 10,
                  });
                },
              })}
            />

            <TextField
              id="email"
              type="email"
              label="Email"
              autoComplete="email"
              placeholder="gustavo@email.com"
              error={errors.email?.message}
              {...register("email")}
            />
          </div>
        </section>
      </div>

      <footer className="flex flex-col-reverse gap-3 border-t border-white/10 p-5 sm:flex-row sm:items-center sm:justify-end sm:p-6">
        <Link
          href={`/employees/${employeeId}`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition"
        >
          <Icon icon={Icons.chevronLeft} className="h-4 w-4" aria-hidden />
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 focus:ring-2 focus:ring-cyan-300/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Icon icon={Icons.check} className="h-4 w-4" aria-hidden />
          )}
          {isSubmitting ? "Salvando..." : "Salvar"}
        </button>
      </footer>
    </form>
  );
}
