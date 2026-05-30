"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

import { useConfirmBillingPayment } from "@/features/plan/hooks/use-billing-actions";
import {
  useCancelDelivery,
  useConfirmDelivery,
  useRescheduleDelivery,
} from "@/features/plan/hooks/use-delivery-actions";

import { cn } from "@/shared/lib/cn";
import { Icons } from "@/shared/lib/icons";
import {
  formatDate,
  formatCurrency,
  dateInputToIso,
} from "@/shared/lib/formatters";

import { ResponsiveTable } from "@/shared/ui/responsive-table";
import { ResponsiveTabsList } from "@/shared/ui/responsive-tabs-list";
import { STICKY_RIGHT_CELL, STICKY_RIGHT_HEADER } from "@/shared/ui/data-table";

import { ReasonDialog } from "@/features/plan/components/plan-reason-dialog";
import { cancelDeliverySchema } from "@/features/plan/schemas/cancel-delivery.schema";
import { rescheduleDeliverySchema } from "@/features/plan/schemas/reschedule-delivery.schema";
import type {
  BillingStatus,
  DeliveryStatus,
  PlanBillingResponse,
  PlanDeliveryResponse,
} from "@/features/plan/types";

// ─── Status config ────────────────────────────────────────────────────────────

const DELIVERY_STATUS: Record<
  DeliveryStatus,
  { className: string; label: string }
> = {
  Pending: {
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-200",
    label: "Pendente",
  },
  Delivered: {
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200",
    label: "Entregue",
  },
  Late: {
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-200",
    label: "Atrasada",
  },
  Cancelled: {
    className:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-400/30 dark:bg-slate-400/10 dark:text-slate-200",
    label: "Cancelada",
  },
};

const BILLING_STATUS: Record<
  BillingStatus,
  { className: string; label: string }
> = {
  Pending: {
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-400/30 dark:bg-blue-400/10 dark:text-blue-200",
    label: "Pendente",
  },
  Paid: {
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/10 dark:text-emerald-200",
    label: "Pago",
  },
  Late: {
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-200",
    label: "Atrasado",
  },
  Cancelled: {
    className:
      "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-400/30 dark:bg-slate-400/10 dark:text-slate-200",
    label: "Cancelado",
  },
};

// ─── Shared primitives ────────────────────────────────────────────────────────

function StatusBadge({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold",
        className,
      )}
    >
      {label}
    </span>
  );
}

function TableHead({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "text-muted-foreground px-3 pb-3 text-left text-xs font-medium tracking-wide whitespace-nowrap uppercase first:pl-0",
        className,
      )}
    >
      {children}
    </th>
  );
}

function TableHeadRight({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "text-muted-foreground px-3 pb-3 text-right text-xs font-medium tracking-wide whitespace-nowrap uppercase last:pr-0",
        className,
      )}
    >
      {children}
    </th>
  );
}

// ─── Deliveries panel ─────────────────────────────────────────────────────────

function DeliveriesPanel({
  deliveries,
  planId,
  planCanceled,
}: {
  deliveries: PlanDeliveryResponse[];
  planId: string;
  planCanceled: boolean;
}) {
  const router = useRouter();
  const confirmMutation = useConfirmDelivery(planId);
  const cancelMutation = useCancelDelivery(planId);
  const rescheduleMutation = useRescheduleDelivery(planId);

  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<{
    id: string;
    dueDate: string;
  } | null>(null);

  if (deliveries.length === 0) {
    return (
      <p className="text-muted-foreground py-4 text-sm">
        Nenhuma entrega programada.
      </p>
    );
  }

  return (
    <>
      <ResponsiveTable>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-border border-b">
              <TableHead>Período</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Data entrega</TableHead>
              <TableHead>Status</TableHead>
              <TableHeadRight className={STICKY_RIGHT_HEADER}>
                Ações
              </TableHeadRight>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {deliveries.map((delivery) => {
              const config = DELIVERY_STATUS[delivery.status];
              const canConfirm =
                delivery.status === "Pending" || delivery.status === "Late";
              const canCancel =
                delivery.status === "Pending" || delivery.status === "Late";
              const canReschedule =
                !planCanceled && delivery.status === "Cancelled";

              return (
                <tr key={delivery.id} className="hover:bg-muted/20 transition">
                  <td className="text-foreground py-3 pr-3 pl-0 font-mono whitespace-nowrap">
                    {delivery.period}
                  </td>
                  <td className="text-muted-foreground px-3 py-3 whitespace-nowrap">
                    {formatDate(delivery.dueDate)}
                  </td>
                  <td className="text-muted-foreground px-3 py-3 whitespace-nowrap">
                    {delivery.deliveryDate
                      ? formatDate(delivery.deliveryDate)
                      : "—"}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge
                      className={config.className}
                      label={config.label}
                    />
                  </td>
                  <td
                    className={cn(
                      "py-3 pr-0 pl-3 text-right",
                      STICKY_RIGHT_CELL,
                    )}
                  >
                    <div className="inline-flex items-center gap-1">
                      {canConfirm ? (
                        <button
                          type="button"
                          disabled={confirmMutation.isPending}
                          onClick={() =>
                            confirmMutation.mutate(
                              { deliveryId: delivery.id },
                              { onSuccess: () => router.refresh() },
                            )
                          }
                          className="p-1 text-emerald-500 transition hover:text-emerald-600 disabled:opacity-50"
                          title="Confirmar entrega"
                        >
                          <Icon
                            icon={Icons.check}
                            className="h-4 w-4"
                            aria-hidden
                          />
                        </button>
                      ) : null}
                      {canCancel ? (
                        <button
                          type="button"
                          disabled={cancelMutation.isPending}
                          onClick={() => setCancelTarget(delivery.id)}
                          className="p-1 text-red-500 transition hover:text-red-600 disabled:opacity-50"
                          title="Cancelar entrega"
                        >
                          <Icon
                            icon={Icons.x}
                            className="h-4 w-4"
                            aria-hidden
                          />
                        </button>
                      ) : null}
                      {canReschedule ? (
                        <button
                          type="button"
                          disabled={rescheduleMutation.isPending}
                          onClick={() =>
                            setRescheduleTarget({
                              id: delivery.id,
                              dueDate: delivery.dueDate,
                            })
                          }
                          className="p-1 text-cyan-500 transition hover:text-cyan-600 disabled:opacity-50"
                          title="Reagendar entrega"
                        >
                          <Icon
                            icon={Icons.calendar}
                            className="h-4 w-4"
                            aria-hidden
                          />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ResponsiveTable>

      <ReasonDialog
        title="Cancelar entrega"
        description="A entrega será marcada como cancelada."
        open={cancelTarget !== null}
        isPending={cancelMutation.isPending}
        schema={cancelDeliverySchema}
        submitLabel="Cancelar entrega"
        danger
        onConfirm={(data) => {
          if (!cancelTarget) return;
          cancelMutation.mutate(
            { deliveryId: cancelTarget, reason: data.reason },
            {
              onSuccess: () => {
                setCancelTarget(null);
                router.refresh();
              },
            },
          );
        }}
        onCancel={() => setCancelTarget(null)}
      />

      <ReasonDialog
        title="Reagendar entrega"
        description="Selecione uma nova data (máximo 7 dias após a original)."
        open={rescheduleTarget !== null}
        isPending={rescheduleMutation.isPending}
        schema={rescheduleDeliverySchema}
        showDateField
        minDate={rescheduleTarget?.dueDate}
        maxDate={
          rescheduleTarget
            ? new Date(
                new Date(rescheduleTarget.dueDate).getTime() +
                  7 * 24 * 60 * 60 * 1000,
              )
                .toISOString()
                .slice(0, 10)
            : undefined
        }
        submitLabel="Reagendar"
        onConfirm={(data) => {
          if (!rescheduleTarget) return;
          rescheduleMutation.mutate(
            {
              deliveryId: rescheduleTarget.id,
              newDate: dateInputToIso(data.newDate),
              reason: data.reason,
            },
            {
              onSuccess: () => {
                setRescheduleTarget(null);
                router.refresh();
              },
            },
          );
        }}
        onCancel={() => setRescheduleTarget(null)}
      />
    </>
  );
}

// ─── Billings panel ───────────────────────────────────────────────────────────

function BillingsPanel({
  billings,
  planId,
}: {
  billings: PlanBillingResponse[];
  planId: string;
}) {
  const router = useRouter();
  const confirmMutation = useConfirmBillingPayment(planId);

  if (billings.length === 0) {
    return (
      <p className="text-muted-foreground py-4 text-sm">
        Nenhuma cobrança gerada.
      </p>
    );
  }

  return (
    <ResponsiveTable>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-border border-b">
            <TableHead>Vencimento</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Pago em</TableHead>
            <TableHeadRight className={STICKY_RIGHT_HEADER}>
              Ações
            </TableHeadRight>
          </tr>
        </thead>
        <tbody className="divide-border divide-y">
          {billings.map((billing) => {
            const config = BILLING_STATUS[billing.status];
            const canPay =
              billing.status === "Pending" || billing.status === "Late";

            return (
              <tr key={billing.id} className="hover:bg-muted/20 transition">
                <td className="text-muted-foreground py-3 pr-3 pl-0 whitespace-nowrap">
                  {formatDate(billing.dueDate)}
                </td>
                <td className="text-foreground px-3 py-3 font-mono whitespace-nowrap">
                  {formatCurrency(billing.amount)}
                </td>
                <td className="px-3 py-3">
                  <StatusBadge
                    className={config.className}
                    label={config.label}
                  />
                </td>
                <td className="text-muted-foreground px-3 py-3 whitespace-nowrap">
                  {billing.paidAt ? formatDate(billing.paidAt) : "—"}
                </td>
                <td
                  className={cn("py-3 pr-0 pl-3 text-right", STICKY_RIGHT_CELL)}
                >
                  {canPay ? (
                    <button
                      type="button"
                      disabled={confirmMutation.isPending}
                      onClick={() =>
                        confirmMutation.mutate(
                          { billingId: billing.id },
                          { onSuccess: () => router.refresh() },
                        )
                      }
                      className="p-1 text-emerald-500 transition hover:text-emerald-600 disabled:opacity-50"
                      title="Confirmar pagamento"
                    >
                      <Icon
                        icon={Icons.check}
                        className="h-4 w-4"
                        aria-hidden
                      />
                    </button>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </ResponsiveTable>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type TabId = "deliveries" | "billings";

type PlanTablesCardProps = {
  billings: PlanBillingResponse[];
  deliveries: PlanDeliveryResponse[];
  planId: string;
  planCanceled: boolean;
};

export function PlanTablesCard({
  billings,
  deliveries,
  planId,
  planCanceled,
}: PlanTablesCardProps) {
  const [activeTab, setActiveTab] = useState<TabId>("deliveries");

  const tabs: { count: number; id: TabId; label: string }[] = [
    { id: "deliveries", label: "Entregas", count: deliveries.length },
    { id: "billings", label: "Cobranças", count: billings.length },
  ];

  return (
    <section className="border-border bg-card rounded-xl border shadow-sm shadow-black/5 lg:col-span-2">
      <div className="px-4 pt-5 sm:px-6">
        <h2 className="text-foreground text-base font-semibold tracking-tight">
          Entregas & Cobranças
        </h2>

        <ResponsiveTabsList
          ariaLabel="Seções do plano"
          className="mt-4 border-b-0"
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`tabpanel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "inline-flex shrink-0 snap-start items-center gap-2 border-b-2 pr-3 pb-3 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/40",
                  isActive
                    ? "border-cyan-500 text-cyan-500"
                    : "text-muted-foreground hover:text-foreground border-transparent",
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-xs tabular-nums",
                    isActive
                      ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </ResponsiveTabsList>
      </div>

      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="p-4 sm:p-6"
      >
        {activeTab === "deliveries" ? (
          <DeliveriesPanel
            planId={planId}
            deliveries={deliveries}
            planCanceled={planCanceled}
          />
        ) : (
          <BillingsPanel planId={planId} billings={billings} />
        )}
      </div>
    </section>
  );
}
