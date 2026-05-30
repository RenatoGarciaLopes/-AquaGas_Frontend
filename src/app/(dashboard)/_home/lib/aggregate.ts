// Agregação pura da Home: transforma planos, vendas e produtos (listas completas
// vindas do backend) nos view models operacionais. Sem efeitos colaterais —
// pode rodar em Server Component. As entregas/recebíveis/multas vivem aninhados
// em cada plano; aqui são achatados e classificados por vencimento.

import { formatDate, formatCurrency } from "@/shared/lib/formatters";

import type { PlanResponse } from "@/features/plan/types";
import type { SaleResponse } from "@/features/sale/types";
import type { ProductResponse } from "@/features/product/types";

import type {
  HomeData,
  HomeDelivery,
  AttentionItem,
  HomeIndicators,
  HomeReceivable,
  AttentionDetail,
} from "../types";

export const LOW_STOCK_THRESHOLD = 5;
const UPCOMING_DELIVERY_DAYS = 7;
const PLAN_EXPIRING_DAYS = 15;

/** Planos cujos eventos (entregas/recebíveis) ainda valem operacionalmente. */
const LIVE_PLAN_STATUSES = new Set(["Active", "AwaitingClosure"]);

// ─── Helpers de data (calendário local do operador) ──────────────────────────

function dayStart(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

/** Diferença em dias-calendário entre `iso` e hoje (negativo = passado). */
function dayDiffFromToday(iso: string, now: Date): number | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const ms = dayStart(d) - dayStart(now);
  return Math.round(ms / 86_400_000);
}

function isSameDay(iso: string, now: Date): boolean {
  return dayDiffFromToday(iso, now) === 0;
}

function itemsLabel(plan: PlanResponse): string {
  return plan.items
    .map((item) => `${item.quantity}× ${item.productName}`)
    .join(" · ");
}

// ─── Entregas ─────────────────────────────────────────────────────────────────

function buildDeliveries(plans: PlanResponse[], now: Date): HomeDelivery[] {
  const result: HomeDelivery[] = [];

  for (const plan of plans) {
    if (!LIVE_PLAN_STATUSES.has(plan.status)) continue;

    for (const delivery of plan.deliveries) {
      if (delivery.status !== "Pending" && delivery.status !== "Late") continue;

      const diff = dayDiffFromToday(delivery.dueDate, now);
      if (diff === null) continue;

      const overdue = delivery.status === "Late" || diff < 0;
      const today = diff === 0;
      const upcoming = diff > 0 && diff <= UPCOMING_DELIVERY_DAYS;

      if (!overdue && !today && !upcoming) continue;

      result.push({
        bucket: overdue ? "overdue" : today ? "today" : "upcoming",
        customerName: plan.customerName,
        deliveryId: delivery.id,
        dueDate: delivery.dueDate,
        itemsLabel: itemsLabel(plan),
        planId: plan.id,
      });
    }
  }

  // Atrasadas primeiro, depois hoje, depois próximas — cada grupo por data asc.
  const order = { overdue: 0, today: 1, upcoming: 2 } as const;
  return result.sort((a, b) => {
    if (a.bucket !== b.bucket) return order[a.bucket] - order[b.bucket];
    return a.dueDate.localeCompare(b.dueDate);
  });
}

// ─── Recebíveis ───────────────────────────────────────────────────────────────

function buildReceivables(plans: PlanResponse[], now: Date): HomeReceivable[] {
  const result: HomeReceivable[] = [];

  for (const plan of plans) {
    if (!LIVE_PLAN_STATUSES.has(plan.status)) continue;

    for (const billing of plan.billings) {
      if (billing.status !== "Pending" && billing.status !== "Late") continue;

      const diff = dayDiffFromToday(billing.dueDate, now);
      const overdue = billing.status === "Late" || (diff !== null && diff < 0);

      result.push({
        amount: billing.amount,
        billingId: billing.id,
        customerName: plan.customerName,
        dueDate: billing.dueDate,
        overdue,
        planId: plan.id,
      });
    }
  }

  return result.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

// ─── Multas pendentes ─────────────────────────────────────────────────────────

function countPendingPenalties(plans: PlanResponse[]): number {
  let count = 0;
  for (const plan of plans) {
    for (const penalty of plan.penalties) {
      if (penalty.status === "PendingPayment" || penalty.status === "Overdue") {
        count += 1;
      }
    }
  }
  return count;
}

// ─── Indicadores ──────────────────────────────────────────────────────────────

function isFinishedSale(sale: SaleResponse): boolean {
  return sale.status === "Finished" || sale.status === 0;
}

function buildIndicators(
  plans: PlanResponse[],
  sales: SaleResponse[],
  products: ProductResponse[],
  deliveries: HomeDelivery[],
  receivables: HomeReceivable[],
  now: Date,
): HomeIndicators {
  const salesToday = sales.filter(
    (s) => isFinishedSale(s) && isSameDay(s.createdAt, now),
  );

  const plansExpiringSoon = plans.filter((plan) => {
    if (plan.status !== "Active") return false;
    const diff = dayDiffFromToday(plan.endDate, now);
    return diff !== null && diff >= 0 && diff <= PLAN_EXPIRING_DAYS;
  }).length;

  return {
    deliveriesToday: deliveries.filter((d) => d.bucket === "today").length,
    deliveriesOverdue: deliveries.filter((d) => d.bucket === "overdue").length,
    lowStock: products.filter((p) => p.quantity < LOW_STOCK_THRESHOLD).length,
    receivablesPending: receivables.length,
    receivablesOverdue: receivables.filter((r) => r.overdue).length,
    penaltiesPending: countPendingPenalties(plans),
    activePlans: plans.filter((p) => p.status === "Active").length,
    salesTodayCount: salesToday.length,
    salesTodayTotal: salesToday.reduce((sum, s) => sum + s.total, 0),
    plansExpiringSoon,
  };
}

// ─── Detalhes por categoria (itens do modal de "Precisa de atenção") ──────────

function overdueDeliveryDetails(deliveries: HomeDelivery[]): AttentionDetail[] {
  return deliveries
    .filter((d) => d.bucket === "overdue")
    .map((d) => ({
      href: `/plans/${d.planId}`,
      id: d.deliveryId,
      subtitle: `${d.itemsLabel} · venceu em ${formatDate(d.dueDate)}`,
      title: d.customerName,
    }));
}

function overdueReceivableDetails(
  receivables: HomeReceivable[],
): AttentionDetail[] {
  return receivables
    .filter((r) => r.overdue)
    .map((r) => ({
      href: `/plans/${r.planId}`,
      id: r.billingId,
      subtitle: `${formatCurrency(r.amount)} · venceu em ${formatDate(r.dueDate)}`,
      title: r.customerName,
    }));
}

function lowStockDetails(products: ProductResponse[]): AttentionDetail[] {
  return products
    .filter((p) => p.quantity < LOW_STOCK_THRESHOLD)
    .map((p) => ({
      href: `/products/${p.id}`,
      id: p.id,
      subtitle: `Estoque atual: ${p.quantity}`,
      title: p.name,
    }));
}

function pendingPenaltyDetails(plans: PlanResponse[]): AttentionDetail[] {
  const details: AttentionDetail[] = [];
  for (const plan of plans) {
    for (const penalty of plan.penalties) {
      if (penalty.status === "PendingPayment" || penalty.status === "Overdue") {
        details.push({
          href: `/plans/${plan.id}`,
          id: penalty.id,
          subtitle: `${formatCurrency(penalty.calculatedAmount)} · vence em ${formatDate(penalty.dueDate)}`,
          title: plan.customerName,
        });
      }
    }
  }
  return details;
}

function expiringPlanDetails(
  plans: PlanResponse[],
  now: Date,
): AttentionDetail[] {
  const details: AttentionDetail[] = [];
  for (const plan of plans) {
    if (plan.status !== "Active") continue;
    const diff = dayDiffFromToday(plan.endDate, now);
    if (diff !== null && diff >= 0 && diff <= PLAN_EXPIRING_DAYS) {
      details.push({
        href: `/plans/${plan.id}`,
        id: plan.id,
        subtitle: `Vence em ${formatDate(plan.endDate)}`,
        title: plan.customerName,
      });
    }
  }
  return details;
}

// ─── Alertas ("Precisa de atenção") ───────────────────────────────────────────

type AttentionDetails = {
  deliveries: AttentionDetail[];
  expiring: AttentionDetail[];
  lowStock: AttentionDetail[];
  penalties: AttentionDetail[];
  receivables: AttentionDetail[];
};

function buildAttention(d: AttentionDetails): AttentionItem[] {
  const items: AttentionItem[] = [];

  if (d.deliveries.length > 0) {
    items.push({
      count: d.deliveries.length,
      details: d.deliveries,
      id: "deliveries-overdue",
      label: `${d.deliveries.length} entrega(s) atrasada(s)`,
      severity: "danger",
    });
  }

  if (d.receivables.length > 0) {
    items.push({
      count: d.receivables.length,
      details: d.receivables,
      id: "receivables-overdue",
      label: `${d.receivables.length} recebível(is) em atraso`,
      severity: "danger",
    });
  }

  if (d.lowStock.length > 0) {
    items.push({
      count: d.lowStock.length,
      details: d.lowStock,
      id: "low-stock",
      label: `${d.lowStock.length} produto(s) com estoque baixo`,
      severity: "warning",
    });
  }

  if (d.penalties.length > 0) {
    items.push({
      count: d.penalties.length,
      details: d.penalties,
      id: "penalties-pending",
      label: `${d.penalties.length} multa(s) pendente(s)`,
      managerOnly: true,
      severity: "warning",
    });
  }

  if (d.expiring.length > 0) {
    items.push({
      count: d.expiring.length,
      details: d.expiring,
      id: "plans-expiring",
      label: `${d.expiring.length} plano(s) vencendo em breve`,
      severity: "warning",
    });
  }

  return items;
}

// ─── Entrada principal ────────────────────────────────────────────────────────

export function buildHomeData(
  plans: PlanResponse[],
  sales: SaleResponse[],
  products: ProductResponse[],
  now: Date = new Date(),
): HomeData {
  const deliveries = buildDeliveries(plans, now);
  const receivables = buildReceivables(plans, now);
  const indicators = buildIndicators(
    plans,
    sales,
    products,
    deliveries,
    receivables,
    now,
  );
  const attention = buildAttention({
    deliveries: overdueDeliveryDetails(deliveries),
    expiring: expiringPlanDetails(plans, now),
    lowStock: lowStockDetails(products),
    penalties: pendingPenaltyDetails(plans),
    receivables: overdueReceivableDetails(receivables),
  });

  return { attention, deliveries, indicators, receivables };
}
