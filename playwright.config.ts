import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

/** Credentials used only by the end-to-end test server. */
export const E2E = { adminPassword: "e2e-admin-password" } as const;

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
  // The story runs on a phone-sized screen, the main device for learners.
  projects: [{ name: "mobile", use: { ...devices["Pixel 7"] } }],
  webServer: {
    // The test server uses its own embedded database, wiped before each run.
    command: `node scripts/reset-e2e-db.mjs && npx next build && npx next start -p ${PORT}`,
    url: `${BASE_URL}/login`,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      ADMIN_PASSWORD: E2E.adminPassword,
      SESSION_SECRET: "e2e-session-secret-not-for-production",
      PGLITE_DIR: "./.pglite-e2e",
      DATABASE_URL: "",
    },
  },
});
