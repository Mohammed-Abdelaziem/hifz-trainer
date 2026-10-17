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
    // TEMPORARY DIAGNOSTIC — print live layout boxes before clicking "Good".
    const boxes = await page.evaluate(() => {
      const grab = (label: string, selectors: string[]) => ({
        label,
        matches: selectors
          .flatMap((sel) => Array.from(document.querySelectorAll(sel)))
          .map((el) => {
            const r = el.getBoundingClientRect();
            const cs = getComputedStyle(el);
            return {
              cls: String(el.className).slice(0, 70),
              x: Math.round(r.x),
              y: Math.round(r.y),
              w: Math.round(r.width),
              h: Math.round(r.height),
              pos: cs.position,
              z: cs.zIndex,
            };
          }),
      });
      const good = document.querySelector<HTMLButtonElement>('button[title*="Good"]');
      let atPoint: string | null = null;
      if (good) {
        const r = good.getBoundingClientRect();
        const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
        atPoint = hit ? `${hit.tagName}.${String(hit.className).slice(0, 80)}` : null;
      }
      return JSON.stringify({
        viewport: { w: window.innerWidth, h: window.innerHeight, scrollY: window.scrollY },
        goodCenterHit: atPoint,
        bar: grab("fixedBar", ['[class*="inset-x-0 bottom-0"]']),
        innerCol: grab("innerCol", ['[class*="max-w-4xl flex"]']),
        panel: grab("panel", ['[class*="space-y-2 rounded-xl border"]']),
        good: grab("good", ['button[title*="Good"]']),
      });
    });
    console.log("RATING-LAYOUT-DUMP\n" + boxes);

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
    const words = page.getByRole("button", { name: "Reveal word" });
    await expect(words.first()).toBeVisible();

    // A revealed word loses role="button" and its "Reveal word" label, so a
    // locator re-resolves to the next still-masked word. Count the buttons
    // instead of asserting on a re-resolved element's classes.
    const before = await words.count();
    await words.first().focus();
    await page.keyboard.press("Enter");
    await expect(words).toHaveCount(before - 1);
  });
});
