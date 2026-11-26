// E2E regression suite (Phase 1). Runs against a production build: `npm run build && npm run test:e2e`.
// Headed Chromium is used so WebGL runs on the real GPU; set PW_HEADLESS=1 for CI (software WebGL).
import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PW_PORT || 3600);

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["json", { outputFile: "test-results/e2e-results.json" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    headless: process.env.PW_HEADLESS === "1",
    timezoneId: "Asia/Kolkata",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 } },
    { name: "firefox", use: { ...devices["Desktop Firefox"], viewport: { width: 1440, height: 900 } }, grep: /@xbrowser/ },
    { name: "webkit", use: { ...devices["Desktop Safari"], viewport: { width: 1440, height: 900 } }, grep: /@xbrowser/ },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
