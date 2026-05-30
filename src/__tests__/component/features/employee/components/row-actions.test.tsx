import { it, vi, expect, describe, beforeEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";

const { refreshMock, apiDeleteMock, toastSuccessMock, toastErrorMock } =
  vi.hoisted(() => ({
    apiDeleteMock: vi.fn(),
    refreshMock: vi.fn(),
    toastErrorMock: vi.fn(),
    toastSuccessMock: vi.fn(),
  }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: refreshMock }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: toastErrorMock,
    success: toastSuccessMock,
  },
}));

vi.mock("@/shared/api/client", () => ({
  apiDelete: apiDeleteMock,
}));

import { renderWithProviders } from "@/__tests__/test-utils";
import { employeeWithUser } from "@/__tests__/mocks/builders";

import { RowActions } from "@/features/employee/components/row-actions";

describe("employee RowActions", () => {
  beforeEach(() => {
    apiDeleteMock.mockReset();
    refreshMock.mockReset();
    toastErrorMock.mockReset();
    toastSuccessMock.mockReset();
    vi.spyOn(window, "confirm").mockReset();
  });

  it("oculta editar e desativar quando usuário não pode gerenciar", () => {
    renderWithProviders(
      <RowActions employee={employeeWithUser()} canManage={false} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /ações de ana/i }));

    expect(screen.getByRole("menuitem", { name: "Ver" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Editar" })).toBeNull();
    expect(screen.queryByRole("menuitem", { name: "Desativar" })).toBeNull();
  });

  it("respeita confirmação antes de desativar funcionário", async () => {
    vi.spyOn(window, "confirm").mockReturnValueOnce(true);
    apiDeleteMock.mockResolvedValueOnce({});

    renderWithProviders(<RowActions employee={employeeWithUser()} canManage />);

    fireEvent.click(screen.getByRole("button", { name: /ações de ana/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Desativar" }));

    expect(window.confirm).toHaveBeenCalledWith(
      "Desativar Ana Gerente? Esta ação impedirá o acesso do funcionário ao sistema.",
    );
    await waitFor(() => {
      expect(apiDeleteMock).toHaveBeenCalledWith("/api/employees/employee-id");
    });
    expect(toastSuccessMock).toHaveBeenCalledWith(
      "Ana Gerente foi desativado com sucesso.",
    );
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });
});
