import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieGetMock = vi.hoisted(() => vi.fn());

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: cookieGetMock,
  })),
}));

vi.mock("@/shared/lib/env", () => ({
  getApiBaseUrl: () => "http://backend.test",
}));

describe("serverFetch", () => {
  beforeEach(() => {
    vi.resetModules();
    cookieGetMock.mockReset();
    global.fetch = vi.fn();
  });

  it("injeta bearer token, content-type e query params", async () => {
    cookieGetMock.mockReturnValue({ value: "access-token" });
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    const { serverFetch } = await import("@/shared/api/server-fetch");

    await expect(
      serverFetch("/api/items", {
        body: JSON.stringify({ name: "Item" }),
        method: "POST",
        params: { page: 2, search: "agua" },
      }),
    ).resolves.toEqual({ ok: true });

    const [url, init] = vi.mocked(fetch).mock.calls[0]!;
    expect(String(url)).toBe(
      "http://backend.test/api/items?page=2&search=agua",
    );
    expect(new Headers(init?.headers).get("authorization")).toBe(
      "Bearer access-token",
    );
    expect(new Headers(init?.headers).get("content-type")).toBe(
      "application/json",
    );
  });

  it("converte erro do backend em ApiError com fieldErrors", async () => {
    cookieGetMock.mockReturnValue(undefined);
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION",
            details: [{ field: "cpf", message: ["CPF inválido."] }],
            message: "Dados inválidos.",
          },
        }),
        { status: 400 },
      ),
    );

    const { serverFetch } = await import("@/shared/api/server-fetch");

    await expect(serverFetch("/api/items")).rejects.toMatchObject({
      code: "VALIDATION",
      fieldErrors: { cpf: ["CPF inválido."] },
      message: "Dados inválidos.",
      status: 400,
    });
  });

  it("erro de rede vira 503", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError("network"));

    const { serverFetch } = await import("@/shared/api/server-fetch");

    await expect(serverFetch("/api/items")).rejects.toMatchObject({
      status: 503,
    });
  });
});
