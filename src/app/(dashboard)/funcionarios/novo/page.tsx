import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AuthGuard } from "@/shared/auth/auth-guard";
import { ErrorState } from "@/shared/ui/error-state";
import { PageHeader } from "@/shared/ui/page-header";
import { CreateFuncionarioForm } from "@/features/funcionario/components/create-funcionario-form";

export default function NovoFuncionarioPage() {
  return (
    <AuthGuard
      allowedRoles={["GERENTE"]}
      fallback={
        <main className="min-h-screen bg-[var(--background)] p-4 sm:p-6 lg:p-8">
          <ErrorState
            title="Sem permissão"
            description="Seu usuário não possui permissão para criar funcionários."
          />
        </main>
      }
    >
      <main className="min-h-screen space-y-6 bg-[var(--background)] p-4 sm:p-6 lg:p-8">
        <PageHeader
          title="Novo funcionário"
          description="Cadastre os dados pessoais e o acesso do funcionário."
          actions={
            <Link
              href="/funcionarios"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 focus:ring-2 focus:ring-cyan-300/50 focus:outline-none"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Voltar
            </Link>
          }
        />
        <CreateFuncionarioForm />
      </main>
    </AuthGuard>
  );
}
