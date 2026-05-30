import { devices, defineConfig } from "@playwright/test";

export default defineConfig({
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  outputDir: "test-results/playwright",
  workers: 2,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  reporter: [["list"], ["html", { open: "never" }]],
  retries: process.env.CI ? 1 : 0,
  testDir: "src/__tests__/e2e",
  use: {
    baseURL: "http://127.0.0.1:3100",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "retain-on-failure",
  },
  webServer: [
    {
      command: "node src/__tests__/e2e/support/mock-backend.mjs",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      url: "http://127.0.0.1:45100/api/products",
    },
    {
      command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
      env: {
        AQUAGAS_API_BASE_URL: "http://127.0.0.1:45100",
      },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      url: "http://127.0.0.1:3100/login",
    },
  ],
});
