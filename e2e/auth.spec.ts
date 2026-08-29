import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("shows login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Hifz Trainer");
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue with demo account" })).toBeVisible();
  });

  test("can sign in with demo account", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Continue with demo account" }).click();
    await expect(page).toHaveURL("/");
  });

  test("can sign up with new account", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("tab", { name: "Create account" }).click();
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[name="password"]', "password123");
    await page.getByRole("button", { name: "Create account & start" }).click();
    await expect(page).toHaveURL("/");
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "wrong@example.com");
    await page.fill('input[name="password"]', "wrongpass");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Incorrect email or password")).toBeVisible();
  });
});