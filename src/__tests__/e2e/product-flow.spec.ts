import { test, expect } from "@playwright/test";

import { loginAs } from "@/__tests__/e2e/support/auth";

test.describe("product flow", () => {
  test("cria produto com sucesso", async ({ page }) => {
    await loginAs(page, "gerente");
    await page.goto("/products/new");

    await page.getByLabel(/nome do produto/i).fill("Água Premium 20L");
    await page.getByRole("button", { name: /água/i }).click();
    await page.getByRole("button", { name: /próximo/i }).click();

    await page.getByLabel(/preço unitário/i).fill("1250");
    await page.getByLabel(/quantidade inicial/i).fill("3");
    await page.getByRole("button", { name: /salvar produto/i }).click();

    await expect(page).toHaveURL(/\/products/);
  });

  test("erro 409 volta para campo de nome", async ({ page }) => {
    await loginAs(page, "gerente");
    await page.goto("/products/new");

    await page.getByLabel(/nome do produto/i).fill("Duplicado");
    await page.getByRole("button", { name: /água/i }).click();
    await page.getByRole("button", { name: /próximo/i }).click();

    await page.getByLabel(/preço unitário/i).fill("1250");
    await page.getByLabel(/quantidade inicial/i).fill("3");
    await page.getByRole("button", { name: /salvar produto/i }).click();

    await expect(
      page.getByRole("alert").filter({ hasText: /produto já cadastrado/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/nome do produto/i)).toBeVisible();
  });
});
