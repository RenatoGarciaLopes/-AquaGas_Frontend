import { it, vi, expect, describe } from "vitest";
import { screen, fireEvent } from "@testing-library/react";

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/sales",
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => new URLSearchParams(),
}));

import { sale, paginated } from "@/__tests__/mocks/builders";
import { renderWithProviders } from "@/__tests__/test-utils";

import { SalesTable } from "@/features/sale/components/sales-table";

describe("SalesTable", () => {
  it("renderiza venda e ordena por total", () => {
    renderWithProviders(
      <SalesTable
        initialData={paginated([sale()], 1, 10)}
        query={{ pageNumber: 1, pageSize: 10 }}
      />,
    );

    expect(screen.getByText("Maria Silva")).toBeInTheDocument();
    expect(screen.getByText("Ana Gerente")).toBeInTheDocument();
    expect(screen.getByText("Finalizada")).toBeInTheDocument();
    expect(screen.getByText("R$ 25,00")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /total/i }));

    expect(pushMock).toHaveBeenCalledWith(
      "/sales?pageNumber=1&sort=total%3Adesc",
      {
        scroll: false,
      },
    );
  });

  it("mostra empty state", () => {
    renderWithProviders(
      <SalesTable
        initialData={paginated([], 1, 10)}
        query={{ pageNumber: 1, pageSize: 10 }}
      />,
    );

    expect(screen.getByText(/nenhuma venda encontrada/i)).toBeInTheDocument();
    expect(screen.getByText(/nova venda/i)).toBeInTheDocument();
  });
});
