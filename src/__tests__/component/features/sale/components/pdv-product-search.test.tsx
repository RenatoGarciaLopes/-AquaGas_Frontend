import { it, vi, expect, describe } from "vitest";
import { screen, fireEvent } from "@testing-library/react";

import { renderWithProviders } from "@/__tests__/test-utils";

import { PdvProductSearch } from "@/features/sale/components/pdv/pdv-product-search";

const PRODUCTS = [
  {
    id: "p1",
    name: "Água 20L",
    price: 12,
    quantity: 4,
    type: "Water" as const,
  },
  { id: "p2", name: "Gás 13kg", price: 115, quantity: 0, type: "Gas" as const },
];

describe("PdvProductSearch", () => {
  it("filtra produtos e bloqueia sem estoque", () => {
    const onSelect = vi.fn();

    renderWithProviders(
      <PdvProductSearch products={PRODUCTS} onSelect={onSelect} />,
    );

    expect(screen.getByText("Água 20L")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /gás 13kg/i })).toBeDisabled();

    fireEvent.change(screen.getByPlaceholderText(/buscar produto/i), {
      target: { value: "água" },
    });
    fireEvent.click(screen.getByRole("button", { name: /água 20l/i }));

    expect(onSelect).toHaveBeenCalledWith(PRODUCTS[0]);
    expect(screen.queryByText("Gás 13kg")).not.toBeInTheDocument();
  });

  it("mostra empty state quando busca não encontra produto", () => {
    renderWithProviders(
      <PdvProductSearch products={PRODUCTS} onSelect={vi.fn()} />,
    );

    fireEvent.change(screen.getByPlaceholderText(/buscar produto/i), {
      target: { value: "inexistente" },
    });

    expect(screen.getByText("Nenhum produto encontrado.")).toBeInTheDocument();
  });
});
