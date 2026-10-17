import { test, expect, signIn } from "./fixtures";
import type { Page } from "@playwright/test";

async function dumpDebug(page: Page): Promise<string> {
  try {
    return (await page.getByTestId("reader-debug").textContent({ timeout: 5000 })) ?? "NO-NODE";
  } catch {
    return "NO-NODE";
  }
}

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

    console.log("PRE-RELOAD-CHIP " + await dumpDebug(page));
    console.log(
      "PRE-RELOAD-CHIP " +
        (await page.getByRole("button", { name: "Verse translation" }).getAttribute("aria-pressed"))
    );
    console.log("PRE-RELOAD-LS " + (await page.evaluate(() => localStorage.getItem("reader-settings"))));

    await page.reload();
    await page.waitForSelector('[dir="rtl"]', { state: "visible", timeout: 15000 });
    console.log("POST-RELOAD-DEBUG " + (await dumpDebug(page)));
    console.log("POST-RELOAD-LS " + (await page.evaluate(() => localStorage.getItem("reader-settings"))));
    console.log(
      "POST-RELOAD-CHIP " +
        (await page.getByRole("button", { name: "Verse translation" }).getAttribute("aria-pressed"))
    );
    await page.waitForTimeout(2000);
    console.log("POST-RELOAD-2S-DEBUG " + (await dumpDebug(page)));
    console.log(
      "POST-RELOAD-SETS " +
        (await page.evaluate(() =>
          JSON.stringify((window as unknown as { __debugSets?: unknown[] }).__debugSets?.slice(-3) ?? [])
        ))
    );
    await expect(lines.first()).toBeVisible();

    await page.getByRole("button", { name: "Verse translation" }).click();
    await expect(lines).toHaveCount(0);
  });
});
