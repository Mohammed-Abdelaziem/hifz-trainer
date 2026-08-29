const VERSION = "hifz-v1";
const SHELL_CACHE = `${VERSION}-shell`;
const STATIC_CACHE = `${VERSION}-static`;
const AUDIO_CACHE = `${VERSION}-audio`;
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

function isAudio(url) {
  return (
    url.hostname.endsWith("quran.com") ||
    url.hostname.endsWith("everyayah.com")
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
    const response = await fetch("/api/reviews/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();

    for (const client of clients) {
      client.postMessage({ type: "SYNC_COMPLETED", payload: result });
    }
  } catch (error) {
    console.error("Background sync failed:", error);
    for (const client of clients) {
      client.postMessage({ type: "SYNC_FAILED", error: error.message });
    }
  }
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

  if (isAudio(url)) {
    event.respondWith(cacheFirst(request, AUDIO_CACHE));
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
