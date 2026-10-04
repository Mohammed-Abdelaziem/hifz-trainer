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

  test("shows the corpus sync control in whichever state applies", async ({ page }) => {
    // The label reflects the current state: "Sync full Quran" when idle,
    // "Full corpus synced" once done, "Retry sync" after a failure. The
    // "Browse all N surahs" fallback this test used to accept does not exist
    // anywhere in the app.
    await expect(
      page.getByRole("button", { name: /Sync full Quran|Full corpus synced|Retry sync/ })
    ).toBeVisible();
  });
});