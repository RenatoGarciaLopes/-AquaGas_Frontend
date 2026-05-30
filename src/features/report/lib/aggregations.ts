import { format, parseISO, eachDayOfInterval } from "date-fns";

import type {
  PenaltyStatus,
  SalesReportItem,
  StockMovementItem,
  PenaltyReportItem,
} from "@/features/report/types";

// ─── Sales: receita por dia + top produtos ───────────────────────────────────

export type DailyRevenuePoint = {
  date: string; // yyyy-MM-dd
  label: string; // dd/MM
  spot: number;
  contract: number;
  total: number;
};

export function buildDailyRevenue(
  items: SalesReportItem[],
  start: string,
  end: string,
): DailyRevenuePoint[] {
  const days = eachDayOfInterval({
    start: parseISO(start),
    end: parseISO(end),
  });
  const bucket = new Map<string, { spot: number; contract: number }>();
  for (const day of days) {
    bucket.set(format(day, "yyyy-MM-dd"), { spot: 0, contract: 0 });
  }

  for (const item of items) {
    if (item.status !== "FINISHED") continue;
    const key = format(parseISO(item.date), "yyyy-MM-dd");
    const slot = bucket.get(key);
    if (!slot) continue;
    if (item.type === "SALE") slot.spot += item.total;
    else slot.contract += item.total;
  }

  return Array.from(bucket.entries()).map(([date, totals]) => ({
    date,
    label: format(parseISO(date), "dd/MM"),
    spot: round2(totals.spot),
    contract: round2(totals.contract),
    total: round2(totals.spot + totals.contract),
  }));
}

export type TopProductRow = {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
};

export function buildTopProducts(
  items: SalesReportItem[],
  limit = 5,
): TopProductRow[] {
  const map = new Map<string, TopProductRow>();
  for (const item of items) {
    if (item.status !== "FINISHED") continue;
    for (const product of item.items) {
      const current = map.get(product.productId) ?? {
        productId: product.productId,
        productName: product.productName,
        quantity: 0,
        revenue: 0,
      };
      current.quantity += product.quantity;
      current.revenue += product.subtotal;
      map.set(product.productId, current);
    }
  }
  return Array.from(map.values())
    .map((row) => ({ ...row, revenue: round2(row.revenue) }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

// ─── Stock: totais e fluxo diário ────────────────────────────────────────────

export type StockTotals = {
  entries: number;
  exits: number;
  balance: number;
};

export function buildStockTotals(items: StockMovementItem[]): StockTotals {
  let entries = 0;
  let exits = 0;
  for (const item of items) {
    if (item.type === "Entry") entries += item.quantity;
    else exits += item.quantity;
  }
  return { entries, exits, balance: entries - exits };
}

export type StockFlowPoint = {
  date: string;
  label: string;
  entries: number;
  exits: number;
};

export function buildStockFlow(
  items: StockMovementItem[],
  start: string,
  end: string,
): StockFlowPoint[] {
  const days = eachDayOfInterval({
    start: parseISO(start),
    end: parseISO(end),
  });
  const bucket = new Map<string, { entries: number; exits: number }>();
  for (const day of days) {
    bucket.set(format(day, "yyyy-MM-dd"), { entries: 0, exits: 0 });
  }
  for (const item of items) {
    const key = format(parseISO(item.date), "yyyy-MM-dd");
    const slot = bucket.get(key);
    if (!slot) continue;
    if (item.type === "Entry") slot.entries += item.quantity;
    else slot.exits += item.quantity;
  }
  return Array.from(bucket.entries()).map(([date, totals]) => ({
    date,
    label: format(parseISO(date), "dd/MM"),
    entries: totals.entries,
    exits: totals.exits,
  }));
}

// ─── Penalties: distribuição por status ──────────────────────────────────────

export type PenaltyStatusBreakdown = {
  status: PenaltyStatus;
  count: number;
  amount: number;
};

const PENALTY_STATUS_ORDER: PenaltyStatus[] = [
  "PENDING_PAYMENT",
  "OVERDUE",
  "PAID",
  "WAIVED",
  "CANCELED",
];

export function buildPenaltyStatusBreakdown(
  items: PenaltyReportItem[],
): PenaltyStatusBreakdown[] {
  const map = new Map<PenaltyStatus, { count: number; amount: number }>();
  for (const status of PENALTY_STATUS_ORDER) {
    map.set(status, { count: 0, amount: 0 });
  }
  for (const item of items) {
    const slot = map.get(item.status);
    if (!slot) continue;
    slot.count += 1;
    slot.amount += item.financial.calculatedValue;
  }
  return Array.from(map.entries()).map(([status, totals]) => ({
    status,
    count: totals.count,
    amount: round2(totals.amount),
  }));
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
