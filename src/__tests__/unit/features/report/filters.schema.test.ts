import { it, expect, describe } from "vitest";

import {
  dateRangeSchema,
  salesFiltersSchema,
  stockFiltersSchema,
  penaltyFiltersSchema,
} from "@/features/report/schemas/filters.schema";

describe("dateRangeSchema", () => {
  it("aceita um período válido em ISO yyyy-MM-dd", () => {
    const result = dateRangeSchema.safeParse({
      start: "2026-05-01",
      end: "2026-05-31",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita período onde start > end", () => {
    const result = dateRangeSchema.safeParse({
      start: "2026-05-31",
      end: "2026-05-01",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita formato inválido", () => {
    expect(
      dateRangeSchema.safeParse({ start: "01/05/2026", end: "31/05/2026" })
        .success,
    ).toBe(false);
  });
});

describe("salesFiltersSchema", () => {
  it("aceita status e type opcionais", () => {
    const result = salesFiltersSchema.safeParse({
      start: "2026-05-01",
      end: "2026-05-31",
      status: "FINISHED",
      type: "PLAN",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita valores inválidos", () => {
    expect(
      salesFiltersSchema.safeParse({
        start: "2026-05-01",
        end: "2026-05-31",
        status: "FOO",
      }).success,
    ).toBe(false);
  });
});

describe("stockFiltersSchema", () => {
  it("aceita type Entry/Exit", () => {
    expect(
      stockFiltersSchema.safeParse({
        start: "2026-05-01",
        end: "2026-05-31",
        type: "Entry",
      }).success,
    ).toBe(true);
  });
});

describe("penaltyFiltersSchema", () => {
  it("aceita os 5 status válidos", () => {
    for (const status of [
      "PENDING_PAYMENT",
      "PAID",
      "WAIVED",
      "CANCELED",
      "OVERDUE",
    ] as const) {
      const result = penaltyFiltersSchema.safeParse({
        start: "2026-05-01",
        end: "2026-05-31",
        status,
      });
      expect(result.success).toBe(true);
    }
  });
});
