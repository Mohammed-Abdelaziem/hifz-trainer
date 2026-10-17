import { expect, test } from "./fixtures";

// Theme is a device-local preference (zustand persist under the "theme" key),
// so it works the same for guests and signed-in users; signIn() is only needed
// to reach the auth-gated Settings picker. The class on <html> is what every
// dark: utility in the app keys on.
//
// The toggle cycles light → dark → system, and Playwright's default color
// scheme is light — so the page starts in system mode resolved to light, and
// reaching dark takes two clicks.
test.describe("Theme", () => {
  test("toggles to dark, survives a reload, and responds to Settings", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).not.toHaveClass(/dark/);

    // system -> light (no visual change), then light -> dark.
    await page.getByRole("button", { name: /Switch to Light/ }).click();
    await page.getByRole("button", { name: /Switch to Dark/ }).click();
    await expect(html).toHaveClass(/dark/);

    // The preference is device-local, so a fresh document must not flash back.
    await page.reload();
    await expect(html).toHaveClass(/dark/);

    // dark -> system; the system scheme here is light, so dark must go away.
    await page.getByRole("button", { name: /Switch to System/ }).click();
    await expect(html).not.toHaveClass(/dark/);

    // Settings is auth-gated; the explicit picker drives the same store.
    await page.goto("/login");
    await page.fill('input[name="email"]', "auth-test@example.com");
    await page.fill('input[name="password"]', "testpass12345");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL("/");
    await page.goto("/settings");
    const group = page.getByRole("radiogroup", { name: "Appearance" });
    await group.getByRole("radio", { name: "Dark" }).click();
    await expect(group.getByRole("radio", { name: "Dark" })).toBeChecked();
    await expect(html).toHaveClass(/dark/);
  });
});
