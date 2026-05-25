import Link from "next/link";
import { Icon } from "@iconify/react";
import { notFound, redirect } from "next/navigation";

import { Icons } from "@/shared/lib/icons";
import { formatCpf, formatDate, formatPhone } from "@/shared/lib/formatters";

import { ApiError } from "@/shared/api/errors";
import { isGerente } from "@/shared/auth/roles";
import { PageHeader } from "@/shared/ui/page-header";
import { ErrorState } from "@/shared/ui/error-state";
import { getCurrentUserRole } from "@/shared/auth/server";

import { getEmployeeById } from "@/features/employee/api/employee.api";
import { EmployeeStatusBadge } from "@/features/employee/components/employee-status-badge";
import { EmployeeDetailActions } from "@/features/employee/components/employee-detail-actions";

type EmployeeDetailPageProps = {
  params: Promise<{ id: string }>;
};

const FALLBACK = "Não informado";

function display(value: null | string | undefined) {
  return value?.trim() ? value : FALLBACK;
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <dt className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        {label}
      </dt>
      <dd className="text-foreground mt-2 text-sm font-medium">{value}</dd>
    </div>
  );
}

export default async function EmployeeDetailPage({
  params,
}: EmployeeDetailPageProps) {
  const { id } = await params;
  const role = await getCurrentUserRole();
  const canManage = isGerente(role);

  let employeeWithUser;
  try {
    employeeWithUser = await getEmployeeById(id);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 401) redirect("/login?expired=1");
      if (error.status === 404) notFound();
      if (error.status === 403) {
        return (
          <main className="space-y-6 p-4 sm:p-6 lg:p-8">
            <ErrorState
              title="Sem permissão"
              description="Você não possui acesso aos dados deste funcionário."
            />
          </main>
        );
      }
      if (error.status >= 500) {
        return (
          <main className="space-y-6 p-4 sm:p-6 lg:p-8">
            <ErrorState
              title="Erro ao carregar funcionário"
              description={error.message || "Tente novamente em instantes."}
              action={
                <Link
                  href={`/employees/${id}`}
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

  const { employee } = employeeWithUser;

  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <Link
        href="/employees"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition"
      >
        <Icon icon={Icons.chevronLeft} aria-hidden className="h-4 w-4" />
        Voltar para funcionários
      </Link>

      <PageHeader
        title={display(employee.name)}
        description="Detalhes cadastrais e status do funcionário."
        actions={
          canManage ? (
            <EmployeeDetailActions
              employeeId={employee.id}
              employeeName={display(employee.name)}
              isActive={employee.isActive}
            />
          ) : null
        }
      />

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-xl sm:p-6">
        <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-foreground text-lg font-semibold">
              Informações do funcionário
            </h2>
            <p className="text-muted-foreground text-sm">
              Dados retornados pelo cadastro do backend.
            </p>
          </div>
          <EmployeeStatusBadge isActive={employee.isActive} />
        </div>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem label="Nome completo" value={display(employee.name)} />
          <DetailItem
            label="CPF"
            value={<span className="font-mono">{formatCpf(employee.cpf)}</span>}
          />
          <DetailItem label="Telefone" value={formatPhone(employee.phone)} />
          <DetailItem label="Email" value={display(employee.email)} />
          <DetailItem
            label="Status"
            value={<EmployeeStatusBadge isActive={employee.isActive} />}
          />
          <DetailItem
            label="Criado em"
            value={formatDate(employee.createdAt)}
          />
        </dl>
      </section>
    </main>
  );
}
