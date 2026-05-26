import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";

import { renderWithProviders } from "@/__tests__/test-utils";
import { PdvCart } from "@/features/sale/components/pdv/pdv-cart";

const ITEM = {
  product: {
    id: "p1",
    name: "Água 20L",
    price: 12,
    quantity: 2,
    type: "Water" as const,
  },
  quantity: 1,
};

describe("PdvCart", () => {
  it("renderiza empty state quando carrinho está vazio", () => {
    renderWithProviders(
      <PdvCart items={[]} onQuantityChange={vi.fn()} onRemove={vi.fn()} />,
    );

    expect(screen.getByText("Carrinho vazio")).toBeInTheDocument();
  });

  it("permite aumentar, limitar quantidade e remover item", () => {
    const onQuantityChange = vi.fn();
    const onRemove = vi.fn();

    renderWithProviders(
      <PdvCart
        items={[ITEM]}
        onQuantityChange={onQuantityChange}
        onRemove={onRemove}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /aumentar quantidade/i }),
    );
    expect(onQuantityChange).toHaveBeenCalledWith("p1", 2);

    fireEvent.change(screen.getByLabelText(/^quantidade$/i), {
      target: { value: "99" },
    });
    expect(onQuantityChange).toHaveBeenLastCalledWith("p1", 2);

    fireEvent.click(screen.getByRole("button", { name: /remover água 20l/i }));
    expect(onRemove).toHaveBeenCalledWith("p1");
  });
});
