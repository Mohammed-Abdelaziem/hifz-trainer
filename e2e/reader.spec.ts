import { test, expect, signIn } from "./fixtures";

test.describe("Reader", () => {
  test.beforeEach(async ({ page }) => {
    // The rating bar and drill toggle are account features; a guest only gets
    // the read-only view.
    await signIn(page);
    await page.goto("/reader/1");
    await page.waitForSelector('[dir="rtl"]', { state: "visible", timeout: 15000 });
  });

  test("loads Al-Fatiha and shows Arabic text", async ({ page }) => {
    await expect(page.locator('.text-right[dir="rtl"]').first()).toContainText("بِسْمِ");
  });

  test("can switch masking modes", async ({ page }) => {
    await expect(page.getByRole("tab", { name: /Blurred/i })).toBeVisible();
    await page.getByRole("tab", { name: /First Letters/i }).click();
    await expect(page.getByRole("tab", { name: /First Letters/i })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  test("can rate a verse and advance", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Good" })).toBeVisible();
    await page.getByRole("button", { name: "Good" }).click();
    await expect(page.locator(".fixed.bottom-40")).toContainText("Good");
  });

  test("toggles between word-by-word drill and full recitation", async ({ page }) => {
    // ModeButton labels itself with the mode it switches *to*, so the
    // accessible name flips with the current mode. Match either and assert the
    // flip rather than assuming which mode starts active.
    const toggle = page.locator(
      'button[aria-label="Word-by-word drill"], button[aria-label="Full verse recitation"]'
    );
    await expect(toggle).toHaveCount(1);
    const before = await toggle.getAttribute("aria-label");
    await toggle.click();
    await expect(toggle).not.toHaveAttribute("aria-label", before ?? "");
  });

  test("reveals a word with the keyboard", async ({ page }) => {
    // Switch to a masking mode so words are interactive.
    await page.getByRole("tab", { name: /Blurred/i }).click();
    const word = page.getByRole("button", { name: "Reveal word" }).first();
    await expect(word).toBeVisible();
    await word.focus();
    await page.keyboard.press("Enter");
    // The blurred attribute is removed once revealed.
    await expect(word).not.toHaveClass(/blur-\[6px\]/);
  });
});
