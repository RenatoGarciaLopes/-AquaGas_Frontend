"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

import { Icons } from "@/shared/lib/icons";
import { formatCurrency, formatDate } from "@/shared/lib/formatters";

import { InfoCard } from "@/shared/ui/info-card";

import type { PlanPenaltyResponse, PenaltyStatus, PenaltyType } from "@/features/plan/types";
import {
  useConfirmPenaltyPayment,
  useWaivePenalty,
  useCancelPenalty,
} from "@/features/plan/hooks/use-penalty-actions";
import { waivePenaltySchema } from "@/features/plan/schemas/waive-penalty.schema";
import { cancelPenaltySchema } from "@/features/plan/schemas/cancel-penalty.schema";
import { ReasonDialog } from "@/features/plan/components/plan-reason-dialog";

type PlanPenaltiesCardProps = {
  planId: string;
  penalties: PlanPenaltyResponse[];
  canManage: boolean;
};

const STATUS_CONFIG: Record<PenaltyStatus, { className: string; label: string }> = {
  PendingPayment: {
    className: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200",
    label: "Aguardando pagamento",
  },
  Paid: {
    className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200",
    label: "Paga",
  },
  Waived: {
    className: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-200",
    label: "Dispensada",
  },
  Canceled: {
    className: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-400/30 dark:bg-slate-400/10 dark:text-slate-200",
    label: "Cancelada",
  },
  Overdue: {
    className: "border-red-200 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-200",
    label: "Vencida",
  },
};

const TYPE_LABELS: Record<PenaltyType, string> = {
  Downgrade: "Downgrade",
  EarlyCancellation: "Cancelamento antecipado",
};


export function PlanPenaltiesCard({ planId, penalties, canManage }: PlanPenaltiesCardProps) {
  const router = useRouter();
  const payMutation = useConfirmPenaltyPayment(planId);
  const waiveMutation = useWaivePenalty(planId);
  const cancelMutation = useCancelPenalty(planId);

  const [waiveTarget, setWaiveTarget] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  if (penalties.length === 0) return null;

  return (
    <InfoCard
      title="Multas contratuais"
      description={`${penalties.length} multa(s) registrada(s).`}
      className="lg:col-span-2"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border border-b">
              <th className="text-muted-foreground pb-2 text-left font-medium">Tipo</th>
              <th className="text-muted-foreground pb-2 text-right font-medium">Valor</th>
              <th className="text-muted-foreground pb-2 text-left font-medium">Status</th>
              <th className="text-muted-foreground pb-2 text-left font-medium">Vencimento</th>
              <th className="text-muted-foreground pb-2 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {penalties.map((penalty) => {
              const statusConfig = STATUS_CONFIG[penalty.status];
              const canPay = penalty.status === "PendingPayment" || penalty.status === "Overdue";
              const canWaive = canManage && canPay;
              const canCancelPenalty = canManage && canPay;

              return (
                <tr key={penalty.id}>
                  <td className="text-foreground py-2.5 font-medium">{TYPE_LABELS[penalty.type]}</td>
                  <td className="text-foreground py-2.5 text-right font-mono">{formatCurrency(penalty.calculatedAmount)}</td>
                  <td className="py-2.5">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${statusConfig.className}`}>{statusConfig.label}</span>
                  </td>
                  <td className="text-muted-foreground py-2.5">{formatDate(penalty.dueDate)}</td>
                  <td className="py-2.5 text-right">
                    <div className="inline-flex items-center gap-1">
                      {canPay ? (
                        <button
                          type="button"
                          disabled={payMutation.isPending}
                          onClick={() => {
                            payMutation.mutate(penalty.id, { onSuccess: () => router.refresh() });
                          }}
                          className="text-emerald-500 hover:text-emerald-600 p-1 transition disabled:opacity-50"
                          title="Confirmar pagamento"
                        >
                          <Icon icon={Icons.check} className="h-4 w-4" aria-hidden />
                        </button>
                      ) : null}
                      {canWaive ? (
                        <button type="button" disabled={waiveMutation.isPending} onClick={() => setWaiveTarget(penalty.id)} className="text-blue-500 hover:text-blue-600 p-1 transition disabled:opacity-50" title="Dispensar multa">
                          <Icon icon={Icons.eye} className="h-4 w-4" aria-hidden />
                        </button>
                      ) : null}
                      {canCancelPenalty ? (
                        <button type="button" disabled={cancelMutation.isPending} onClick={() => setCancelTarget(penalty.id)} className="text-red-500 hover:text-red-600 p-1 transition disabled:opacity-50" title="Cancelar multa">
                          <Icon icon={Icons.x} className="h-4 w-4" aria-hidden />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ReasonDialog
        title="Dispensar multa"
        open={waiveTarget !== null}
        isPending={waiveMutation.isPending}
        schema={waivePenaltySchema}
        placeholder="Mínimo 10 caracteres…"
        submitLabel="Dispensar multa"
        onConfirm={(data) => {
          if (!waiveTarget) return;
          waiveMutation.mutate(
            { penaltyId: waiveTarget, input: { reason: data.reason } },
            { onSuccess: () => { setWaiveTarget(null); router.refresh(); } },
          );
        }}
        onCancel={() => setWaiveTarget(null)}
      />

      <ReasonDialog
        title="Cancelar multa"
        open={cancelTarget !== null}
        isPending={cancelMutation.isPending}
        schema={cancelPenaltySchema}
        placeholder="Mínimo 10 caracteres…"
        submitLabel="Cancelar multa"
        danger
        onConfirm={(data) => {
          if (!cancelTarget) return;
          cancelMutation.mutate(
            { penaltyId: cancelTarget, input: { reason: data.reason } },
            { onSuccess: () => { setCancelTarget(null); router.refresh(); } },
          );
        }}
        onCancel={() => setCancelTarget(null)}
      />
    </InfoCard>
  );
}
