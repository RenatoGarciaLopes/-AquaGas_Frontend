import Link from "next/link";

import { isGerente } from "@/shared/auth/roles";
import { ErrorState } from "@/shared/ui/error-state";
import { getCurrentUserRole } from "@/shared/auth/server";

import { CreateEmployeeForm } from "@/features/employee/components/create-employee-form";

export default async function NewEmployeePage() {
  const role = await getCurrentUserRole();

  if (!isGerente(role)) {
    return (
      <main className="space-y-6 p-4 sm:p-6 lg:p-8">
        <ErrorState
          title="Sem permissão"
          description="Apenas gerentes podem cadastrar funcionários."
        />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      <header className="space-y-1">
        <Link
          href="/employees"
          className="text-muted-foreground hover:text-foreground text-sm font-medium transition"
        >
          Funcionários
        </Link>
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">
          Criar funcionário
        </h1>
        <p className="text-muted-foreground text-sm">
          Cadastre o acesso e os dados obrigatórios do novo funcionário.
        </p>
      </header>

      <CreateEmployeeForm />
    </main>
  );
}
