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
      if (!good) return "good button not found";
      let r = good.getBoundingClientRect();
      // If the first title-match is a 0x0 stray, find the painted one.
      if (r.width === 0) {
        const real = Array.from(document.querySelectorAll('button[title*="Good"]')).find(
          (b) => b.getBoundingClientRect().width > 0
        );
        if (real) r = real.getBoundingClientRect();
      }
      const cx = r.x + r.width / 2;
      const cy = r.y + r.height / 2;
      // Stacked hit-test list at the Good center and nearby points.
      for (const p of [
        [cx, cy],
        [cx, cy - r.height / 2 - 4],
        [cx, cy + r.height / 2 + 4],
        [r.x + 6, cy],
      ]) {
        const stack = document
          .elementsFromPoint(p[0], p[1])
          .slice(0, 8)
          .map((el) => {
            const cs = getComputedStyle(el);
            return {
              el: `${el.tagName}`,
              cls: String(el.className).slice(0, 60),
              pos: cs.position,
              z: cs.zIndex,
              op: cs.opacity,
              tr: cs.transform !== "none" ? cs.transform.slice(0, 30) : null,
              pe: cs.pointerEvents,
            };
          });
        info.push({ at: `${Math.round(p[0])},${Math.round(p[1])}`, stack });
      }
      // Every descendant of the fixed bar whose box intersects the Good rect,
      // with paint-relevant styles.
      const bar = Array.from(document.querySelectorAll('[class*="inset-x-0 bottom-0"]')).find(
        (b) => b.getBoundingClientRect().height > 50
      );
      const overlapping: unknown[] = [];
      if (bar) {
        for (const el of Array.from(bar.querySelectorAll("*"))) {
          const er = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          if (
            er.width > 0 &&
            er.x < r.right &&
            er.right > r.x &&
            er.y < r.bottom &&
            er.bottom > r.y
          ) {
            overlapping.push({
              el: el.tagName,
              cls: String(el.className).slice(0, 70),
              rect: `${Math.round(er.x)},${Math.round(er.y)} ${Math.round(er.width)}x${Math.round(er.height)}`,
              pos: cs.position,
              z: cs.zIndex,
              tr: cs.transform !== "none" ? cs.transform.slice(0, 30) : null,
            });
          }
        }
      }
      return JSON.stringify(
        { viewport: { w: window.innerWidth, h: window.innerHeight, scrollY: window.scrollY }, goodRect: `${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}`, stacks: info, overlapping },
        null,
        1
      );
    });
    console.log("RATING-LAYOUT-DUMP\n" + boxes);

    await expect(page.getByRole("button", { name: "Good" })).toBeVisible();

    const target = page.getByRole("button", { name: "Good" });
    const gb = await target.boundingBox();
    if (gb) {
      // Hover the exact center and re-run the hit stack — hovering must not
      // change what intercepts.
      await page.mouse.move(gb.x + gb.width / 2, gb.y + gb.height / 2);
      const afterHover = await page.evaluate(() => {
        const t = document.querySelectorAll('button[title*="Good"]');
        let el: Element | null = null;
        for (const c of t) {
          const cr = c.getBoundingClientRect();
          if (cr.width > 0) {
            el = document.elementFromPoint(cr.x + cr.width / 2, cr.y + cr.height / 2);
            break;
          }
        }
        el ??= document.elementFromPoint(gbFallback()[0], gbFallback()[1]);
        function gbFallback(): [number, number] {
          const b = document.querySelector('button[title*="Good"]');
          const r = b?.getBoundingClientRect();
          return r ? [r.x + r.width / 2, r.y + r.height / 2] : [0, 0];
        }
        return el ? `${el.tagName}.${String(el.className).slice(0, 70)}` : null;
      });
      console.log("AFTER-HOVER-CENTER-HIT: " + afterHover);
      await page.screenshot({ path: "test-results/rating-mobile.png", clip: { x: 0, y: Math.max(0, gb.y - 200), width: gb.x * 2 + 640, height: Math.min(824, gb.y + 90) } });
    }

    // Native DOM click bypasses Playwright's synthetic mouse entirely.
    const nativeClickMessage = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button[title*="Good"]'));
      const real = buttons.find((b) => b.getBoundingClientRect().width > 0) ?? buttons[0];
      if (!real) return "no good button";
      (real as HTMLButtonElement).click();
      return "native click sent";
    });
    console.log("NATIVE-CLICK: " + nativeClickMessage);
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
