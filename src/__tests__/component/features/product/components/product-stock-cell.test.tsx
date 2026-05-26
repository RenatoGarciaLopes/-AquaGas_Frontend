import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";

import { renderWithProviders } from "@/__tests__/test-utils";
import { ProductStockCell } from "@/features/product/components/product-stock-cell";

describe("ProductStockCell", () => {
  it("renderiza níveis de estoque", () => {
    const { rerender } = renderWithProviders(<ProductStockCell quantity={0} />);
    expect(screen.getByText("Sem estoque")).toBeInTheDocument();

    rerender(<ProductStockCell quantity={5} />);
    expect(screen.getByText("5")).toBeInTheDocument();

    rerender(<ProductStockCell quantity={6} />);
    expect(screen.getByText("6")).toBeInTheDocument();
  });
});
