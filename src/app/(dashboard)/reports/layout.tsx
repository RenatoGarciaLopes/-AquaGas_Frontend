import type { ReactNode } from "react";

import { isGerente } from "@/shared/auth/roles";
import { ErrorState } from "@/shared/ui/error-state";
import { PageHeader } from "@/shared/ui/page-header";
import { getCurrentUserRole } from "@/shared/auth/server";

import { ReportsNav } from "@/features/report/components/reports-nav";

export default async function ReportsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const role = await getCurrentUserRole();

  if (!isGerente(role)) {
    return (
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <PageHeader
          title="Relatórios"
          description="Indicadores gerenciais consolidados de vendas, estoque e multas."
        />
        <ErrorState
          title="Acesso restrito"
          description="Apenas usuários com perfil GERENTE podem visualizar os relatórios gerenciais."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <ReportsNav />
      {children}
    </div>
  );
}
