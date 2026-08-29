import { test, expect } from "@playwright/test";

test.describe("Reader", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Continue with demo account" }).click();
    await expect(page).toHaveURL("/");
    await page.goto("/reader/1");
    // Wait for the reader content to hydrate
    await page.waitForSelector('[dir="rtl"]', { state: "visible", timeout: 15000 });
  });

  test("loads Al-Fatiha and shows Arabic text", async ({ page }) => {
    // The verse text is in the verse content area with class .text-right
    await expect(page.locator('.text-right[dir="rtl"]').first()).toContainText("بِسْمِ");
  });

  test("can switch masking modes", async ({ page }) => {
    // The masking toolbar uses segmented control buttons with tab role
    await expect(page.getByRole("tab", { name: /Blurred/i })).toBeVisible();
    await page.getByRole("tab", { name: /First Letters/i }).click();
    await expect(page.getByRole("tab", { name: /First Letters/i })).toHaveAttribute("aria-selected", "true");
  });

  test("can rate a verse and advance", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Good" })).toBeVisible();
    await page.getByRole("button", { name: "Good" }).click();
    await expect(page.locator(".fixed.bottom-40")).toContainText("Good");
  });

  test("can toggle word-by-word mode", async ({ page }) => {
    // The WbW button has an aria-label
    const wbwButton = page.getByRole("button", { name: /Switch to word-by-word/i });
    await expect(wbwButton).toBeVisible();
    await wbwButton.click();
    await expect(page.getByRole("button", { name: /Switch to continuous/i })).toBeVisible();
  });
});