import { formatDate, formatCurrency } from "@/shared/lib/formatters";

import { DataList } from "@/shared/ui/data-list";
import { InfoCard } from "@/shared/ui/info-card";

import type { PlanResponse } from "@/features/plan/types";

type PlanSummaryCardProps = {
  plan: PlanResponse;
};

const CYCLE_LABELS: Record<string, string> = {
  Monthly: "Mensal",
  Quarterly: "Trimestral",
  Annual: "Anual",
  Custom: "Personalizado",
};

export function PlanSummaryCard({ plan }: PlanSummaryCardProps) {
  return (
    <InfoCard title="Resumo" description="Dados gerais do plano.">
      <DataList
        items={[
          { label: "Ciclo", value: CYCLE_LABELS[plan.cycle] ?? plan.cycle },
          {
            label: "Desconto",
            value:
              plan.discount != null && plan.discount > 0
                ? `${plan.discount}%`
                : null,
            emptyFallback: "Sem desconto",
          },
          { label: "Total", value: formatCurrency(plan.total) },
          { label: "Dia da entrega", value: String(plan.deliveryDay) },
          { label: "Dia de vencimento", value: String(plan.billingDay) },
          { label: "Início", value: formatDate(plan.startDate) },
          { label: "Fim", value: formatDate(plan.endDate) },
        ]}
      />
    </InfoCard>
  );
}
