import { it, vi, expect, describe, beforeEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";

const { pushMock, refreshMock, mutateAsyncMock } = vi.hoisted(() => ({
  mutateAsyncMock: vi.fn(),
  pushMock: vi.fn(),
  refreshMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

vi.mock("@/features/plan/hooks/use-create-plan", () => ({
  useCreatePlan: () => ({
    isPending: false,
    mutateAsync: mutateAsyncMock,
  }),
}));

import { ApiError } from "@/shared/api/errors";
import { renderWithProviders } from "@/__tests__/test-utils";
import { product, customer } from "@/__tests__/mocks/builders";

import { CreatePlanForm } from "@/features/plan/components/create-plan-form";

const customers = [customer()];
const products = [product()];

async function selectCustomerAndGoNext() {
  fireEvent.click(screen.getByRole("button", { name: /maria silva/i }));
  fireEvent.click(screen.getByRole("button", { name: /próximo/i }));
  await screen.findByText("Configure o plano");
}

async function goToItemsStep() {
  await selectCustomerAndGoNext();
  fireEvent.click(screen.getByRole("button", { name: /próximo/i }));
  await screen.findByText("Adicione os itens");
}

describe("CreatePlanForm", () => {
  beforeEach(() => {
    mutateAsyncMock.mockReset();
    pushMock.mockReset();
    refreshMock.mockReset();
  });

  it("seleciona cliente, monta payload e redireciona para o detalhe do plano", async () => {
    mutateAsyncMock.mockResolvedValueOnce({ data: { id: "plan-created" } });

    renderWithProviders(
      <CreatePlanForm customers={customers} products={products} canDiscount />,
    );

    await selectCustomerAndGoNext();
    fireEvent.change(screen.getByLabelText("Desconto"), {
      target: { value: "5" },
    });
    fireEvent.click(screen.getByRole("button", { name: /próximo/i }));
    await screen.findByText("Adicione os itens");

    fireEvent.click(screen.getByRole("button", { name: /água mineral 20l/i }));
    fireEvent.click(
      screen.getByRole("button", { name: "Aumentar quantidade" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Criar plano" }));

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        billingDay: 1,
        customerId: "customer-id",
        cycle: "Monthly",
        deliveryDay: 1,
        discount: 5,
        items: [{ productId: "product-id", quantity: 2 }],
      });
    });
    expect(pushMock).toHaveBeenCalledWith("/plans/plan-created");
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it("mostra duração customizada e bloqueia desconto para funcionário", async () => {
    renderWithProviders(
      <CreatePlanForm
        customers={customers}
        products={products}
        canDiscount={false}
      />,
    );

    await selectCustomerAndGoNext();
    fireEvent.click(screen.getByRole("button", { name: "Personalizado" }));

    expect(
      screen.getByLabelText(/duração/i, { selector: "input" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Desconto")).toBeDisabled();
    expect(
      screen.getByText("Apenas gerentes podem aplicar desconto."),
    ).toBeInTheDocument();
  });

  it("permite reenviar com ignoreWarnings depois de erro de conflito", async () => {
    mutateAsyncMock
      .mockRejectedValueOnce(
        new ApiError({
          code: "CONFLICT",
          message:
            "Cliente possui 2 pagamento(s) em atraso. Deseja prosseguir mesmo assim?",
          status: 409,
        }),
      )
      .mockResolvedValueOnce({ data: { id: "plan-created" } });

    renderWithProviders(
      <CreatePlanForm customers={customers} products={products} canDiscount />,
    );

    await goToItemsStep();
    fireEvent.click(screen.getByRole("button", { name: /água mineral 20l/i }));
    fireEvent.click(screen.getByRole("button", { name: "Criar plano" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Cliente possui 2 pagamento(s) em atraso. Deseja prosseguir mesmo assim?",
    );

    fireEvent.click(screen.getByLabelText("Prosseguir mesmo assim"));
    fireEvent.click(screen.getByRole("button", { name: "Criar plano" }));

    await waitFor(() => {
      expect(mutateAsyncMock).toHaveBeenLastCalledWith(
        expect.objectContaining({ ignoreWarnings: true }),
      );
    });
    expect(pushMock).toHaveBeenCalledWith("/plans/plan-created");
  });
});
