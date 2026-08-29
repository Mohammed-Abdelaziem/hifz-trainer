import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Continue with demo account" }).click();
    await expect(page).toHaveURL("/");
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

  test("can sync full Quran corpus or shows already synced", async ({ page }) => {
    // The sync button is only shown when corpus is not fully synced
    const syncButton = page.getByRole("button", { name: /Sync full Quran/i });
    const syncedMessage = page.getByText(/Browse all \d+ surahs/i);
    
    // Either the sync button is visible (not synced) or the "Browse all X surahs" is shown (already synced)
    await expect(syncButton.or(syncedMessage)).toBeVisible();
  });
});