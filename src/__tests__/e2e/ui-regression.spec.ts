import { expect, test } from "@playwright/test";

test.describe("ui regression smoke", () => {
  test("login é responsivo em desktop e mobile", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();

    await page.setViewportSize({ height: 844, width: 390 });
    await expect(page.getByRole("heading", { name: "Entrar" })).toBeVisible();
    await expect(page.getByLabel("Nome de usuário")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
  });
});
