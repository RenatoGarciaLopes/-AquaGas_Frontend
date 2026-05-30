import { test, expect } from "@playwright/test";

import { loginAs } from "@/__tests__/e2e/support/auth";

test.describe("dashboard listings", () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, "gerente");
  });

  test("funcionários renderiza dados e busca atualiza URL", async ({
    page,
  }) => {
    await expect(page.getByText("Ana Gerente")).toBeVisible();

    await page.locator("#employees-search").fill("bruno");

    await expect(page).toHaveURL(/search=bruno/, { timeout: 10_000 });
  });

  test("produtos renderiza dados, filtro e sort", async ({ page }) => {
    await page.goto("/products");

    await expect(page.getByText("Água Mineral 20L")).toBeVisible();

    await page.getByLabel(/filtrar por tipo/i).selectOption("Gas");
    await expect(page).toHaveURL(/type=Gas/);

    await page.getByRole("button", { name: /preço/i }).click();
    await expect(page).toHaveURL(/sort=price%3Adesc|sort=price:desc/);
  });

  test("clientes renderiza PF e PJ", async ({ page }) => {
    await page.goto("/customers");

    await expect(page.getByText("Maria Silva")).toBeVisible();
    await expect(page.getByText("Mercado Central LTDA")).toBeVisible();
    await expect(page.getByText("529.982.247-**")).toBeVisible();
  });

  test("vendas e planos renderizam estados principais", async ({ page }) => {
    await page.goto("/sales");
    await expect(page.getByText("Maria Silva")).toBeVisible();
    await expect(page.getByRole("table").getByText("Finalizada")).toBeVisible();

    await page.goto("/plans");
    await expect(page.getByText("Maria Silva")).toBeVisible();
    await expect(page.getByText("R$ 120,00")).toBeVisible();
  });
});
