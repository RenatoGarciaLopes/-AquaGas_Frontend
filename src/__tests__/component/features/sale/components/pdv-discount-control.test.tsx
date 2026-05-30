/* eslint-disable jsx-a11y/aria-role */
import { it, vi, expect, describe } from "vitest";
import { screen, fireEvent } from "@testing-library/react";

import { renderWithProviders } from "@/__tests__/test-utils";

import { PdvDiscountControl } from "@/features/sale/components/pdv/pdv-discount-control";

describe("PdvDiscountControl", () => {
  it("permite gerente alterar desconto em passos de 0,5", () => {
    const onChange = vi.fn();

    renderWithProviders(
      <PdvDiscountControl discount={0} role="GERENTE" onChange={onChange} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /aumentar desconto/i }));
    expect(onChange).toHaveBeenCalledWith(0.5);

    fireEvent.change(screen.getByLabelText(/^desconto$/i), {
      target: { value: "12,7" },
    });
    expect(onChange).toHaveBeenLastCalledWith(12.5);
  });

  it("bloqueia desconto para funcionário", () => {
    const onChange = vi.fn();

    renderWithProviders(
      <PdvDiscountControl
        discount={20}
        role="FUNCIONARIO"
        onChange={onChange}
      />,
    );

    expect(screen.getByLabelText(/^desconto$/i)).toBeDisabled();
    expect(screen.getByLabelText(/^desconto$/i)).toHaveValue("0");
    expect(
      screen.getByText(/apenas gerentes podem aplicar desconto/i),
    ).toBeInTheDocument();
  });
});
