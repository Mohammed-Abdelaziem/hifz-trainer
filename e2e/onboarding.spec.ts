import { test, expect } from "@playwright/test";

// The other specs import a fixture that pre-seeds localStorage to skip the
// onboarding tour. This spec deliberately uses the stock fixture to prove the
// tour still appears for a first-time visitor and that dismissing it sticks.
test.describe("Onboarding tour", () => {
  test("appears for a first-time visitor and stays dismissed", async ({ page }) => {
    await page.goto("/login");
    const dialog = page.getByRole("dialog", { name: "Onboarding tour" });
    await expect(dialog).toBeVisible();

    await dialog.getByRole("button", { name: "Skip onboarding" }).click();
    await expect(dialog).toBeHidden();

    // The choice is persisted, so the tour must not come back on reload.
    await page.reload();
    await expect(page.getByRole("dialog", { name: "Onboarding tour" })).toBeHidden();
  });
});