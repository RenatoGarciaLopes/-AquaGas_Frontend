import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/features/auth/api/auth.api", () => ({
  login: vi.fn(),
}));

import { ApiError } from "@/shared/api/errors";
import { renderWithProviders } from "@/__tests__/test-utils";
import { login } from "@/features/auth/api/auth.api";
import { LoginForm } from "@/features/auth/components/login-form";
import { useAuthStore } from "@/features/auth/stores/auth-store";

const loginMock = vi.mocked(login);

describe("LoginForm", () => {
  beforeEach(() => {
    loginMock.mockReset();
    pushMock.mockReset();
    useAuthStore.setState({ isInitialized: false, user: null });
  });

  it("mostra aviso de sessão expirada quando prop está ativa", () => {
    renderWithProviders(<LoginForm sessionExpired />);
    expect(screen.getByText(/sua sessão expirou/i)).toBeInTheDocument();
  });

  it("valida campos obrigatórios antes de chamar API", async () => {
    renderWithProviders(<LoginForm />);

    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/informe o nome de usuário/i),
      ).toBeInTheDocument();
    });
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("faz login, hidrata store e redireciona para employees", async () => {
    const user = { id: "u1", role: "GERENTE" as const, userName: "gerente" };
    loginMock.mockResolvedValueOnce(user);

    renderWithProviders(<LoginForm />);

    fireEvent.input(screen.getByLabelText(/nome de usuário/i), {
      target: { value: "gerente" },
    });
    fireEvent.input(screen.getByLabelText(/^senha$/i), {
      target: { value: "secret" },
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        password: "secret",
        userName: "gerente",
      });
    });
    expect(useAuthStore.getState().user).toEqual(user);
    expect(pushMock).toHaveBeenCalledWith("/employees");
  });

  it("exibe erro de credenciais sem redirecionar", async () => {
    loginMock.mockRejectedValueOnce(
      new ApiError({
        message: "Usuário ou senha incorretos.",
        status: 401,
      }),
    );

    renderWithProviders(<LoginForm />);

    fireEvent.input(screen.getByLabelText(/nome de usuário/i), {
      target: { value: "gerente" },
    });
    fireEvent.input(screen.getByLabelText(/^senha$/i), {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        /usuário ou senha incorretos/i,
      );
    });
    expect(pushMock).not.toHaveBeenCalled();
  });
});
