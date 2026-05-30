import { it, vi, expect, describe, afterEach, beforeEach } from "vitest";

import {
  readParam,
  resolveRangeFilters,
} from "@/features/report/lib/resolve-filters";

describe("resolveRangeFilters", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-29T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("usa start/end válidos de searchParams", async () => {
    await expect(
      resolveRangeFilters({ end: "2026-05-31", start: "2026-05-01" }),
    ).resolves.toEqual({
      end: "2026-05-31",
      start: "2026-05-01",
    });
  });

  it("ignora formato inválido ou período invertido e cai no preset default", async () => {
    await expect(
      resolveRangeFilters({ end: "2026-05-01", start: "2026-05-31" }),
    ).resolves.toEqual({
      end: "2026-05-29",
      start: "2026-04-30",
    });

    await expect(
      resolveRangeFilters({ end: "31/05/2026", start: "01/05/2026" }),
    ).resolves.toEqual({
      end: "2026-05-29",
      start: "2026-04-30",
    });
  });

  it("lê o primeiro valor de params em array e normaliza espaços", async () => {
    await expect(
      readParam({ status: [" FINISHED ", "CANCELLED"] }, "status"),
    ).resolves.toBe("FINISHED");
    await expect(readParam({ status: " " }, "status")).resolves.toBeUndefined();
  });
});
