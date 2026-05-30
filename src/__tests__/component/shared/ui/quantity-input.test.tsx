import { it, vi, expect, describe } from "vitest";
import { screen, fireEvent } from "@testing-library/react";

import { QuantityInput } from "@/shared/ui/quantity-input";
import { renderWithProviders } from "@/__tests__/test-utils";

describe("QuantityInput", () => {
  it("incrementa, decrementa e trava botões nos limites", () => {
    const onChange = vi.fn();

    renderWithProviders(
      <QuantityInput value={1} min={1} max={2} onChange={onChange} />,
    );

    expect(
      screen.getByRole("button", { name: "Diminuir quantidade" }),
    ).toBeDisabled();

    fireEvent.click(
      screen.getByRole("button", { name: "Aumentar quantidade" }),
    );
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("clampa entrada digitada entre min e max", () => {
    const onChange = vi.fn();

    renderWithProviders(
      <QuantityInput value={3} min={1} max={5} onChange={onChange} />,
    );

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "12" } });
    expect(onChange).toHaveBeenCalledWith(5);

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith(1);
  });
});
