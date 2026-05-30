import { it, vi, expect, describe } from "vitest";
import { screen, fireEvent } from "@testing-library/react";

const { refreshMock } = vi.hoisted(() => ({
  refreshMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

import { plan } from "@/__tests__/mocks/builders";
import { renderWithProviders } from "@/__tests__/test-utils";

import { PlanTablesCard } from "@/features/plan/components/plan-tables-card";
import { PlanPenaltiesCard } from "@/features/plan/components/plan-penalties-card";

describe("PlanTablesCard", () => {
  it("mostra ações de entrega por status e ações de cobrança na aba correta", () => {
    const currentPlan = plan({
      deliveries: [
        {
          deliveryDate: null,
          dueDate: "2026-06-05T00:00:00.000Z",
          id: "pending-delivery",
          period: 1,
          status: "Pending",
        },
        {
          deliveryDate: null,
          dueDate: "2026-06-12T00:00:00.000Z",
          id: "cancelled-delivery",
          period: 2,
          status: "Cancelled",
        },
      ],
    });

    renderWithProviders(
      <PlanTablesCard
        planId={currentPlan.id}
        deliveries={currentPlan.deliveries}
        billings={currentPlan.billings}
        planCanceled={false}
      />,
    );

    expect(screen.getByTitle("Confirmar entrega")).toBeInTheDocument();
    expect(screen.getByTitle("Cancelar entrega")).toBeInTheDocument();
    expect(screen.getByTitle("Reagendar entrega")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /cobranças/i }));

    expect(screen.getByTitle("Confirmar pagamento")).toBeInTheDocument();
  });
});

describe("PlanPenaltiesCard", () => {
  it("esconde ações gerenciais de multa quando canManage é falso", () => {
    const currentPlan = plan();

    renderWithProviders(
      <PlanPenaltiesCard
        planId={currentPlan.id}
        penalties={currentPlan.penalties}
        canManage={false}
      />,
    );

    expect(screen.getByTitle("Confirmar pagamento")).toBeInTheDocument();
    expect(screen.queryByTitle("Dispensar multa")).toBeNull();
    expect(screen.queryByTitle("Cancelar multa")).toBeNull();
  });

  it("abre diálogo de dispensa quando a permissão gerencial está ativa", async () => {
    const currentPlan = plan();

    renderWithProviders(
      <PlanPenaltiesCard
        planId={currentPlan.id}
        penalties={currentPlan.penalties}
        canManage
      />,
    );

    fireEvent.click(screen.getByTitle("Dispensar multa"));

    expect(await screen.findByRole("dialog")).toHaveTextContent(
      "Dispensar multa",
    );
  });
});
