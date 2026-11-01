// Mobile UI probe — drives a Pixel-5 emulated browser against a reachable
// deployment (default: the PR preview) and answers:
//   1. What does the reader ACTUALLY look like at 393px? (screenshots)
//   2. What element sits on top of the rating buttons at their centers?
//      (the exact question the CI e2e run answered with intercept blunders)
// Run: node scripts/mobile-probe.mjs [baseUrl] [--guest]
// --guest: skip registration entirely (verifies pure layout/geometry without
// creating yet another throwaway account on a production database).
import { mkdirSync } from "node:fs";
import { chromium, devices } from "@playwright/test";

const GUEST_ONLY = process.argv.includes("--guest");
const BASE = process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "http://localhost:3000";
const OUT = new URL("../.probe/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
mkdirSync(OUT, { recursive: true });

const log = (...a) => console.log("[probe]", ...a);

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["Pixel 5"], locale: "en-US" });
await ctx.addInitScript(() => {
  try {
    window.localStorage.setItem("onboarding", JSON.stringify({ state: { hasCompletedOnboarding: true }, version: 0 }));
  } catch {}
});
const page = await ctx.newPage();
page.on("console", (m) => {
  if (m.type() === "error") log("console.error:", m.text().slice(0, 200));
});
page.on("pageerror", (e) => log("pageerror:", String(e).slice(0, 200)));

// ---------- phase 1: login page structure ----------
await page.goto(BASE + "/login", { waitUntil: "domcontentloaded" });
log("login url:", page.url());
const buttons = await page.locator("button, a").allTextContents();
log("login controls:", JSON.stringify(buttons.map((t) => t.trim().slice(0, 40)).filter(Boolean)));
await page.screenshot({ path: OUT + "login.png", fullPage: true });

// ---------- phase 2: register a probe account (skipped with --guest) ----------
let registered = false;
let email = "";
if (!GUEST_ONLY) {
  const stamp = Date.now().toString(36);
  email = `probe-${stamp}@example.com`;
  const password = "probe-pass-12345";
try {
  // The AuthForms component toggles modes via a button; try the known labels.
  const toggle = page.getByRole("button", { name: /create|sign up|register/i }).first();
  if (await toggle.count()) {
    await toggle.click();
    await page.waitForTimeout(300);
  }
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  const submit = page.locator('button[type="submit"], form button').first();
  await submit.click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);
  log("after submit url:", page.url());
  const body = (await page.locator("body").textContent()) ?? "";
  log("post-register body hint:", body.replace(/\s+/g, " ").slice(0, 240));
  registered = !page.url().includes("/login") || /dashboard|home/i.test(body);
} catch (e) {
  log("register attempt failed:", String(e).slice(0, 300));
}
  log("registered:", registered, email);
  await page.screenshot({ path: OUT + "after-auth.png", fullPage: true });
}

// ---------- phase 3: reader geometry (the e2e question) ----------
const readerProbe = async (label) => {
  await page.goto(BASE + "/reader/1", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  const geo = await page.evaluate(() => {
    const rec = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        cls: (el.className || "").toString().slice(0, 90),
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        pos: cs.position,
        z: cs.zIndex,
        text: (el.textContent ?? "").trim().slice(0, 40),
      };
    };
    const byText = (t) =>
      [...document.querySelectorAll("button")].find((b) => (b.textContent ?? "").trim().startsWith(t));
    const good = byText("Good");
    const know = [...document.querySelectorAll("button")].find((b) =>
      (b.ariaLabel ?? "").includes("already know")
    );
    const hitChain = (x, y) => {
      const chains = [];
      let el = document.elementFromPoint(x, y);
      for (let i = 0; i < 6 && el; i++) {
        chains.push(rec(el));
        el = el.parentElement;
      }
      return chains;
    };
    const gr = good?.getBoundingClientRect();
    const kr = know?.getBoundingClientRect();
    // Layout-fit diagnostics: Chromium auto-zooms mobile pages out when the
    // document's unbreakable content exceeds the device width ("shrink to
    // fit"). Every fixed-position click coordinate then decodes in the
    // scaled layout space and hits unrelated content. Enumerate the culprits.
    const overflowCulprits = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width <= innerWidth || r.width <= 8) continue;
      const cs = getComputedStyle(el);
      if (cs.position === "fixed" || el.closest("[data-overflow-hidden]")) continue;
      overflowCulprits.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className || "").toString().slice(0, 80),
        w: Math.round(r.width),
        scrollW: el.scrollWidth,
        pos: cs.position,
        nowrap: cs.whiteSpace,
        text: (el.textContent ?? "").trim().slice(0, 28),
      });
      if (overflowCulprits.length > 12) break;
    }
    return {
      vw: innerWidth,
      vh: innerHeight,
      vvScale: visualViewport ? visualViewport.scale : null,
      vvOffsetY: visualViewport ? Math.round(visualViewport.offsetTop) : null,
      scrollY: Math.round(scrollY),
      docH: document.documentElement.scrollHeight,
      docScrollW: document.documentElement.scrollWidth,
      rootClientW: document.documentElement.clientWidth,
      visualW: Math.round(visualViewport?.width ?? 0),
      overflowCulprits,
      good: rec(good),      goodHits: gr ? hitChain(gr.x + gr.width / 2, gr.y + gr.height / 2) : null,
      know: rec(know),
      knowHits: kr ? hitChain(kr.x + kr.width / 2, kr.y + kr.height / 2) : null,
      fixedBars: [...document.querySelectorAll("body *")].filter(
        (el) => getComputedStyle(el).position === "fixed"
      ).map(rec),
    };
  });
  log(`--- ${label} geometry ---`);
  console.log(JSON.stringify(geo, null, 1));
  await page.screenshot({ path: OUT + `reader-${label}.png`, fullPage: true });
  // bottom-of-page screenshot (fixed bar state without scrolling artifacts)
  await page.screenshot({ path: OUT + `reader-${label}-viewport.png` });

  // real click attempt on Good (does the handler fire?)
  if (geo.good) {
    const before = (await page.locator("body").textContent()) ?? "";
    try {
      await page.getByRole("button", { name: "Good" }).click({ timeout: 5000 });
      await page.waitForTimeout(800);
      const after = (await page.locator("body").textContent()) ?? "";
      log("Good click changed page:", after !== before ? "YES" : "NO");
      await page.screenshot({ path: OUT + `reader-${label}-after-click.png` });
    } catch (e) {
      log("Good click timed out:", String(e).split("\n")[0].slice(0, 300));
    }
  }
};

if (GUEST_ONLY) {
  await readerProbe("guest");
} else if (registered) {
  await readerProbe("signedin");
} else {
  await readerProbe("guest");
}

await browser.close();
log("done →", OUT);
