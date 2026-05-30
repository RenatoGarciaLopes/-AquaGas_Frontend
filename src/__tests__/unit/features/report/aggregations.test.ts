import { it, expect, describe } from "vitest";

import type {
  SalesReportItem,
  StockMovementItem,
  PenaltyReportItem,
} from "@/features/report/types";
import {
  buildStockFlow,
  buildTopProducts,
  buildStockTotals,
  buildDailyRevenue,
  buildPenaltyStatusBreakdown,
} from "@/features/report/lib/aggregations";

function makeSale(partial: Partial<SalesReportItem> = {}): SalesReportItem {
  return {
    id: "sale-1",
    date: "2026-05-10T12:00:00Z",
    customer: null,
    employee: { id: "e1", name: "Ana" },
    type: "SALE",
    status: "FINISHED",
    itemsCount: 1,
    total: 100,
    items: [
      {
        productId: "p1",
        productName: "Galão 20L",
        quantity: 1,
        unitPrice: 100,
        subtotal: 100,
      },
    ],
    ...partial,
  };
}

function makeStock(
  partial: Partial<StockMovementItem> = {},
): StockMovementItem {
  return {
    id: "m1",
    date: "2026-05-10T08:00:00Z",
    product: { id: "p1", name: "Galão 20L" },
    type: "Entry",
    quantity: 5,
    reason: "Compra",
    reference: null,
    employee: { id: "e1", name: "Ana" },
    customer: null,
    ...partial,
  };
}

describe("buildDailyRevenue", () => {
  it("zera dias sem vendas e separa spot de contrato", () => {
    const items: SalesReportItem[] = [
      makeSale({ date: "2026-05-10T12:00:00Z", type: "SALE", total: 100 }),
      makeSale({ date: "2026-05-10T15:00:00Z", type: "PLAN", total: 50 }),
      makeSale({ date: "2026-05-12T09:00:00Z", type: "SALE", total: 30 }),
    ];
    const result = buildDailyRevenue(items, "2026-05-10", "2026-05-12");

    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({
      date: "2026-05-10",
      spot: 100,
      contract: 50,
      total: 150,
    });
    expect(result[1]).toMatchObject({ spot: 0, contract: 0, total: 0 });
    expect(result[2]).toMatchObject({ spot: 30, total: 30 });
  });

  it("ignora vendas canceladas", () => {
    const items = [
      makeSale({ status: "CANCELLED", total: 999 }),
      makeSale({ status: "FINISHED", total: 10 }),
    ];
    const result = buildDailyRevenue(items, "2026-05-10", "2026-05-10");
    expect(result[0]?.total).toBe(10);
  });
});

describe("buildTopProducts", () => {
  it("agrega produtos por receita e ordena desc", () => {
    const items = [
      makeSale({
        items: [
          {
            productId: "p1",
            productName: "Galão",
            quantity: 2,
            unitPrice: 50,
            subtotal: 100,
          },
          {
            productId: "p2",
            productName: "Botijão",
            quantity: 1,
            unitPrice: 80,
            subtotal: 80,
          },
        ],
      }),
      makeSale({
        items: [
          {
            productId: "p1",
            productName: "Galão",
            quantity: 1,
            unitPrice: 50,
            subtotal: 50,
          },
        ],
      }),
    ];

    const top = buildTopProducts(items);
    expect(top[0]).toMatchObject({
      productId: "p1",
      quantity: 3,
      revenue: 150,
    });
    expect(top[1]).toMatchObject({ productId: "p2", revenue: 80 });
  });

  it("respeita o limite e ignora canceladas", () => {
    const items = [
      makeSale({ status: "CANCELLED" }),
      makeSale({
        items: [
          {
            productId: "p1",
            productName: "A",
            quantity: 1,
            unitPrice: 10,
            subtotal: 10,
          },
        ],
      }),
    ];
    expect(buildTopProducts(items, 1)).toHaveLength(1);
  });
});

describe("buildStockTotals", () => {
  it("calcula entradas, saídas e saldo", () => {
    const items: StockMovementItem[] = [
      makeStock({ type: "Entry", quantity: 10 }),
      makeStock({ type: "Exit", quantity: 4 }),
      makeStock({ type: "Exit", quantity: 1 }),
    ];
    expect(buildStockTotals(items)).toEqual({
      entries: 10,
      exits: 5,
      balance: 5,
    });
  });
});

describe("buildStockFlow", () => {
  it("zera dias sem movimento", () => {
    const items: StockMovementItem[] = [
      makeStock({ date: "2026-05-10T08:00:00Z", quantity: 3 }),
    ];
    const flow = buildStockFlow(items, "2026-05-10", "2026-05-11");
    expect(flow).toHaveLength(2);
    expect(flow[0]).toMatchObject({ entries: 3, exits: 0 });
    expect(flow[1]).toMatchObject({ entries: 0, exits: 0 });
  });
});

describe("buildPenaltyStatusBreakdown", () => {
  function makePenalty(
    status: PenaltyReportItem["status"],
    amount: number,
  ): PenaltyReportItem {
    return {
      id: `pen-${status}-${amount}`,
      date: "2026-05-10",
      plan: { id: "pl1", status: "ACTIVE", cycle: "MONTHLY" },
      customer: { id: "c1", name: "X" },
      origin: { type: "PLAN_DOWNGRADE", id: "pl1" },
      type: "DOWNGRADE",
      financial: {
        originalValue: amount,
        remainingValue: amount,
        calculatedValue: amount,
      },
      status,
      dueDate: "2026-05-15",
      paidAt: null,
      notes: null,
      createdBy: { id: "e1", name: "Ana" },
      resolvedBy: null,
      audit: { canBePaid: false, canBeWaived: false, canBeCanceled: false },
    };
  }

  it("agrupa por status mantendo a ordem fixa", () => {
    const result = buildPenaltyStatusBreakdown([
      makePenalty("PAID", 100),
      makePenalty("PAID", 50),
      makePenalty("OVERDUE", 200),
    ]);
    const paid = result.find((r) => r.status === "PAID");
    const overdue = result.find((r) => r.status === "OVERDUE");
    expect(paid).toMatchObject({ count: 2, amount: 150 });
    expect(overdue).toMatchObject({ count: 1, amount: 200 });
  });
});
