import { it, vi, expect, describe } from "vitest";
import { screen, fireEvent } from "@testing-library/react";

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/products",
  useRouter: () => ({ push: pushMock, refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

import { renderWithProviders } from "@/__tests__/test-utils";
import { product, paginated } from "@/__tests__/mocks/builders";

import { ProductsTable } from "@/features/product/components/products-table";

describe("ProductsTable", () => {
  it("renderiza dados, formatação e ordenação na URL", () => {
    renderWithProviders(
      <ProductsTable
        canManage
        initialData={paginated([product()], 1, 10)}
        query={{ pageNumber: 1, pageSize: 10 }}
      />,
    );

    expect(screen.getByText("Água Mineral 20L")).toBeInTheDocument();
    expect(screen.getByText("R$ 12,50")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /preço/i }));

    expect(pushMock).toHaveBeenCalledWith(
      "/products?pageNumber=1&sort=price%3Adesc",
      {
        scroll: false,
      },
    );
  });

  it("esconde ação de criação no empty state para funcionário", () => {
    renderWithProviders(
      <ProductsTable
        canManage={false}
        initialData={paginated([], 1, 10)}
        query={{ pageNumber: 1, pageSize: 10 }}
      />,
    );

    expect(screen.getByText(/nenhum produto encontrado/i)).toBeInTheDocument();
    expect(screen.queryByText(/novo produto/i)).not.toBeInTheDocument();
  });
});
