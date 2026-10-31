import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // One retry, not two. With 26 specs across two projects on a single worker,
  // every failing test costs 3 x 30s, which is what pushed the job past its
  // timeout before the report was ever written.
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30_000,
  // The html reporter writes results to a file and prints nothing until the
  // run finishes, so a hanging suite looks identical to a passing one. The
  // list reporter streams each result as it happens. open: "never" stops the
  // reporter from serving the report and blocking forever after the run,
  // which is what held the step open until the job timeout. Use
  // `npm run e2e:report` to read the HTML report.
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      // hasTouch: false keeps the mobile viewport, UA and isMobile layout but
      // drops the touch-gesture emulation subsystem. On CI that subsystem
      // transiently raised the page zoom scale, so pointer coordinates for
      // clicks on the fixed bottom sheet decoded into the page flow and
      // Playwright reported verse content "intercepts pointer events" (same
      // signature on f1abcb0 before any layout change). No spec uses touch
      // APIs (no .tap() or touchscreen), so this only removes the flake
      // source while keeping mobile rendering fidelity.
      use: { ...devices["Pixel 5"], hasTouch: false },
    },
  ],
  webServer: {
    // Production build, not `next dev`: dev-mode HMR and a cold .env make
    // these specs behave differently from what users get.
    command: "npm run build && npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 300000,
  },
});