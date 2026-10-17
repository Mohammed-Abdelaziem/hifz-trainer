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
      const good = document.querySelector<HTMLButtonElement>('button[title*="Good"]');
      const info: unknown[] = [];
      if (good) {
        const r = good.getBoundingClientRect();
        const cx = r.x + r.width / 2;
        const cy = r.y + r.height / 2;
        // Walk the hit-test chain: elementFromPoint, then its painting
        // ancestors, with box + stacking-relevant computed styles.
        let el: Element | null = document.elementFromPoint(cx, cy);
        for (let depth = 0; depth < 8 && el; depth += 1) {
          const er = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          info.push({
            el: `${el.tagName}${el.ownerSVGElement ? "[svg]" : ""}`,
            cls: String(el.className).slice(0, 80),
            rect: `${Math.round(er.x)},${Math.round(er.y)} ${Math.round(er.width)}x${Math.round(er.height)}`,
            pos: cs.position,
            z: cs.zIndex,
            opacity: cs.opacity,
            vis: cs.visibility,
            pointerEvents: cs.pointerEvents,
            transform: cs.transform !== "none" ? cs.transform.slice(0, 40) : null,
            overflow: cs.overflow,
          });
          el = el.parentElement;
        }
        // Any span whose box actually intersects the Good button box.
        const spans = Array.from(document.querySelectorAll("span"))
          .filter((s) => {
            const sr = s.getBoundingClientRect();
            return sr.y < r.bottom && sr.bottom > r.y && sr.x < r.right && sr.right > r.x;
          })
          .slice(0, 12)
          .map((s) => {
            const sr = s.getBoundingClientRect();
            return {
              cls: String(s.className).slice(0, 60),
              aria: s.getAttribute("aria-hidden"),
              rect: `${Math.round(sr.x)},${Math.round(sr.y)} ${Math.round(sr.width)}x${Math.round(sr.height)}`,
              pos: getComputedStyle(s).position,
              visibility: getComputedStyle(s).visibility,
            };
          });
        return JSON.stringify(
          { viewport: { w: window.innerWidth, h: window.innerHeight }, goodRect: `${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}`, point: `${Math.round(cx)},${Math.round(cy)}`, chain: info, spansInBand: spans },
          null,
          1
        );
      }
      return "good button not found";
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
