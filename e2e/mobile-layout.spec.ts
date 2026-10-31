// Chromium on mobile auto-zooms a page OUT ("shrink to fit") when any piece of
// unbreakable content is wider than the device width. The zoom changes the
// coordinate space mid-run: clicks on fixed bottom-sheet buttons decode into
// the scaled layout viewport and land in the page flow, so Playwright reports
// verse rows/nav as intercepting pointer events (e2e reader specs).
//
// This spec measures the document width repeatedly — including AFTER
// interactions and font/hydration settle — because an early sample reads clean
// while the layout is still settling and passes a page that later overflows
// (that false pass hid the bug in a previous CI run). It fails with the
// culprit list, both to diagnose the flake and to guard against
// re-introducing it.

import { expect, signIn, test } from "./fixtures";

type Report = {
  phase: string;
  innerW: number;
  docScrollW: number;
  rootClientW: number;
  vvScale: number | null;
  culprits: string[];
};

async function measure(page: import("@playwright/test").Page, phase: string): Promise<Report> {
  return page.evaluate((phase) => {
    const vw = window.visualViewport?.width ?? document.documentElement.clientWidth;
    const culprits: string[] = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      // A horizontal-overflow contributor is any element whose render box
      // exceeds the visible viewport width. Fixed overlays sized inset-x-0
      // track the (possibly zoomed) layout width too, so include them.
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
      phase,
      innerW: window.innerWidth,
      docScrollW: document.documentElement.scrollWidth,
      rootClientW: document.documentElement.clientWidth,
      vvScale: window.visualViewport ? window.visualViewport.scale : null,
      culprits,
    };
  }, phase);
}

test.describe("Mobile layout integrity", () => {
  test("reader must not trigger the mobile fit-to-width zoom", async ({ page }) => {
    test.skip(
      (page.viewportSize()?.width ?? 9999) > 500,
      "only the mobile-chrome project renders the layout that can overflow"
    );
    await signIn(page);
    await page.goto("/reader/1");
    await page.waitForSelector('[dir="rtl"]', { state: "visible", timeout: 15000 });

    const reports: Report[] = [];

    // Phase 1: right after content appears (the sample that formally passed
    // while the page still grew later).
    reports.push(await measure(page, "t0-early"));

    // Phase 2: after hydration/fonts/audio settle.
    await page.waitForTimeout(2500);
    reports.push(await measure(page, "t1-settled"));

    // Phase 3: after real interactions — grading and toggling drill mode —
    // which re-render the bottom sheet and toolbar.
    const good = page.getByRole("button", { name: "Good" });
    await good.click({ timeout: 10000 }).catch((e) => {
      console.info("MOBILE-LAYOUT-CLICK-GOOD-FAIL " + String(e).slice(0, 200));
    });
    const drill = page.locator(
      'button[aria-label="Word-by-word drill"], button[aria-label="Full verse recitation"]'
    );
    await drill.click({ timeout: 6000 }).catch((e) => {
      console.info("MOBILE-LAYOUT-CLICK-DRILL-FAIL " + String(e).slice(0, 200));
    });
    reports.push(await measure(page, "t2-after-clicks"));

    for (const r of reports) {
      // Each console line survives in the job log even when the assertions
      // pass, so a green run can still be diffed for near-miss widths.
      console.info("MOBILE-LAYOUT-REPORT " + JSON.stringify(r));
      expect(
        r.docScrollW <= r.rootClientW && r.innerW <= r.rootClientW,
        `phase ${r.phase}: content overflows the device width ` +
          `(scrollW ${r.docScrollW}, innerW ${r.innerW} > client ${r.rootClientW}, ` +
          `visual scale ${r.vvScale}). Chromium shrink-to-fit zooms out and every ` +
          `fixed-sheet click then decodes into the page flow ("intercepts pointer ` +
          `events"). Culprits: ${JSON.stringify(r.culprits)}`
      ).toBe(true);
    }
  });
});
