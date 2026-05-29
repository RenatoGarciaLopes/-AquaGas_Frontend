import Link from "next/link";
import { Icon } from "@iconify/react";

import { Icons } from "@/shared/lib/icons";
import { formatCurrency, formatDate } from "@/shared/lib/formatters";

import { StatCard } from "@/shared/ui/stat-card";
import { DetailShell } from "@/shared/layouts/detail-shell";

import type { PlanResponse } from "@/features/plan/types";
import { PlanDetailHeader } from "@/features/plan/components/plan-detail-header";
import { PlanSummaryCard } from "@/features/plan/components/plan-summary-card";
import { PlanItemsCard } from "@/features/plan/components/plan-items-card";
import { PlanTablesCard } from "@/features/plan/components/plan-tables-card";
import { PlanPenaltiesCard } from "@/features/plan/components/plan-penalties-card";

type PlanDetailProps = {
  canManage: boolean;
  plan: PlanResponse;
};

function getNextPendingDelivery(plan: PlanResponse): string | null {
  const pending = plan.deliveries
    .filter((d) => d.status === "Pending" || d.status === "Late")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  return pending[0]?.dueDate ?? null;
}

export function PlanDetail({ canManage, plan }: PlanDetailProps) {
  const nextDelivery = getNextPendingDelivery(plan);

  return (
    <DetailShell
      back={
        <Link
          href="/plans"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm font-medium transition"
        >
          <Icon icon={Icons.chevronLeft} className="h-4 w-4" aria-hidden />
          Voltar para planos
        </Link>
      }
      header={<PlanDetailHeader plan={plan} />}
      hero={
        <>
          <StatCard
            label="Valor total"
            value={formatCurrency(plan.total)}
            hint={
              plan.discount != null && plan.discount > 0
                ? `Desconto de ${plan.discount}%`
                : "Sem desconto aplicado"
            }
            icon={Icons.barChart}
          />
          <StatCard
            label="Dia da entrega"
            value={`Dia ${plan.deliveryDay}`}
            hint="Todo mês"
            icon={Icons.package}
          />
          <StatCard
            label="Próxima entrega"
            value={nextDelivery ? formatDate(nextDelivery) : null}
            emptyFallback="Nenhuma pendente"
            icon={Icons.calendar}
          />
        </>
      }
    >
      {plan.warning ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-400/10 dark:border-amber-400/30 dark:text-amber-200 rounded-lg px-4 py-3 text-sm lg:col-span-2">
          <strong>Aviso:</strong> {plan.warning}
        </div>
      ) : null}

      <PlanSummaryCard plan={plan} />
      <PlanItemsCard items={plan.items} />
      <PlanTablesCard
        planId={plan.id}
        deliveries={plan.deliveries}
        billings={plan.billings}
      />
      <PlanPenaltiesCard planId={plan.id} penalties={plan.penalties} canManage={canManage} />
    </DetailShell>
  );
}
