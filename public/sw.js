const CACHE_STATIC_NAME = "pj-static-v1";
const CACHE_PAGES_NAME = "pj-pages-v1";

const PRECACHE_ASSETS = [
  "/offline",
  "/favicon.ico",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/logo/Kementerian Pertanian Kementan Logo - Colored - zonalogo.com.svg",
];

// 1. Install Event: Pre-cache offline shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Activate Event: Clean up outdated caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_PAGES_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Fetch Event: Multi-tier caching strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and internal browser extensions
  if (request.method !== "GET" || !url.protocol.startsWith("http")) {
    return;
  }

  // Skip API routes & dynamic data endpoints from service worker caching
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Strategy A: Static Assets (Next.js chunks, fonts, images) -> Cache-First with Network Fallback
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.hostname.includes("fonts.gstatic.com") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/logo/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico");

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_STATIC_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Strategy B: Page Navigations (HTML) -> Network-First with Offline Fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_PAGES_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // If network fails, try matching requested page from cache
          const cachedPage = await caches.match(request);
          if (cachedPage) return cachedPage;

          // Otherwise, fallback to the offline page
          const offlineFallback = await caches.match("/offline");
          if (offlineFallback) return offlineFallback;

          return new Response("Aplikasi sedang offline.", {
            headers: { "Content-Type": "text/html; charset=utf-8" },
          });
        })
    );
  }
});
