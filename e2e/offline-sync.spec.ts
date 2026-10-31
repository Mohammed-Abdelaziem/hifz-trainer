import { test, expect, signIn } from "./fixtures";
import type { Page } from "@playwright/test";

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

function readAllOnce(page: Page): Promise<Array<{ synced: boolean }>> {
  return page
    .evaluate(
      () =>
        new Promise<Array<{ synced: boolean }>>((resolve) => {
          const bail = setTimeout(() => resolve([]), 2000);
          try {
            const req = indexedDB.open("hifz-offline", 1);
            req.onerror = () => {
              clearTimeout(bail);
              resolve([]);
            };
            req.onsuccess = () => {
              const tx = req.result.transaction("review-queue", "readonly");
              const all = tx.objectStore("review-queue").getAll();
              all.onsuccess = () => {
                clearTimeout(bail);
                // No filter: once the drain marks rows synced, the pending
                // set is empty — only a full scan can observe the flip.
                resolve(all.result.map((item) => ({ synced: Boolean(item?.synced) })));
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
    .catch(() => [] as Array<{ synced: boolean }>);
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
    await expect(page.getByRole("status")).toContainText(
      /\bOffline\b — review queued/
    );

    const queued = await readQueueOnce(page);
    expect(queued.length, "grade should be queued in IndexedDB").toBeGreaterThanOrEqual(1);
    expect(queued.some((item) => item.grade === "GOOD")).toBe(true);

    await page.context().setOffline(false);
    // Background Sync events are permanently disabled in bundled headless
    // shells ("Background Sync is disabled." on sync.register), so the suite
    // nudges the worker through the same drain the "sync" handler runs:
    // postMessage { type: "FORCE_SYNC" } → syncPendingReviews — the identical
    // queue → POST → markSynced → SYNC_* postMessage path. In regular
    // browsers the app's own review-sync registration covers this; the hook
    // is what makes the drain deterministic in CI.
    await page.evaluate(() =>
      navigator.serviceWorker.ready.then((registration) => {
        registration.active?.postMessage({ type: "FORCE_SYNC" });
      })
    );

    // sw.js posts SYNC_COMPLETED (postMessage) only after fetch + markSynced
    // settle for every queued item — the reader renders an emerald ✓ until the
    // 3s SYNC_STATUS_RESET_MS timer hides it, so expect()'s polling catches it.
    await expect(page.locator("span.text-emerald-500:has-text('✓')")).toBeVisible({
      timeout: 25_000,
    });

    // Belt and suspenders: a full store scan shows the drained rows flipped
    // to synced (readQueueOnce only surfaces pending rows, which would be
    // empty here and prove nothing).
    let items: Array<{ synced: boolean }> = [];
    for (let i = 0; i < 10; i++) {
      items = await readAllOnce(page);
      if (items.length > 0 && items.every((item) => item.synced)) break;
      await page.waitForTimeout(500);
    }
    expect(
      items.filter((item) => item.synced).length,
      "synced items should be visible in the queue"
    ).toBeGreaterThanOrEqual(1);
  });
});
