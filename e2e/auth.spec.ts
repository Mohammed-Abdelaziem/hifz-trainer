import { test, expect } from "./fixtures";

// Must match E2E_PASSWORD in scripts/auth-e2e.mjs. The current policy requires
// 12+ characters and 3 of 4 character classes; shorter values are rejected by
// parseCredentials before the credential check ever runs.
const E2E_PASSWORD = "testpass12345";

test.describe("Authentication", () => {
  test("shows login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("Hifz Trainer");
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Continue without account" })).toBeVisible();
  });

  test("can continue without an account", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Continue without account" }).click();
    await expect(page).toHaveURL("/");
  });

  test("can sign up with new account", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("tab", { name: "Create account" }).click();
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[name="password"]', E2E_PASSWORD);
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
