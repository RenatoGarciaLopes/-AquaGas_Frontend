import { expect, test } from "@playwright/test";

import { loginAs } from "@/__tests__/e2e/support/auth";

test.describe("PDV", () => {
  test("gerente adiciona produto, cliente, desconto e finaliza venda", async ({
    page,
  }) => {
    await loginAs(page, "gerente");
    await page.goto("/sales/new");

    await page.getByPlaceholder(/buscar produto/i).fill("água");
    await page.getByRole("button", { name: /água mineral 20l/i }).click();

    await expect(page.getByRole("heading", { name: "Carrinho" })).toBeVisible();

    await page.getByPlaceholder(/buscar cliente/i).fill("maria");
    await page.getByRole("button", { name: /maria silva/i }).click();

    await page.getByLabel(/^desconto$/i).fill("10");
    await expect(page.getByText("R$ 11,25")).toBeVisible();

    await page.getByRole("button", { name: /finalizar venda/i }).click();
    await expect(page.getByRole("dialog")).toContainText(/maria silva/i);
    await page
      .getByRole("dialog")
      .getByRole("button", { name: /finalizar venda/i })
      .click();

    await expect(page).toHaveURL(/\/sales\/sale-created/);
  });
});
