import { test, expect } from "@playwright/test";

test.describe("Reader", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Continue without account" }).click();
    await expect(page).toHaveURL("/");
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
    const toggle = page.getByRole("button", { name: "Word-by-word drill" });
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.getByRole("button", { name: "Full verse recitation" })).toBeVisible();
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
