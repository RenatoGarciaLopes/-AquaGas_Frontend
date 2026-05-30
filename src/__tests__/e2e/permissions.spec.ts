import { test, expect, type Page } from "@playwright/test";

import { loginAs } from "@/__tests__/e2e/support/auth";

async function advanceNewPlanToConfig(page: Page) {
  await page.getByRole("button", { name: /maria silva/i }).click();
  await page.getByRole("button", { name: /próximo/i }).click();
  await expect(page.getByText("Configure o plano")).toBeVisible();
}

test.describe("permissions", () => {
  test("funcionário não vê ações gerenciais", async ({ page }) => {
    await loginAs(page, "funcionario");

    await expect(page.getByText(/novo funcionário/i)).not.toBeVisible();

    await page.goto("/products");
    await expect(page.getByText(/novo produto/i)).not.toBeVisible();

    await page.goto("/sales/new");
    await expect(page.getByLabel(/^desconto$/i)).toBeDisabled();
    await expect(
      page.getByText(/apenas gerentes podem aplicar desconto/i),
    ).toBeVisible();

    await page.goto("/plans/new");
    await advanceNewPlanToConfig(page);
    await expect(page.getByLabel(/^desconto$/i)).toBeDisabled();

    await page.goto("/reports");
    await expect(page.getByText("Acesso restrito")).toBeVisible();
  });

  test("gerente vê ações sensíveis", async ({ page }) => {
    await loginAs(page, "gerente");

    await expect(page.getByText(/novo funcionário/i)).toBeVisible();

    await page.goto("/products");
    await expect(page.getByText(/novo produto/i)).toBeVisible();

    await page.goto("/sales/new");
    await expect(page.getByLabel(/^desconto$/i)).toBeEnabled();

    await page.goto("/plans/new");
    await advanceNewPlanToConfig(page);
    await expect(page.getByLabel(/^desconto$/i)).toBeEnabled();

    await page.goto("/reports");
    await expect(page.getByText("Receita total")).toBeVisible();
  });
});
