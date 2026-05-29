import { it, vi, expect, describe } from "vitest";
import { screen, fireEvent } from "@testing-library/react";

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/plans",
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => new URLSearchParams(),
}));

import { plan, paginated } from "@/__tests__/mocks/builders";
import { renderWithProviders } from "@/__tests__/test-utils";

import { PlansTable } from "@/features/plan/components/plans-table";

describe("PlansTable", () => {
  it("renderiza plano com status, ciclo, total e datas", () => {
    renderWithProviders(
      <PlansTable
        initialData={paginated([plan()], 1, 10)}
        query={{ pageNumber: 1, pageSize: 10 }}
      />,
    );

    expect(screen.getByText("Maria Silva")).toBeInTheDocument();
    expect(screen.getByText("R$ 120,00")).toBeInTheDocument();
    expect(screen.getByText("31/12/2025")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /total/i }));

    expect(pushMock).toHaveBeenCalledWith(
      "/plans?pageNumber=1&sort=total%3Adesc",
      {
        scroll: false,
      },
    );
  });

  it("mostra empty state", () => {
    renderWithProviders(
      <PlansTable
        initialData={paginated([], 1, 10)}
        query={{ pageNumber: 1, pageSize: 10 }}
      />,
    );

    expect(screen.getByText(/nenhum plano encontrado/i)).toBeInTheDocument();
    expect(screen.getByText(/novo plano/i)).toBeInTheDocument();
  });
});
