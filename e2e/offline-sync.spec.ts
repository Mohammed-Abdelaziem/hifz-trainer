import { test, expect, signIn } from "./fixtures";
import type { Page } from "@playwright/test";

// Background Sync needs its feature flag explicitly enabled in automation —
// without it, sync.register() throws "Background Sync is disabled." before
// the worker can ever wake. Must be top-level: test.use({ launchOptions })
// inside a describe group forces a new worker and is rejected by Playwright.
test.use({ launchOptions: { args: ["--enable-features=BackgroundSync"] } });

interface QueuedReview {
  id: string;
  verseKey: string;
  grade: string;
  retries: number;
  synced: boolean;
}

/**
 * Best-effort read of the offline review queue (public/sw.js's store). The
 * promise always settles quickly — Playwright garbage-collects evaluate
 * promises whose resolution depends on events it cannot see, so every branch
 * resolves within its own timer and callers tolerate the occasional miss.
 */
function readQueueOnce(page: Page): Promise<QueuedReview[]> {
  return page
    .evaluate(
      () =>
        new Promise<QueuedReview[]>((resolve) => {
          const bail = setTimeout(() => resolve([]), 2000);
          try {
            const req = indexedDB.open("hifz-offline", 1);
            req.onerror = () => {
              clearTimeout(bail);
              resolve([]);
            };
            req.onsuccess = () => {
              const tx = req.result.transaction("review-queue", "readonly");
              const store = tx.objectStore("review-queue");
              // Store-level scan, mirroring the sw.js/review-queue.ts fix:
              // the "synced" index is not enumerable (booleans are not
              // valid IndexedDB keys), so IDBKeyRange.only(false) throws.
              const all = store.getAll();
              all.onsuccess = () => {
                clearTimeout(bail);
                resolve(all.result.filter((item) => item && item.synced === false));
              };
              all.onerror = () => {
                clearTimeout(bail);
                resolve([]);
              };
            };
          } catch {
            clearTimeout(bail);
            resolve([]);
          }
        })
    )
    .catch(() => [] as QueuedReview[]);
}

test.describe("Offline review queue", () => {
  // Pinned to the desktop viewport on every project (including mobile-chrome):
  // at phone widths the fixed bottom bar can overflow and let the transport
  // card intercept the grade buttons.
  test.use({ viewport: { width: 1280, height: 720 } });

  test("queues a grade offline and the service worker syncs it back", async ({
    page,
  }) => {
    test.setTimeout(120_000);

    await signIn(page);
    await page.goto("/reader/1");
    await page.waitForSelector('[dir="rtl"]', { state: "visible", timeout: 15000 });

    // The queue drains through the worker's "sync" handler, so the SW must be
    // active (clients.claim) before the connection is cut.
    const controlled = await page
      .waitForFunction(() => navigator.serviceWorker.controller !== null, { timeout: 10000 })
      .then(() => true)
      .catch(() => false);
    expect(controlled, "service worker should control the page").toBe(true);

    await page.context().setOffline(true);
    await page.getByRole("button", { name: "Good" }).click();

    // handleGrade queues on navigator.onLine === false instead of attempting
    // a dead fetch — the flash states what actually happened.
    await expect(page.locator(".fixed.bottom-40")).toContainText(
      /\bOffline\b — review queued/
    );

    const queued = await readQueueOnce(page);
    expect(queued.length, "grade should be queued in IndexedDB").toBeGreaterThanOrEqual(1);
    expect(queued.some((item) => item.grade === "GOOD")).toBe(true);

    await page.context().setOffline(false);
    // The app registered review-sync while offline; re-registering with
    // connectivity available fires the sync event as soon as the worker wakes.
    // Same registration call the app itself makes.
    await page.evaluate(
      () =>
        navigator.serviceWorker.ready.then((registration) =>
          (
            registration as ServiceWorkerRegistration & {
              sync: { register: (tag: string) => Promise<void> };
            }
          ).sync.register("review-sync")
        )
    );

    // sw.js posts SYNC_COMPLETED (postMessage) only after fetch + markSynced
    // settle for every queued item — the reader renders an emerald ✓ until the
    // 3s SYNC_STATUS_RESET_MS timer hides it, so expect()'s polling catches it.
    await expect(page.locator("span.text-emerald-500:has-text('✓')")).toBeVisible({
      timeout: 25_000,
    });

    // Belt and suspenders: the queue itself should now read synced.
    let items: QueuedReview[] = [];
    for (let i = 0; i < 10; i++) {
      items = await readQueueOnce(page);
      if (items.length > 0 && items.every((item) => item.synced)) break;
      await page.waitForTimeout(500);
    }
    expect(
      items.filter((item) => item.synced).length,
      "synced items should be visible in the queue"
    ).toBeGreaterThanOrEqual(1);
  });
});
