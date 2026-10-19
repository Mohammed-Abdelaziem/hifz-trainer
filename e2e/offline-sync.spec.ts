import { test, expect, signIn } from "./fixtures";
import type { Page } from "@playwright/test";

interface QueuedReview {
  id: string;
  verseKey: string;
  grade: string;
  retries: number;
  synced: boolean;
}

/** Mirrors public/sw.js getPendingReviews(), plus the synced flag status. */
function readQueue(page: Page): Promise<QueuedReview[]> {
  return page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const req = indexedDB.open("hifz-offline", 1);
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction("review-queue", "readonly");
          const store = tx.objectStore("review-queue");
          const index = store.index("synced");
          const pending = index.getAll(IDBKeyRange.only(false));
          pending.onsuccess = () => resolve(pending.result);
          pending.onerror = () => reject(pending.error);
        };
      })
  );
}

test.describe("Offline review queue", () => {
  test("queues a grade offline and the service worker syncs it back", async ({
    page,
  }) => {
    test.setTimeout(90_000);

    await signIn(page);
    await page.goto("/reader/1");
    await page.waitForSelector('[dir="rtl"]', { state: "visible", timeout: 15000 });

    // The queue drains through the worker's "sync" handler, so the SW must be
    // active (clients.claim) before the connection is cut.
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null);

    await page.context().setOffline(true);
    await page.getByRole("button", { name: "Good" }).click();

    // handleGrade queues on navigator.onLine === false instead of attempting
    // a dead fetch — the flash states what actually happened.
    await expect(page.locator(".fixed.bottom-40")).toContainText(
      /\bOffline\b — review queued/
    );

    const pending = await readQueue(page);
    expect(pending.length).toBeGreaterThanOrEqual(1);
    expect(pending.some((item) => item.grade === "GOOD")).toBe(true);

    await page.context().setOffline(false);
    // The app registered review-sync while offline; re-registering with
    // connectivity available fires the sync event as soon as the worker
    // re-arms. Same registration call the app itself makes.
    await page.evaluate(() => {
      const registration = navigator.serviceWorker.ready.then((r) =>
        (r as ServiceWorkerRegistration & {
          sync: { register: (tag: string) => Promise<void> };
        }).sync.register("review-sync")
      );
      return registration;
    });

    // sw.js marks each item synced=True once /api/reviews/sync accepted it —
    // that flip is the round trip landing in Postgres, visible from the page.
    let items: QueuedReview[] = [];
    for (let i = 0; i < 30; i++) {
      items = await readQueue(page);
      if (items.length > 0 && items.every((item) => item.synced)) break;
      await page.waitForTimeout(1000);
    }
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(items.every((item) => item.synced)).toBe(true);
  });
});
