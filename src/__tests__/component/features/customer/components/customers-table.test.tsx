import { it, vi, expect, describe } from "vitest";
import { screen, fireEvent } from "@testing-library/react";

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/customers",
  useRouter: () => ({ push: pushMock }),
  useSearchParams: () => new URLSearchParams(),
}));

import { renderWithProviders } from "@/__tests__/test-utils";
import { customer, paginated } from "@/__tests__/mocks/builders";

import { CustomersTable } from "@/features/customer/components/customers-table";

describe("CustomersTable", () => {
  it("renderiza PF/PJ formatados e paginação", () => {
    renderWithProviders(
      <CustomersTable
        canManage
        initialData={paginated(
          [
            customer({ id: "pf", name: "Maria Silva" }),
            customer({
              document: "11222333000181",
              id: "pj",
              name: "Mercado Central",
              typeDocument: "PJ",
            }),
          ],
          1,
          1,
        )}
        query={{ pageNumber: 1, pageSize: 1 }}
      />,
    );

    expect(screen.getByText("Maria Silva")).toBeInTheDocument();
    expect(screen.getByText("529.982.247-**")).toBeInTheDocument();
    expect(screen.getByText("Mercado Central")).toBeInTheDocument();
    expect(screen.getByText("11.222.333/0001-81")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /próxima/i }));

    expect(pushMock).toHaveBeenCalledWith("/customers?pageNumber=2", {
      scroll: false,
    });
  });

  it("mostra empty state com ação de novo cliente", () => {
    renderWithProviders(
      <CustomersTable
        canManage={false}
        initialData={paginated([], 1, 10)}
        query={{ pageNumber: 1, pageSize: 10 }}
      />,
    );

    expect(screen.getByText(/nenhum cliente encontrado/i)).toBeInTheDocument();
    expect(screen.getByText(/novo cliente/i)).toBeInTheDocument();
  });
});
