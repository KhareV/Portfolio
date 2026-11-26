// Browser regressions. Run against a production build:
//   npm run build && npm run test:e2e
// Set E2E_BASE_URL to test an already-running server instead.
import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT || 4317);
const baseURL = process.env.E2E_BASE_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: { baseURL, trace: "retain-on-failure" },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : { command: `npx next start -p ${PORT}`, url: baseURL, reuseExistingServer: true, timeout: 60_000 },
  projects: [
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, launchOptions: { args: ["--enable-unsafe-swiftshader"] } } },
    { name: "chromium-phone", use: { ...devices["Pixel 7"] } },
    { name: "webkit-desktop", use: { ...devices["Desktop Safari"], viewport: { width: 1440, height: 900 } } },
    { name: "webkit-phone", use: { ...devices["iPhone 15"] } },
    { name: "firefox-smoke", use: { ...devices["Desktop Firefox"] }, grep: /@smoke/ },
  ],
});
