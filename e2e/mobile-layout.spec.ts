// Chromium on mobile auto-zooms a page OUT ("shrink to fit") when any piece of
// unbreakable content is wider than the device width. The zoom changes the
// coordinate space mid-run: clicks on fixed bottom-sheet buttons decode into
// the scaled layout viewport and land in the page flow, so Playwright reports
// verse rows/nav as intercepting pointer events (e2e reader specs).
//
// This spec measures the overflow directly and fails with the culprit list,
// both to diagnose the flake and to guard against re-introducing it.

import { expect, signIn, test } from "./fixtures";

test.describe("Mobile layout integrity", () => {
  test("reader must not trigger the mobile fit-to-width zoom", async ({ page }) => {
    test.skip(
      (page.viewportSize()?.width ?? 9999) > 500,
      "only the mobile-chrome project renders the layout that can overflow"
    );
    await signIn(page);
    await page.goto("/reader/1");
    await page.waitForSelector('[dir="rtl"]', { state: "visible", timeout: 15000 });

    const report = await page.evaluate(() => {
      const vw = window.innerWidth;
      const culprits: string[] = [];
      for (const el of document.querySelectorAll("body *")) {
        const r = el.getBoundingClientRect();
        // A horizontal-overflow contributor is any element whose render box
        // exceeds the device width, or whose scrollWidth within its own
        // overflow picks up extra layout. Reporting both makes the JSON
        // decisive about *which* subtree is the unbreakable one.
        if (r.width <= vw || r.width < 8) continue;
        const cs = getComputedStyle(el);
        culprits.push(
          JSON.stringify({
            tag: el.tagName.toLowerCase(),
            cls: (el.className || "").toString().slice(0, 140),
            w: Math.round(r.width),
            sw: el.scrollWidth,
            pos: cs.position,
            ws: cs.whiteSpace,
            text: (el.textContent ?? "").trim().slice(0, 36),
          })
        );
        if (culprits.length > 14) break;
      }
      return {
        vw,
        vh: window.innerHeight,
        docScrollW: document.documentElement.scrollWidth,
        rootClientW: document.documentElement.clientWidth,
        vvScale: window.visualViewport ? window.visualViewport.scale : null,
        culprits,
      };
    });

    // The console line survives in the job log even when the assertion below
    // passes, so a green run can still be diffed for near-miss widths.
    console.info("MOBILE-LAYOUT-REPORT " + JSON.stringify(report));

    expect(
      report.docScrollW <= report.rootClientW,
      `content overflows the device width (${report.docScrollW} > ${report.rootClientW}, ` +
        `visual scale ${report.vvScale}). Chromium shrink-to-fit zooms out and every ` +
        `fixed-sheet click then decodes into the page flow ("intercepts pointer events"). ` +
        `Culprits: ${JSON.stringify(report.culprits)}`
    ).toBe(true);
  });
});
