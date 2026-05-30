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
import { digitsOnly, maskCpf, maskPhone } from "@/shared/lib/masks";

import { FormField, TextField } from "@/shared/ui/form-field";

import type { RegisterEmployeeInput } from "@/features/employee/types";
import { parseCreateEmployeeError } from "@/features/employee/lib/employee-errors";
import { PasswordStrength } from "@/features/employee/components/password-strength";
import {
  createEmployeeSchema,
  type CreateEmployeeSchema,
} from "@/features/employee/schemas/create-employee.schema";

const ROLE_OPTIONS = [
  { label: "Gerente", value: "Manager" },
  { label: "Funcionário", value: "Employee" },
] as const;

function toPayload(data: CreateEmployeeSchema): RegisterEmployeeInput {
  return {
    user: {
      userName: data.userName,
      password: data.password,
      role: data.role,
    },
    employee: {
      name: data.name,
      cpf: data.cpf,
      email: data.email,
      phone: data.phone,
    },
  };
}

export function CreateEmployeeForm() {
  const router = useRouter();

  const form = useForm<CreateEmployeeSchema>({
    resolver: zodResolver(createEmployeeSchema),
    mode: "onTouched",
    defaultValues: {
      userName: "",
      password: "",
      role: "Employee",
      name: "",
      cpf: "",
      phone: "",
      email: "",
    },
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
      response = await fetch("/api/employees", {
        body: JSON.stringify(toPayload(data)),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
    } catch {
      toast.error("Erro ao criar funcionário");
      return;
    }

    if (response.ok) {
      toast.success("Funcionário criado com sucesso");
      router.push("/employees");
      router.refresh();
      return;
    }

    if (response.status === 401) {
      router.push("/login?expired=1");
      return;
    }

    const payload = await response.json().catch(() => null);
    const { fieldErrors, message } = parseCreateEmployeeError(
      payload,
      response.status,
    );

    applyBackendErrors(form, fieldErrors);

    if (response.status >= 500) {
      toast.error("Erro ao criar funcionário");
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
              Defina o usuário, senha e cargo do novo funcionário.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              id="userName"
              type="text"
              label="Usuário"
              required
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
                    event.target.value as CreateEmployeeSchema["role"],
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
              label="Senha"
              required
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              error={errors.password?.message}
              {...register("password")}
            />
            <PasswordStrength value={password} />
          </div>
        </section>

        <section className="space-y-5 border-t border-white/10 pt-8">
          <div>
            <h2 className="text-foreground text-lg font-semibold">
              Dados do funcionário
            </h2>
            <p className="text-muted-foreground text-sm">
              CPF e email são validados novamente pelo backend para garantir
              unicidade.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <TextField
              id="name"
              type="text"
              label="Nome completo"
              required
              autoComplete="name"
              placeholder="Ex.: Gustavo Sossai"
              error={errors.name?.message}
              {...register("name")}
            />

            <TextField
              id="cpf"
              type="text"
              label="CPF"
              required
              inputMode="numeric"
              autoComplete="off"
              placeholder="000.000.000-00"
              maxLength={14}
              error={errors.cpf?.message}
              {...register("cpf", {
                onChange: (event) => {
                  const masked = maskCpf(event.target.value);
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
              required
              inputMode="tel"
              autoComplete="tel"
              placeholder="(44) 99999-9999"
              maxLength={15}
              error={errors.phone?.message}
              {...register("phone", {
                onChange: (event) => {
                  const masked = maskPhone(event.target.value);
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
              required
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
          href="/employees"
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
