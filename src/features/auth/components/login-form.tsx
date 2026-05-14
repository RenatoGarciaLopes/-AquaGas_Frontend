"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Eye, LogIn, EyeOff } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";

import { cn } from "@/shared/lib/cn";

import { postLogin } from "@/features/auth/api/post-login";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import {
  loginSchema,
  type LoginSchema,
} from "@/features/auth/schemas/login-schema";

type LoginFormProps = {
  sessionExpired?: boolean;
};

export function LoginForm({ sessionExpired = false }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const router = useRouter();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userName: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setRequestError(null);

    try {
      const response = await postLogin(data);
      setAccessToken(response.accessToken);
      router.push("/funcionarios");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Não foi possível autenticar.";
      setRequestError(message);
    }
  });

  return (
    <section className="flex min-h-screen items-center justify-center bg-[var(--aquagas-panel)] px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-[var(--aquagas-panel-border)] bg-[#0b2442]/70 p-8 shadow-[0_24px_48px_rgba(0,0,0,0.35)] backdrop-blur">
        <header className="mb-7">
          <h2 className="text-4xl font-semibold text-white">Entrar</h2>
          <p className="mt-2 text-sm text-[var(--aquagas-muted)]">
            Acesse o painel de gestão
          </p>
        </header>

        {sessionExpired ? (
          <p className="mb-4 rounded-md border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-sm text-amber-200">
            Sua sessão expirou. Faça login novamente.
          </p>
        ) : null}

        {requestError ? (
          <p
            role="alert"
            aria-live="polite"
            className="mb-4 rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200"
          >
            {requestError}
          </p>
        ) : null}

        <form
          className="space-y-5"
          method="post"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void onSubmit(e);
          }}
        >
          <label htmlFor="userName" className="block space-y-2">
            <span className="text-xs font-semibold tracking-[0.2em] text-[var(--aquagas-muted)] uppercase">
              Nome de usuário
            </span>
            <input
              id="userName"
              type="text"
              placeholder="usuario.gerente"
              className={cn(
                "w-full rounded-xl border bg-[var(--aquagas-input)] px-4 py-3 text-base text-white transition outline-none",
                "placeholder:text-slate-300/50 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/30",
                errors.userName
                  ? "border-red-300/70"
                  : "border-[var(--aquagas-input-border)]",
              )}
              {...register("userName")}
            />
            {errors.userName ? (
              <span className="text-xs text-red-200">
                {errors.userName.message}
              </span>
            ) : null}
          </label>

          <label htmlFor="password" className="block space-y-2">
            <span className="text-xs font-semibold tracking-[0.2em] text-[var(--aquagas-muted)] uppercase">
              Senha
            </span>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={cn(
                  "w-full rounded-xl border bg-[var(--aquagas-input)] px-4 py-3 pr-12 text-base text-white transition outline-none",
                  "placeholder:text-slate-300/50 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-400/30",
                  errors.password
                    ? "border-red-300/70"
                    : "border-[var(--aquagas-input-border)]",
                )}
                {...register("password")}
              />
              <button
                type="button"
                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-300 transition hover:text-white"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={
                  showPassword
                    ? "Ocultar senha digitada"
                    : "Mostrar senha digitada"
                }
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password ? (
              <span className="text-xs text-red-200">
                {errors.password.message}
              </span>
            ) : null}
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--aquagas-primary)] px-4 py-3 text-base font-semibold text-white transition hover:bg-[var(--aquagas-primary-hover)] focus:ring-2 focus:ring-cyan-300/50 focus:ring-offset-2 focus:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
            <LogIn className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-[var(--aquagas-muted)]">
          Dica: inclua “gerente” no usuário para entrar como GERENTE
        </p>
      </div>
    </section>
  );
}
