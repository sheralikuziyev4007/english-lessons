import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

/** Credentials used only by the end-to-end test server. */
export const E2E = { password: "e2e-family", pin: "2468" } as const;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    // Set PW_CHANNEL=chrome to use an installed Google Chrome instead of
    // the Chromium that `npx playwright install chromium` downloads.
    channel: process.env.PW_CHANNEL,
  },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
  ],
  webServer: {
    // The test server uses its own embedded database, wiped before each run.
    command: `node scripts/reset-e2e-db.mjs && npx next build && npx next start -p ${PORT}`,
    url: `${BASE_URL}/login`,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      FAMILY_PASSWORD: E2E.password,
      PARENT_PIN: E2E.pin,
      SESSION_SECRET: "e2e-session-secret-not-for-production",
      PGLITE_DIR: "./.pglite-e2e",
      DATABASE_URL: "",
    },
  },
});
