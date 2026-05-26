import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/shared/api/server-fetch", () => ({
  serverFetch: vi.fn(),
}));

import { serverFetch } from "@/shared/api/server-fetch";
import { listEmployees } from "@/features/employee/api/employee.api";

const serverFetchMock = vi.mocked(serverFetch);

const EMPLOYEES = [
  {
    employee: {
      cpf: "52998224725",
      email: "ana@example.com",
      id: "e1",
      name: "Ana Silva",
      phone: "11999998888",
    },
    user: { role: "Manager", userId: "u1", userName: "ana" },
  },
  {
    employee: {
      cpf: "39053344705",
      email: null,
      id: "e2",
      name: "Bruno Costa",
      phone: null,
    },
    user: { role: "Employee", userId: "u2", userName: "bruno" },
  },
];

describe("listEmployees", () => {
  beforeEach(() => {
    serverFetchMock.mockReset();
  });

  it("filtra, ordena e pagina a lista plana do backend", async () => {
    serverFetchMock.mockResolvedValueOnce({
      data: EMPLOYEES,
      error: null,
      success: true,
      timestamp: "2026-05-26T00:00:00Z",
    });

    const result = await listEmployees({
      pageNumber: 1,
      pageSize: 1,
      search: "a",
      sort: "name:desc",
    });

    expect(serverFetchMock).toHaveBeenCalledWith("/api/employees");
    expect(result).toMatchObject({
      hasNextPage: true,
      hasPreviousPage: false,
      pageNumber: 1,
      pageSize: 1,
      totalCount: 2,
      totalPages: 2,
    });
    expect(result.data[0]?.employee.name).toBe("Bruno Costa");
  });

  it("limita pageNumber ao total de páginas", async () => {
    serverFetchMock.mockResolvedValueOnce({
      data: EMPLOYEES,
      error: null,
      success: true,
      timestamp: "2026-05-26T00:00:00Z",
    });

    const result = await listEmployees({ pageNumber: 99, pageSize: 10 });
    expect(result.pageNumber).toBe(1);
    expect(result.hasNextPage).toBe(false);
  });

  it("lança ApiError quando envelope vem sem sucesso", async () => {
    serverFetchMock.mockResolvedValueOnce({
      data: null,
      error: { code: "FAIL", message: "Falhou" },
      success: false,
      timestamp: "2026-05-26T00:00:00Z",
    });

    await expect(
      listEmployees({ pageNumber: 1, pageSize: 10 }),
    ).rejects.toMatchObject({ code: "FAIL", message: "Falhou", status: 500 });
  });
});
