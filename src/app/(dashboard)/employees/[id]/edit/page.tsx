import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ApiError } from "@/shared/api/errors";
import { isGerente } from "@/shared/auth/roles";
import { ErrorState } from "@/shared/ui/error-state";
import { maskCpfInput, maskPhoneInput } from "@/shared/lib/masks";
import { getCurrentUserRole } from "@/shared/auth/server";

import { getEmployeeById } from "@/features/employee/api/employee.api";
import { EditEmployeeForm } from "@/features/employee/components/edit-employee-form";
import type { EditEmployeeSchema } from "@/features/employee/schemas/edit-employee.schema";

type EditEmployeePageProps = {
  params: Promise<{ id: string }>;
};

function toEditableRole(role: string): EditEmployeeSchema["role"] {
  const upper = role.trim().toUpperCase();
  return upper === "MANAGER" || upper === "GERENTE" ? "Manager" : "Employee";
}

export default async function EditEmployeePage({
  params,
}: EditEmployeePageProps) {
  const { id } = await params;
  const role = await getCurrentUserRole();

  if (!isGerente(role)) {
    return (
      <main className="space-y-6 p-4 sm:p-6 lg:p-8">
        <ErrorState
          title="Sem permissão"
          description="Apenas gerentes podem editar funcionários."
        />
      </main>
    );
  }

  let employeeWithUser;
  try {
    employeeWithUser = await getEmployeeById(id);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) redirect("/login?expired=1");
      if (error.status === 404) notFound();
      if (error.status >= 500) {
        return (
          <main className="space-y-6 p-4 sm:p-6 lg:p-8">
            <ErrorState
              title="Erro ao carregar funcionário"
              description={error.message || "Tente novamente em instantes."}
              action={
                <Link
                  href={`/employees/${id}/edit`}
                  className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-200 focus:ring-2 focus:ring-white/60 focus:outline-none"
                >
                  Tentar novamente
                </Link>
              }
            />
          </main>
        );
      }
    }

    throw error;
  }

  const { employee, user } = employeeWithUser;
  const defaultValues: EditEmployeeSchema = {
    userName: user.userName,
    password: "",
    role: toEditableRole(user.role),
    name: employee.name,
    cpf: maskCpfInput(employee.cpf),
    phone: employee.phone ? maskPhoneInput(employee.phone) : "",
    email: employee.email ?? "",
  };

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 p-4 sm:p-6 lg:p-8">
      <header className="space-y-1">
        <Link
          href={`/employees/${id}`}
          className="text-muted-foreground hover:text-foreground text-sm font-medium transition"
        >
          Funcionário
        </Link>
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">
          Editar funcionário
        </h1>
        <p className="text-muted-foreground text-sm">
          Atualize os dados cadastrais e de acesso do funcionário.
        </p>
      </header>

      <EditEmployeeForm employeeId={id} defaultValues={defaultValues} />
    </main>
  );
}
