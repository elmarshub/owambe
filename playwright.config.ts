import { defineConfig, devices } from "@playwright/test";

// The e2e suite runs the store in demo mode on its own port, so it never touches real
// Supabase or Paystack and never reuses a live dev server. Next won't override env vars
// that are already set, so these blanks win over .env.local.
const PORT = 3100;
const demoEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
  SUPABASE_SERVICE_ROLE_KEY: "",
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: "",
  PAYSTACK_SECRET_KEY: "",
};

export default defineConfig({
  testDir: "tests/e2e",
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 }, launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {} } },
  ],
  webServer: { command: `pnpm build && pnpm start -p ${PORT}`, url: `http://localhost:${PORT}`, env: demoEnv, reuseExistingServer: true, timeout: 180_000 },
});
