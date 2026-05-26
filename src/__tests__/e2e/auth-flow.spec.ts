import { expect, test } from "@playwright/test";

test.describe("auth flow", () => {
  test("login válido redireciona para funcionários", async ({ page }) => {
    await page.goto("/login");

    await page.locator("#userName").fill("gerente");
    await page.locator("#password").fill("secret123");
    await page.getByRole("button", { name: /^Entrar$/ }).click();

    await expect(page).toHaveURL(/\/employees/);
    await expect(
      page.getByRole("heading", { name: "Funcionários" }),
    ).toBeVisible();
  });

  test("login inválido exibe erro e permanece na tela", async ({ page }) => {
    await page.goto("/login");

    await page.locator("#userName").fill("gerente");
    await page.locator("#password").fill("wrong");
    await page.getByRole("button", { name: /^Entrar$/ }).click();

    await expect(page.getByText(/usuário ou senha incorretos/i)).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});
