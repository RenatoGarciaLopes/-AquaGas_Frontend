"use client";

import { ErrorState } from "@/shared/ui/error-state";

type CustomersErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function CustomersError({ error, reset }: CustomersErrorProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] p-4 sm:p-6 lg:p-8">
      <ErrorState
        title="Erro ao carregar clientes"
        description={error.message || "Ocorreu uma falha no servidor."}
        retry={reset}
      />
    </div>
  );
}
