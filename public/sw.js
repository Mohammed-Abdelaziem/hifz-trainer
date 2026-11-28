// v4: /offline, /blog and /quran shells stopped embedding a server-rendered
// session email (SiteHeader hydrates identity via /api/session now), so their
// cached copies are identical for every visitor. Bumping the version purges
// the v3 caches, whose /offline and /quran entries held one user's email and
// would leak it to the next visitor of the same browser.
const VERSION = "hifz-v4";
const SHELL_CACHE = `${VERSION}-shell`;
const STATIC_CACHE = `${VERSION}-static`;
const DATA_CACHE = `${VERSION}-data`;

const SHELL_ASSETS = ["/offline", "/manifest.webmanifest", "/icon.svg"];

const SYNC_TAG = "review-sync";
const SYNC_BATCH_SIZE = 100;
const MAX_SYNC_RETRIES = 5;
const SYNCED_RETENTION_MS = 24 * 60 * 60 * 1000;

self.addEventListener("install", (event) => {
event.waitUntil(
  // addAll is atomic: one failed asset rejects the whole promise and the new
  // worker would never activate, pinning the client to the old one. Settle
  // individually so a single 404 cannot block the update.
  caches
    .open(SHELL_CACHE)
    .then((cache) => Promise.allSettled(SHELL_ASSETS.map((url) => cache.add(url))))
    .then(() => self.skipWaiting())
);
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            // Anything not this version goes, plus STATIC_CACHE which is no
            // longer populated. Left in place it would sit unused forever.
            .filter((k) => !k.startsWith(VERSION) || k === STATIC_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(syncPendingReviews());
  }
});

// Test hook for the offline-sync e2e: bundled headless shells have Background
// Sync permanently disabled, so the suite cannot wait for a sync event. The
// drain itself (syncPendingReviews) is identical to the one the "sync"
// handler runs — post FORCE_SYNC from the page to exercise the same
// queue → POST → markSynced → SYNC_* messages path.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "FORCE_SYNC") {
    event.waitUntil(syncPendingReviews());
  }
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icon") ||
    /\.(woff2?|ttf|css|js|svg|png|jpg|webp|ico)$/.test(url.pathname)
  );
}

function isAyahData(url) {
  return url.origin === self.location.origin && url.pathname === "/api/ayah-data";
}

// Only these routes return identical HTML for every visitor. Anything else
// (dashboard, settings, analytics, reader) embeds the caller's session data,
// and `res.headers.has("set-cookie")` cannot be used to detect that because
// Set-Cookie is a forbidden response header name and never appears in Headers.
// The identical-HTML claim above holds because SiteHeader — the only
// personalized fragment in the layout — receives no server-rendered identity
// anymore; it hydrates via /api/session (never intercepted by this worker).
const CACHEABLE_NAVIGATIONS = ["/offline", "/blog", "/quran"];

function isCacheableNavigation(url) {
  return CACHEABLE_NAVIGATIONS.some(
    (path) => url.pathname === path || url.pathname.startsWith(path + "/")
  );
}

async function networkFirst(request, cacheName, fallbackResponse, shouldCache = isCacheableNavigation) {
  const cache = await caches.open(cacheName);
  const url = new URL(request.url);
  try {
    const res = await fetch(request);
    if (res && res.ok && res.type === "basic" && shouldCache(url)) {
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    const hit = await cache.match(request);
    if (hit) return hit;
    const fallback = await fallbackResponse;
    return fallback ?? Response.error();
  }
}

async function syncPendingReviews() {
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: "window" });
  for (const client of clients) {
    client.postMessage({ type: "SYNC_STARTED" });
  }

  try {
    const allPending = await getPendingReviews();
    const pending = allPending.filter((item) => (item.retries || 0) < MAX_SYNC_RETRIES);
    if (pending.length === 0) {
      for (const client of clients) {
        client.postMessage({ type: "SYNC_COMPLETED", payload: { synced: 0, failed: 0 } });
      }
      return;
    }

    let totalSynced = 0;
    let totalFailed = 0;
    const allResults = [];

    // Chunk to match /api/reviews/sync's MAX_BATCH_SIZE (100) so large offline
    // sessions never deadlock with HTTP 400.
    for (let offset = 0; offset < pending.length; offset += SYNC_BATCH_SIZE) {
      const batch = pending.slice(offset, offset + SYNC_BATCH_SIZE);
      const response = await fetch("/api/reviews/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviews: batch.map((r) => ({
            id: r.id,
            verseKey: r.verseKey,
            grade: r.grade,
            durationMs: r.durationMs,
          })),
        }),
      });
      if (!response.ok) {
        throw new Error(`Sync failed with HTTP ${response.status}`);
      }
      const result = await response.json();
      totalSynced += result.synced ?? 0;
      totalFailed += result.failed ?? 0;
      if (Array.isArray(result.results)) allResults.push(...result.results);

      // Correlate 1:1 by unique item id so duplicate offline reviews of the
      // same verse each receive their own outcome without clobbering each other.
      const byId = new Map(batch.map((item) => [item.id, item]));
      const fallbackByVerseKey = new Map();
      for (const item of batch) {
        const group = fallbackByVerseKey.get(item.verseKey);
        if (group) group.push(item);
        else fallbackByVerseKey.set(item.verseKey, [item]);
      }

      for (const entry of result.results ?? []) {
        if (entry.id && byId.has(entry.id)) {
          if (entry.ok) {
            await markReviewSynced(entry.id);
          } else {
            await incrementReviewRetries(entry.id);
          }
          continue;
        }
        const group = fallbackByVerseKey.get(entry.verseKey);
        const item = group?.shift();
        if (!item) continue;
        if (entry.ok) {
          await markReviewSynced(item.id);
        } else {
          await incrementReviewRetries(item.id);
        }
      }
    }

    await clearSyncedReviews().catch(() => {});

    for (const client of clients) {
      client.postMessage({
        type: "SYNC_COMPLETED",
        payload: { ok: true, synced: totalSynced, failed: totalFailed, results: allResults },
      });
    }
  } catch (error) {
    for (const client of clients) {
      client.postMessage({ type: "SYNC_FAILED", error: error.message });
    }
  }
}

function openOfflineDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("hifz-offline", 1);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("review-queue")) {
        const store = db.createObjectStore("review-queue", { keyPath: "id" });
        store.createIndex("synced", "synced", { unique: false });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function getPendingReviews() {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("review-queue", "readonly");
    const store = tx.objectStore("review-queue");
    // Store-level scan rather than the "synced" index: boolean values are
    // not valid IndexedDB keys, so IDBKeyRange.only(false) on that index
    // threw DataError inside onsuccess and left this promise pending
    // forever — the sync event then retried for eternity and no offline
    // grade ever reached the server. The app copy
    // (src/lib/offline/review-queue.ts) mirrors this fix.
    const req = store.getAll();
    req.onsuccess = () =>
      resolve(req.result.filter((item) => item && item.synced === false));
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => db.close();
    tx.onabort = () => db.close();
  });
}

async function markReviewSynced(id) {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("review-queue", "readwrite");
    const store = tx.objectStore("review-queue");
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const item = getReq.result;
      if (item) {
        item.synced = true;
        store.put(item);
      }
    };
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error ?? new Error("Transaction aborted"));
    };
  });
}

async function incrementReviewRetries(id) {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("review-queue", "readwrite");
    const store = tx.objectStore("review-queue");
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const item = getReq.result;
      if (item) {
        item.retries = (item.retries || 0) + 1;
        store.put(item);
      }
    };
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error ?? new Error("Transaction aborted"));
    };
  });
}

async function clearSyncedReviews(olderThanMs = SYNCED_RETENTION_MS) {
  const cutoff = Date.now() - olderThanMs;
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("review-queue", "readwrite");
    const store = tx.objectStore("review-queue");
    const req = store.openCursor();
    req.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        if (
          cursor.value &&
          cursor.value.synced === true &&
          (cursor.value.timestamp || 0) < cutoff
        ) {
          cursor.delete();
        }
        cursor.continue();
      }
    };
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
    tx.onabort = () => {
      db.close();
      reject(tx.error ?? new Error("Transaction aborted"));
    };
  });
}

function isReviewApi(url) {
  return url.origin === self.location.origin && url.pathname === "/api/reviews";
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" && request.method !== "POST") return;

  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(
      networkFirst(request, SHELL_CACHE, caches.match("/offline"))
    );
    return;
  }

  if (isAyahData(url)) {
    event.respondWith(
      networkFirst(
        request,
        DATA_CACHE,
        new Response(JSON.stringify({ offline: true }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }),
        isAyahData
      )
    );
    return;
  }

  if (isReviewApi(url) && request.method === "POST") {
    event.respondWith(fetch(request));
    return;
  }

  // Deliberately does not intercept /_next/static/. Those URLs are
  // content-hashed and immutable, so the HTTP cache is already the correct
  // layer. Routing them through the SW put a second cache in front of
  // Next's <link rel="preload">, and because a preloaded fetch and a
  // service-worker-intercepted fetch are different "worlds", the browser
  // discarded every preload as unused. It also grew STATIC_CACHE without
  // bound, since nothing evicted it.
  if (
    url.origin === self.location.origin &&
    isStaticAsset(url) &&
    !url.pathname.startsWith("/_next/static/")
  ) {
    event.respondWith(fetch(request));
  }
});
