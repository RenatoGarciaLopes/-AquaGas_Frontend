import { it, vi, expect, describe, beforeEach } from "vitest";

import { ApiError } from "@/shared/api/errors";

vi.mock("@/shared/api/client", () => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
}));

import { apiGet, apiPost } from "@/shared/api/client";

import { login, logout, getSession } from "@/features/auth/api/auth.api";

const apiGetMock = vi.mocked(apiGet);
const apiPostMock = vi.mocked(apiPost);

describe("auth.api", () => {
  beforeEach(() => {
    apiGetMock.mockReset();
    apiPostMock.mockReset();
  });

  it("faz POST de login e hidrata sessão por /api/auth/session", async () => {
    const user = { id: "u1", role: "GERENTE" as const, userName: "gerente" };
    apiPostMock.mockResolvedValueOnce({ success: true });
    apiGetMock.mockResolvedValueOnce({ expiresAt: 123, user });

    await expect(
      login({ password: "secret", userName: "gerente" }),
    ).resolves.toEqual(user);

    expect(apiPostMock).toHaveBeenCalledWith("/api/auth/login", {
      password: "secret",
      userName: "gerente",
    });
    expect(apiGetMock).toHaveBeenCalledWith("/api/auth/session");
  });

  it("normaliza erro 401 de credenciais", async () => {
    apiPostMock.mockRejectedValueOnce(
      new ApiError({ message: "Unauthorized", status: 401 }),
    );

    await expect(
      login({ password: "wrong", userName: "gerente" }),
    ).rejects.toMatchObject({
      message: "Usuário ou senha incorretos.",
      status: 401,
    });
  });

  it("propaga erros não-401 no login", async () => {
    apiPostMock.mockRejectedValueOnce(
      new ApiError({ message: "Servidor fora", status: 503 }),
    );

    await expect(
      login({ password: "secret", userName: "gerente" }),
    ).rejects.toMatchObject({ message: "Servidor fora", status: 503 });
  });

  it("executa logout e getSession nos endpoints esperados", async () => {
    apiPostMock.mockResolvedValueOnce(undefined);
    apiGetMock.mockResolvedValueOnce({
      expiresAt: null,
      user: { id: null, role: "FUNCIONARIO", userName: "ana" },
    });

    await logout();
    await getSession();

    expect(apiPostMock).toHaveBeenCalledWith("/api/auth/logout");
    expect(apiGetMock).toHaveBeenCalledWith("/api/auth/session");
  });
});
