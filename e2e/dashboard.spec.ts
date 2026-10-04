import { test, expect, signIn } from "./fixtures";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // These assert account-only UI; a guest gets the "no review queue" state.
    await signIn(page);
    await page.waitForLoadState("networkidle");
  });

  test("shows streak card and goal ring", async ({ page }) => {
    await expect(page.getByText("Consistency")).toBeVisible();
    await expect(page.getByText("Daily goal")).toBeVisible();
  });

  test("shows task queue tabs", async ({ page }) => {
    await expect(page.getByRole("tab", { name: /Sabqi/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Sabaq/i })).toBeVisible();
    await expect(page.getByRole("tab", { name: /Manzil/i })).toBeVisible();
  });

  test("hides the corpus sync control from non-admins", async ({ page }) => {
    // SyncButton is gated behind isAdmin so an ordinary account cannot trigger
    // a full 6,236-verse sync. scripts/auth-e2e.mjs seeds a plain user, so the
    // control must be absent whichever state it would have been in.
    await expect(
      page.getByRole("button", { name: /Sync full Quran|Full corpus synced|Retry sync/ })
    ).toHaveCount(0);
  });
});