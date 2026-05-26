import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/employees",
  useRouter: () => ({ push: pushMock, refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

import { employeeWithUser, paginated } from "@/__tests__/mocks/builders";
import { renderWithProviders } from "@/__tests__/test-utils";
import { EmployeesTable } from "@/features/employee/components/employees-table";

describe("EmployeesTable", () => {
  it("renderiza funcionário, role normalizada e sort", () => {
    renderWithProviders(
      <EmployeesTable
        canManage
        initialData={paginated([employeeWithUser()], 1, 10)}
        query={{ pageNumber: 1, pageSize: 10 }}
      />,
    );

    expect(screen.getByText("Ana Gerente")).toBeInTheDocument();
    expect(screen.getByText("529.982.247-**")).toBeInTheDocument();
    expect(screen.getByText("GERENTE")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /nome/i }));

    expect(pushMock).toHaveBeenCalledWith(
      "/employees?pageNumber=1&sort=name%3Aasc",
      {
        scroll: false,
      },
    );
  });

  it("não mostra criar funcionário para funcionário comum", () => {
    renderWithProviders(
      <EmployeesTable
        canManage={false}
        initialData={paginated([], 1, 10)}
        query={{ pageNumber: 1, pageSize: 10 }}
      />,
    );

    expect(
      screen.getByText(/nenhum funcionário encontrado/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/criar funcionário/i)).not.toBeInTheDocument();
  });
});
