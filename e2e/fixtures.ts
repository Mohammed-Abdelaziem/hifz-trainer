import { test as base, expect } from "@playwright/test";

// The onboarding tour renders a full-screen dialog on a visitor's first page
// load and swallows every click, so any spec that clicks anything fails with
// "…intercepts pointer events". Real users dismiss it once and it stays
// dismissed (zustand persist, key "onboarding"), so seed that state before any
// page script runs rather than clicking through the tour in every test.
export const test = base.extend({
  // The callback is not named `use` on purpose: react-hooks/rules-of-hooks
  // reads `use(page)` as a React hook call and errors, even though this is a
  // Playwright fixture.
  page: async ({ page }, run) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "onboarding",
        JSON.stringify({ state: { hasCompletedOnboarding: true }, version: 0 })
      );
    });
    await run(page);
  },
});

export { expect };