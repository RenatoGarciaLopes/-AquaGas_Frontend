import type { PlanStatus } from "@/features/plan/types";

type PlanStatusBadgeProps = {
  status: PlanStatus;
};

const STATUS_CONFIG: Record<PlanStatus, { className: string; label: string }> =
  {
    Active: {
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200",
      label: "Ativo",
    },
    Suspended: {
      className:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200",
      label: "Suspenso",
    },
    Canceled: {
      className:
        "border-red-200 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-200",
      label: "Cancelado",
    },
    Finished: {
      className:
        "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-400/30 dark:bg-slate-400/10 dark:text-slate-200",
      label: "Finalizado",
    },
    AwaitingClosure: {
      className:
        "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-400/30 dark:bg-orange-400/10 dark:text-orange-200",
      label: "Aguardando encerramento",
    },
  };

export function PlanStatusBadge({ status }: PlanStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
