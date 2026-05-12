"use client";

import { ErrorState } from "@/shared/ui/error-state";

type FuncionariosErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function FuncionariosError({
  error,
  reset,
}: FuncionariosErrorProps) {
  return (
    <main className="min-h-screen bg-[var(--background)] p-4 sm:p-6 lg:p-8">
      <ErrorState
        title="Erro ao carregar funcionários"
        description={error.message || "Ocorreu uma falha no servidor."}
        retry={reset}
      />
    </main>
  );
}
