import { http, HttpResponse } from "msw";
import { it, vi, expect, describe, beforeEach } from "vitest";

import { server } from "@/__tests__/mocks/server";
import { apiGet, apiPost, resetSessionExpiredFlag } from "@/shared/api/client";

const toastErrorMock = vi.hoisted(() => vi.fn());

vi.mock("sonner", () => ({
  toast: {
    error: toastErrorMock,
  },
}));

describe("api client", () => {
  beforeEach(() => {
    resetSessionExpiredFlag();
    toastErrorMock.mockReset();
  });

  it("tenta refresh uma vez e repete a request em 401", async () => {
    let calls = 0;

    server.use(
      http.get("/api/protected", () => {
        calls += 1;
        if (calls === 1) {
          return HttpResponse.json({ message: "Expirada" }, { status: 401 });
        }
        return HttpResponse.json({ ok: true });
      }),
      http.post("/api/auth/refresh", () =>
        HttpResponse.json({ success: true }),
      ),
    );

    await expect(apiGet<{ ok: boolean }>("/api/protected")).resolves.toEqual({
      ok: true,
    });
    expect(calls).toBe(2);
  });

  it("dispara evento de sessão expirada quando refresh falha", async () => {
    const listener = vi.fn();
    window.addEventListener("auth:session-expired", listener);

    server.use(
      http.get("/api/protected", () =>
        HttpResponse.json({ message: "Expirada" }, { status: 401 }),
      ),
      http.post("/api/auth/refresh", () =>
        HttpResponse.json({ message: "Sessão expirada." }, { status: 401 }),
      ),
    );

    await expect(apiGet("/api/protected")).rejects.toMatchObject({
      status: 401,
    });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("normaliza fieldErrors de respostas 400", async () => {
    server.use(
      http.post("/api/form", () =>
        HttpResponse.json(
          {
            error: {
              details: [{ field: "name", message: ["Obrigatório."] }],
              message: "Dados inválidos.",
            },
          },
          { status: 400 },
        ),
      ),
    );

    await expect(apiPost("/api/form", {})).rejects.toMatchObject({
      fieldErrors: { name: ["Obrigatório."] },
      message: "Dados inválidos.",
      status: 400,
    });
  });

  it("exibe toast para 403 e 5xx", async () => {
    server.use(
      http.get("/api/forbidden", () =>
        HttpResponse.json({ message: "Sem permissão." }, { status: 403 }),
      ),
      http.get("/api/broken", () =>
        HttpResponse.json({ message: "Falhou." }, { status: 500 }),
      ),
    );

    await expect(apiGet("/api/forbidden")).rejects.toMatchObject({
      status: 403,
    });
    await expect(apiGet("/api/broken")).rejects.toMatchObject({ status: 500 });

    expect(toastErrorMock).toHaveBeenCalledWith(
      "Você não tem permissão para esta ação.",
    );
    expect(toastErrorMock).toHaveBeenCalledWith(
      "Erro interno do servidor. Tente novamente.",
    );
  });
});
