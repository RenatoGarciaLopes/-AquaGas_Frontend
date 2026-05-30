import { expect, type Page } from "@playwright/test";

export async function expectSearchParam(
  page: Page,
  key: string,
  value: string,
) {
  await expect(page).toHaveURL(new RegExp(`[?&]${key}=${value}`));
}
