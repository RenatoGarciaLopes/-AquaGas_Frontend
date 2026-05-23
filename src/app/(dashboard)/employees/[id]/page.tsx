import Link from "next/link";
import { Icon } from "@iconify/react";
import { notFound, redirect } from "next/navigation";

import { Icons } from "@/shared/lib/icons";
import {
  formatCpf,
  formatDate,
  onlyDigits,
  formatPhone,
} from "@/shared/lib/formatters";

import { ApiError } from "@/shared/api/errors";
import { ErrorState } from "@/shared/ui/error-state";
import { PageHeader } from "@/shared/ui/page-header";
import { isGerente, getCurrentUserRole } from "@/shared/auth/roles";

import { getEmployeeById } from "@/features/employee/api/employee.api";
import type { EmployeeDetail, EmployeeStatus } from "@/features/employee/types";
import { DeactivateEmployeeDialog } from "@/features/employee/components/deactivate-employee-dialog";

type EmployeeDetailPageProps = {
  params: Promise<{ id: string }>;
};

const FALLBACK = "Não informado";

function displayCpf(value: string | null | undefined) {
  return onlyDigits(value).length === 11 ? formatCpf(value) : FALLBACK;
}

function displayPhone(value: string | null | undefined) {
  const digits = onlyDigits(value);
  return digits.length === 10 || digits.length === 11
    ? formatPhone(value)
    : FALLBACK;
}

function displayDate(value: string | null | undefined) {
  const formatted = formatDate(value);
  return formatted === "-" ? FALLBACK : formatted;
}

function StatusBadge({ status }: { status: EmployeeStatus }) {
  if (status === "ATIVO") {
    return (
      <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
        ATIVO
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-xs font-semibold text-zinc-500">
      INATIVO
    </span>
  );
}

function DetailItem({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="border-border bg-muted/20 rounded-xl border p-4">
      <dt className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
        {label}
      </dt>
      <dd className={valueClassName ?? "text-foreground mt-1.5 text-sm"}>
        {value}
      </dd>
    </div>
  );
}

function EmployeeDetailCard({ employee }: { employee: EmployeeDetail }) {
  return (
    <section className="border-border bg-card overflow-hidden rounded-2xl border shadow-sm">
      <div className="border-border border-b px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground text-sm">Funcionário</p>
            <h2 className="text-foreground mt-1 text-2xl font-semibold">
              {employee.name || FALLBACK}
            </h2>
          </div>
          <StatusBadge status={employee.status} />
        </div>
      </div>

      <dl className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
        <DetailItem
          label="CPF"
          value={displayCpf(employee.cpf)}
          valueClassName="mt-1.5 font-mono text-sm text-foreground"
        />
        <DetailItem label="Telefone" value={displayPhone(employee.phone)} />
        <DetailItem label="Email" value={employee.email || FALLBACK} />
        <DetailItem label="Criado em" value={displayDate(employee.createdAt)} />
        <div className="border-border bg-muted/20 rounded-xl border p-4">
          <dt className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Status
          </dt>
          <dd className="mt-2">
            <StatusBadge status={employee.status} />
          </dd>
        </div>
      </dl>
    </section>
  );
}

export default async function EmployeeDetailPage({
  params,
}: EmployeeDetailPageProps) {
  const { id } = await params;
  const role = await getCurrentUserRole();
  const canManage = isGerente(role);

  let employee: EmployeeDetail;
  try {
    employee = await getEmployeeById(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login?expired=1");
    }

    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    if (error instanceof ApiError && error.status === 403) {
      return (
        <main className="space-y-6 p-4 sm:p-6 lg:p-8">
          <ErrorState
            title="Sem permissão"
            description="Seu usuário não possui acesso aos dados deste funcionário."
          />
        </main>
      );
    }

    throw error;
  }

  return (
    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Detalhe do funcionário"
        description="Consulte os dados cadastrais e o status atual do funcionário."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/employees"
              className="border-border text-foreground hover:bg-muted focus:ring-ring/40 inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition focus:ring-2 focus:outline-none"
            >
              <Icon icon={Icons.chevronLeft} aria-hidden className="h-4 w-4" />
              Voltar
            </Link>
            {canManage ? (
              <>
                <Link
                  href={`/employees/${id}/edit`}
                  className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 focus:ring-2 focus:ring-cyan-300/50 focus:outline-none"
                >
                  <Icon icon={Icons.edit} aria-hidden className="h-4 w-4" />
                  Editar
                </Link>
                <DeactivateEmployeeDialog
                  employeeId={id}
                  employeeName={employee.name || "este funcionário"}
                  initialStatus={employee.status}
                />
              </>
            ) : null}
          </div>
        }
      />

      <EmployeeDetailCard employee={employee} />
    </main>
  );
}
