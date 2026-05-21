"use client";

import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Save } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

import { cn } from "@/shared/lib/cn";
import { onlyDigits } from "@/shared/lib/formatters";
import { ApiError, applyBackendErrors } from "@/shared/api/errors";

import { createFuncionario } from "@/features/funcionario/api/create-funcionario";
import {
  createFuncionarioSchema,
  getPasswordStrength,
  type CreateFuncionarioSchema,
} from "@/features/funcionario/schemas/create-funcionario-schema";

function maskCpf(value: string) {
  return onlyDigits(value)
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskPhone(value: string) {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }

  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

function PasswordStrength({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  const width = `${(strength.score / 5) * 100}%`;
  const color =
    strength.score <= 2
      ? "bg-red-400"
      : strength.score <= 4
        ? "bg-amber-300"
        : "bg-emerald-300";

  return (
    <div className="space-y-2" aria-live="polite">
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width }} />
      </div>
      <p className="text-xs text-[var(--aquagas-muted)]">
        Força da senha: <span className="font-semibold text-white">{strength.label}</span>
      </p>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <span role="alert" className="text-xs text-red-200">
      {message}
    </span>
  );
}

const inputClassName =
  "w-full rounded-xl border bg-[var(--aquagas-input)] px-4 py-3 text-base text-white transition outline-none placeholder:text-slate-300/50 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/30";

export function CreateFuncionarioForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const {
    handleSubmit,
    register,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateFuncionarioSchema>({
    defaultValues: {
      cpf: "",
      email: "",
      name: "",
      password: "",
      phone: "",
      role: "Funcionario",
      userName: "",
    },
    resolver: zodResolver(createFuncionarioSchema),
  });
  const password = watch("password");

  const onSubmit = handleSubmit(async (data) => {
    try {
      const payload = createFuncionarioSchema.parse(data);
      await createFuncionario(payload);

      toast.success("Funcionário criado com sucesso");
      router.push("/funcionarios");
      router.refresh();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          router.push("/login?expired=1");
          return;
        }

        if (error.status === 403) {
          toast.error("Sem permissão");
          return;
        }

        if ([400, 409].includes(error.status)) {
          const applied = applyBackendErrors<CreateFuncionarioSchema>(
            error.fieldErrors,
            setError,
            {
              usuario: "userName",
              user_name: "userName",
              username: "userName",
            },
          );

          if (applied) {
            return;
          }
        }
      }

      toast.error("Erro ao criar funcionário");
    }
  });

  return (
    <form
      className="space-y-6"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit(event);
      }}
    >
      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-black/10 sm:p-6">
        <h2 className="text-lg font-semibold text-white">Dados pessoais</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label htmlFor="name" className="block space-y-2">
            <span className="text-xs font-semibold tracking-[0.2em] text-[var(--aquagas-muted)] uppercase">
              Nome completo
            </span>
            <input
              id="name"
              type="text"
              placeholder="Gustavo Sossai"
              className={cn(inputClassName, errors.name ? "border-red-300/70" : "border-[var(--aquagas-input-border)]")}
              aria-invalid={Boolean(errors.name)}
              {...register("name")}
            />
            <FieldError message={errors.name?.message} />
          </label>

          <label htmlFor="cpf" className="block space-y-2">
            <span className="text-xs font-semibold tracking-[0.2em] text-[var(--aquagas-muted)] uppercase">
              CPF
            </span>
            <input
              id="cpf"
              type="text"
              inputMode="numeric"
              placeholder="000.000.000-00"
              maxLength={14}
              className={cn(inputClassName, errors.cpf ? "border-red-300/70" : "border-[var(--aquagas-input-border)]")}
              aria-invalid={Boolean(errors.cpf)}
              {...register("cpf", {
                onChange: (event) => {
                  setValue("cpf", maskCpf(event.target.value), { shouldValidate: true });
                },
              })}
            />
            <FieldError message={errors.cpf?.message} />
          </label>

          <label htmlFor="phone" className="block space-y-2">
            <span className="text-xs font-semibold tracking-[0.2em] text-[var(--aquagas-muted)] uppercase">
              Telefone
            </span>
            <input
              id="phone"
              type="text"
              inputMode="numeric"
              placeholder="(44) 99999-9999"
              maxLength={15}
              className={cn(inputClassName, errors.phone ? "border-red-300/70" : "border-[var(--aquagas-input-border)]")}
              aria-invalid={Boolean(errors.phone)}
              {...register("phone", {
                onChange: (event) => {
                  setValue("phone", maskPhone(event.target.value), { shouldValidate: true });
                },
              })}
            />
            <FieldError message={errors.phone?.message} />
          </label>

          <label htmlFor="email" className="block space-y-2">
            <span className="text-xs font-semibold tracking-[0.2em] text-[var(--aquagas-muted)] uppercase">
              Email
            </span>
            <input
              id="email"
              type="email"
              placeholder="gustavo@email.com"
              className={cn(inputClassName, errors.email ? "border-red-300/70" : "border-[var(--aquagas-input-border)]")}
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />
            <FieldError message={errors.email?.message} />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-xl shadow-black/10 sm:p-6">
        <h2 className="text-lg font-semibold text-white">Acesso</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <label htmlFor="userName" className="block space-y-2">
            <span className="text-xs font-semibold tracking-[0.2em] text-[var(--aquagas-muted)] uppercase">
              Usuário
            </span>
            <input
              id="userName"
              type="text"
              placeholder="gustavo.sossai"
              className={cn(inputClassName, errors.userName ? "border-red-300/70" : "border-[var(--aquagas-input-border)]")}
              aria-invalid={Boolean(errors.userName)}
              {...register("userName")}
            />
            <FieldError message={errors.userName?.message} />
          </label>

          <label htmlFor="role" className="block space-y-2">
            <span className="text-xs font-semibold tracking-[0.2em] text-[var(--aquagas-muted)] uppercase">
              Cargo
            </span>
            <select
              id="role"
              className={cn(inputClassName, errors.role ? "border-red-300/70" : "border-[var(--aquagas-input-border)]")}
              aria-invalid={Boolean(errors.role)}
              {...register("role")}
            >
              <option value="Funcionario">Funcionário</option>
              <option value="Gerente">Gerente</option>
            </select>
            <FieldError message={errors.role?.message} />
          </label>

          <label htmlFor="password" className="block space-y-2 md:col-span-2">
            <span className="text-xs font-semibold tracking-[0.2em] text-[var(--aquagas-muted)] uppercase">
              Senha
            </span>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Senha@123"
                className={cn(
                  inputClassName,
                  "pr-12",
                  errors.password ? "border-red-300/70" : "border-[var(--aquagas-input-border)]",
                )}
                aria-invalid={Boolean(errors.password)}
                {...register("password")}
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-300 transition hover:text-white focus:ring-2 focus:ring-cyan-300/40 focus:outline-none"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Ocultar senha digitada" : "Mostrar senha digitada"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <PasswordStrength password={password} />
            <FieldError message={errors.password?.message} />
          </label>
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href="/funcionarios"
          className="inline-flex items-center justify-center rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus:ring-2 focus:ring-cyan-300/50 focus:outline-none"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--aquagas-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--aquagas-primary-hover)] focus:ring-2 focus:ring-cyan-300/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Save className="h-4 w-4" aria-hidden />}
          {isSubmitting ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
