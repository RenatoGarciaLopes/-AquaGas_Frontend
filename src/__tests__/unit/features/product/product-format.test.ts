import { it, expect, describe } from "vitest";

import { getStockLevel } from "@/features/product/lib/product-format";

describe("getStockLevel", () => {
  it("classifica estoque zerado, baixo e normal", () => {
    expect(getStockLevel(0)).toBe("out");
    expect(getStockLevel(-1)).toBe("out");
    expect(getStockLevel(5)).toBe("low");
    expect(getStockLevel(6)).toBe("ok");
  });
});
