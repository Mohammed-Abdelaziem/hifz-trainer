import { test as base, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

// Must match scripts/auth-e2e.mjs, which seeds this user before the suite.
export const E2E_EMAIL = "auth-test@example.com";
export const E2E_PASSWORD = "testpass12345";

// The onboarding tour renders a full-screen dialog on a visitor's first page
// load and swallows every click, so any spec that clicks anything fails with
// "…intercepts pointer events". Real users dismiss it once and it stays
// dismissed (zustand persist, key "onboarding"), so seed that state before any
// page script runs rather than clicking through the tour in every test.
export const test = base.extend({
  page: async ({ page }, run) => {
    // The callback is not named `use` on purpose: react-hooks/rules-of-hooks
    // reads `use(page)` as a React hook call and errors, even though this is a
    // Playwright fixture.
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "onboarding",
        JSON.stringify({ state: { hasCompletedOnboarding: true }, version: 0 })
      );
    });
    await run(page);
  },
});

// Guests get an empty dashboard ("no review queue to load") and no rating
// controls, so specs that assert account features have to sign in.
export async function signIn(page: Page) {
  await page.goto("/login");
  await page.fill('input[name="email"]', E2E_EMAIL);
  await page.fill('input[name="password"]', E2E_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL("/");
}

export { expect };