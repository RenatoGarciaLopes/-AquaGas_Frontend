import type { PlanCycle } from "@/features/plan/types";

type PlanCycleBadgeProps = {
  cycle: PlanCycle;
};

const CYCLE_LABELS: Record<PlanCycle, string> = {
  Monthly: "Mensal",
  Quarterly: "Trimestral",
  Annual: "Anual",
  Custom: "Personalizado",
};

export function PlanCycleBadge({ cycle }: PlanCycleBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-0.5 text-xs font-semibold text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-400/10 dark:text-cyan-200">
      {CYCLE_LABELS[cycle]}
    </span>
  );
}
