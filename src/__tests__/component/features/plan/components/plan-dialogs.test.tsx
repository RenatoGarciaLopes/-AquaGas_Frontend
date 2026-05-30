import { it, vi, expect, describe } from "vitest";
import { screen, fireEvent } from "@testing-library/react";

import { plan } from "@/__tests__/mocks/builders";
import { renderWithProviders } from "@/__tests__/test-utils";

import { UpgradePlanDialog } from "@/features/plan/components/upgrade-plan-dialog";
import { DowngradePlanDialog } from "@/features/plan/components/downgrade-plan-dialog";

describe("plan lifecycle dialogs", () => {
  it("upgrade envia apenas aumentos de quantidade e novos produtos", () => {
    const onConfirm = vi.fn();
    const currentPlan = plan();

    renderWithProviders(
      <UpgradePlanDialog
        open
        isPending={false}
        currentCycle="Monthly"
        currentItems={currentPlan.items}
        availableProducts={[{ id: "gas-13kg", name: "Gás 13kg", price: 110 }]}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /gás 13kg/i }));
    fireEvent.click(
      screen.getAllByRole("button", { name: "Aumentar quantidade" })[0]!,
    );
    fireEvent.change(screen.getByLabelText(/motivo/i), {
      target: { value: "Cliente aumentou consumo" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Aplicar upgrade" }));

    expect(onConfirm).toHaveBeenCalledWith({
      items: [
        { productId: "product-id", quantity: 3 },
        { productId: "gas-13kg", quantity: 1 },
      ],
      reason: "Cliente aumentou consumo",
    });
  });

  it("downgrade exige motivo e envia item removido com quantity 0", () => {
    const onConfirm = vi.fn();
    const currentPlan = plan({
      items: [
        {
          productId: "water-20l",
          productName: "Água Mineral 20L",
          quantity: 3,
        },
        {
          productId: "gas-13kg",
          productName: "Gás 13kg",
          quantity: 1,
        },
      ],
    });

    renderWithProviders(
      <DowngradePlanDialog
        open
        isPending={false}
        currentCycle="Monthly"
        currentItems={currentPlan.items}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Remover Gás 13kg" }));
    fireEvent.change(screen.getByLabelText(/motivo/i), {
      target: { value: "abc" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Aplicar downgrade" }));

    expect(
      screen.getByText("Motivo deve ter no mínimo 5 caracteres."),
    ).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/motivo/i), {
      target: { value: "Cliente reduziu consumo" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Aplicar downgrade" }));

    expect(onConfirm).toHaveBeenCalledWith({
      items: [{ productId: "gas-13kg", quantity: 0 }],
      reason: "Cliente reduziu consumo",
    });
  });
});
