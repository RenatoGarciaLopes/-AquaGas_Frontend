import { Icons } from "@/shared/lib/icons";
import { formatDate } from "@/shared/lib/formatters";

import { EntityHeader } from "@/shared/ui/entity-header";

import type { PlanResponse } from "@/features/plan/types";
import { PlanCycleBadge } from "@/features/plan/components/plan-cycle-badge";
import { PlanStatusBadge } from "@/features/plan/components/plan-status-badge";
import { PlanDetailActions } from "@/features/plan/components/plan-detail-actions";

type PlanDetailHeaderProps = {
  plan: PlanResponse;
  products: { id: string; name: string; price: number }[];
};

export function PlanDetailHeader({ plan, products }: PlanDetailHeaderProps) {
  return (
    <EntityHeader
      icon={Icons.fileText}
      title={plan.customerName}
      subtitle={plan.document}
      badges={
        <div className="flex flex-wrap items-center gap-2">
          <PlanStatusBadge status={plan.status} />
          <PlanCycleBadge cycle={plan.cycle} />
        </div>
      }
      meta={
        <span>
          Criado por {plan.employeeName} · Início em{" "}
          {formatDate(plan.startDate)}
        </span>
      }
      actions={<PlanDetailActions plan={plan} products={products} />}
    />
  );
}
