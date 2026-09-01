const VERSION = "hifz-v1";
const SHELL_CACHE = `${VERSION}-shell`;
const STATIC_CACHE = `${VERSION}-static`;
const DATA_CACHE = `${VERSION}-data`;

const SHELL_ASSETS = ["/offline", "/manifest.webmanifest", "/icon.svg"];

const SYNC_TAG = "review-sync";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === SYNC_TAG) {
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

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res && (res.ok || res.type === "opaque")) {
    cache.put(request, res.clone());
  }
  return res;
}

async function networkFirst(request, cacheName, fallbackResponse) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(request);
    if (res && res.ok && res.type === "basic" && !res.headers.has("set-cookie")) {
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    const hit = await cache.match(request);
    if (hit) return hit;
    return fallbackResponse ?? Response.error();
  }
}

async function syncPendingReviews() {
  const clients = await self.clients.matchAll({ includeUncontrolled: true, type: "window" });
  for (const client of clients) {
    client.postMessage({ type: "SYNC_STARTED" });
  }

  try {
    const pending = await getPendingReviews();
    if (pending.length === 0) {
      for (const client of clients) {
        client.postMessage({ type: "SYNC_COMPLETED", payload: { synced: 0, failed: 0 } });
      }
      return;
    }

    const response = await fetch("/api/reviews/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reviews: pending.map((r) => ({
          verseKey: r.verseKey,
          grade: r.grade,
          durationMs: r.durationMs,
        })),
      }),
    });
    const result = await response.json();

    if (result.synced > 0) {
      for (const item of pending.slice(0, result.synced)) {
        await markReviewSynced(item.id);
      }
    }
    if (result.failed > 0) {
      for (const item of pending.slice(result.synced)) {
        await incrementReviewRetries(item.id);
      }
    }

    for (const client of clients) {
      client.postMessage({ type: "SYNC_COMPLETED", payload: result });
    }
  } catch (error) {
    for (const client of clients) {
      client.postMessage({ type: "SYNC_FAILED", error: error.message });
    }
  }
}

function getPendingReviews() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("hifz-offline", 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("review-queue", "readonly");
      const store = tx.objectStore("review-queue");
      const index = store.index("synced");
      const req = index.getAll(IDBKeyRange.only(false));
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    };
  });
}

function markReviewSynced(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("hifz-offline", 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("review-queue", "readwrite");
      const store = tx.objectStore("review-queue");
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const item = getReq.result;
        if (item) {
          item.synced = true;
          store.put(item);
        }
        resolve();
      };
      getReq.onerror = () => reject(getReq.error);
    };
  });
}

function incrementReviewRetries(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("hifz-offline", 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction("review-queue", "readwrite");
      const store = tx.objectStore("review-queue");
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const item = getReq.result;
        if (item) {
          item.retries = (item.retries || 0) + 1;
          store.put(item);
        }
        resolve();
      };
      getReq.onerror = () => reject(getReq.error);
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
        })
      )
    );
    return;
  }

  if (isReviewApi(url) && request.method === "POST") {
    event.respondWith(
      networkFirst(
        request,
        DATA_CACHE,
        new Response(JSON.stringify({ offline: true, queued: true }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        })
      )
    );
    return;
  }

  if (url.origin === self.location.origin && isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  }
});
