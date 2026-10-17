import { test, expect, signIn } from "./fixtures";

test.describe("Reader — verse translation", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
    await page.goto("/reader/1");
    await page.waitForSelector('[dir="rtl"]', { state: "visible", timeout: 15000 });
  });

  test("shows the full English line per verse, persisted across reloads", async ({ page }) => {
    const lines = page.getByTestId("verse-translation");
    await expect(lines).toHaveCount(0);

    await page.getByRole("button", { name: "Verse translation" }).click();
    const first = lines.first();
    await expect(first).toBeVisible();
    await expect(first).toHaveText(
      "In the name of Allah, the Entirely Merciful, the Especially Merciful."
    );

    await page.reload();
    await page.waitForSelector('[dir="rtl"]', { state: "visible", timeout: 15000 });
    await expect(lines.first()).toBeVisible();

    await page.getByRole("button", { name: "Verse translation" }).click();
    await expect(lines).toHaveCount(0);
  });
});
