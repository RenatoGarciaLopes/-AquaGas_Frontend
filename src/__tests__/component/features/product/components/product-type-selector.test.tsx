import { it, vi, expect, describe } from "vitest";
import { screen, fireEvent } from "@testing-library/react";

import { renderWithProviders } from "@/__tests__/test-utils";

import { ProductTypeSelector } from "@/features/product/components/product-type-selector";

describe("ProductTypeSelector", () => {
  it("seleciona tipo de produto e marca item ativo", () => {
    const onChange = vi.fn();

    renderWithProviders(
      <ProductTypeSelector value="Water" onChange={onChange} />,
    );

    expect(screen.getByRole("button", { name: /água/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    fireEvent.click(screen.getByRole("button", { name: /gás/i }));
    expect(onChange).toHaveBeenCalledWith("Gas");
  });

  it("bloqueia seleção e expõe tooltip quando disabled", () => {
    const onChange = vi.fn();

    renderWithProviders(
      <ProductTypeSelector
        disabled
        disabledReason="Zere o estoque para alterar o tipo."
        value="Gas"
        onChange={onChange}
      />,
    );

    const water = screen.getByRole("button", { name: /água/i });
    expect(water).toBeDisabled();
    expect(water).toHaveAttribute("aria-disabled", "true");
    expect(
      screen.getAllByRole("tooltip", { hidden: true })[0],
    ).toHaveTextContent(/zere o estoque/i);
  });
});
