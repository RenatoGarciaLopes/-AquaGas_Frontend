// Constrói os eventos do calendário operacional a partir dos planos. Tudo é de
// granularidade de dia (vencimentos), nunca horário. Sem efeitos colaterais —
// roda em Server Component.

import type { PlanResponse } from "@/features/plan/types";

import type { CalendarEvent } from "../types";

const LIVE_PLAN_STATUSES = new Set(["Active", "AwaitingClosure"]);

function dayStart(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

function isPast(iso: string, now: Date): boolean {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return dayStart(d) < dayStart(now);
}

function itemsLabel(plan: PlanResponse): string {
  return plan.items
    .map((item) => `${item.quantity}× ${item.productName}`)
    .join(" · ");
}

export function buildCalendarEvents(
  plans: PlanResponse[],
  now: Date = new Date(),
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const plan of plans) {
    const live = LIVE_PLAN_STATUSES.has(plan.status);

    if (live) {
      for (const delivery of plan.deliveries) {
        if (delivery.status !== "Pending" && delivery.status !== "Late") {
          continue;
        }
        events.push({
          date: delivery.dueDate,
          deliveryId: delivery.id,
          id: `delivery:${delivery.id}`,
          overdue: delivery.status === "Late" || isPast(delivery.dueDate, now),
          planId: plan.id,
          subtitle: itemsLabel(plan),
          title: plan.customerName,
          type: "delivery",
        });
      }

      for (const billing of plan.billings) {
        if (billing.status !== "Pending" && billing.status !== "Late") {
          continue;
        }
        events.push({
          amount: billing.amount,
          billingId: billing.id,
          date: billing.dueDate,
          id: `receivable:${billing.id}`,
          overdue: billing.status === "Late" || isPast(billing.dueDate, now),
          planId: plan.id,
          title: plan.customerName,
          type: "receivable",
        });
      }
    }

    // Multas valem mesmo em planos encerrados/cancelados.
    for (const penalty of plan.penalties) {
      if (penalty.status !== "PendingPayment" && penalty.status !== "Overdue") {
        continue;
      }
      events.push({
        amount: penalty.calculatedAmount,
        date: penalty.dueDate,
        id: `penalty:${penalty.id}`,
        overdue: penalty.status === "Overdue" || isPast(penalty.dueDate, now),
        planId: plan.id,
        subtitle: penalty.type === "Downgrade" ? "Downgrade" : "Cancelamento",
        title: plan.customerName,
        type: "penalty",
      });
    }

    // Vencimento / renovação do plano.
    if (plan.status === "Active") {
      events.push({
        date: plan.endDate,
        id: `expiring:${plan.id}`,
        overdue: isPast(plan.endDate, now),
        planId: plan.id,
        subtitle: "Vencimento do plano",
        title: plan.customerName,
        type: "expiring",
      });
    }
  }

  return events.sort((a, b) => a.date.localeCompare(b.date));
}
