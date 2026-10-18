import { test, expect } from "./fixtures";

// The fixture user's password (sign-in specs) must match E2E_PASSWORD in
// scripts/auth-e2e.mjs: "testpass12345". The signup spec below needs its own
// policy-compliant constant (12+ chars, 3 of 4 classes) and a fresh one-off
// account, so it differs from the fixture on purpose.

test.describe("Authentication", () => {
  test("shows login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Hifz Trainer");
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("can sign up with new account", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("tab", { name: "Create account" }).click();
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[name="password"]', "Testpass12345!");
    await page.getByRole("button", { name: "Create account & start" }).click();
    await expect(page).toHaveURL("/");
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[name="email"]', "wrong@example.com");
    await page.fill('input[name="password"]', "Wrongpass12345");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Incorrect email or password")).toBeVisible();
  });

  test("rejects a password below the minimum length", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("tab", { name: "Create account" }).click();
    await page.fill('input[name="email"]', `short${Date.now()}@example.com`);
    await page.fill('input[name="password"]', "password123");
    await page.getByRole("button", { name: "Create account & start" }).click();
    await expect(page.getByText(/min 12 chars/i)).toBeVisible();
  });
});
