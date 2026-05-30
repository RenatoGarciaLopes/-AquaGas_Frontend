import { it, vi, expect, describe, afterEach, beforeEach } from "vitest";

import {
  detectPreset,
  getPresetRange,
} from "@/features/report/lib/date-presets";

beforeEach(() => {
  vi.useFakeTimers();
  // 2026-05-29 (data atual conforme contexto do projeto)
  vi.setSystemTime(new Date("2026-05-29T12:00:00"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("getPresetRange", () => {
  it("today returns today/today", () => {
    expect(getPresetRange("today")).toEqual({
      start: "2026-05-29",
      end: "2026-05-29",
    });
  });

  it("last7 covers a 7-day window ending today", () => {
    expect(getPresetRange("last7")).toEqual({
      start: "2026-05-23",
      end: "2026-05-29",
    });
  });

  it("last30 covers a 30-day window ending today", () => {
    expect(getPresetRange("last30")).toEqual({
      start: "2026-04-30",
      end: "2026-05-29",
    });
  });

  it("thisMonth runs from day 1 to today", () => {
    expect(getPresetRange("thisMonth")).toEqual({
      start: "2026-05-01",
      end: "2026-05-29",
    });
  });

  it("lastMonth covers the previous full month", () => {
    expect(getPresetRange("lastMonth")).toEqual({
      start: "2026-04-01",
      end: "2026-04-30",
    });
  });
});

describe("detectPreset", () => {
  it("matches an exact preset range", () => {
    const range = getPresetRange("last30");
    expect(detectPreset(range)).toBe("last30");
  });

  it("returns null for custom ranges", () => {
    expect(detectPreset({ start: "2026-01-01", end: "2026-01-15" })).toBeNull();
  });
});
