const APP_VERSION = "__APP_VERSION__";
const CACHE_PREFIX = "shared-lists-static";
const LEGACY_CACHE_PREFIX = "shared-lists-shell";
const CACHE_NAME = `${CACHE_PREFIX}-${APP_VERSION}`;
const STATIC_ASSETS = [
  `/app.js?v=${APP_VERSION}`,
  `/styles.css?v=${APP_VERSION}`,
  "/manifest.webmanifest",
  "/apple-touch-icon.png",
  "/icons/apple-touch-icon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/shared-lists-icon.svg",
  "/offline.html",
];
const STATIC_ASSET_URLS = new Set(STATIC_ASSETS.map((asset) => new URL(asset, self.location.origin).href));

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                (key.startsWith(CACHE_PREFIX) || key.startsWith(LEGACY_CACHE_PREFIX)) && key !== CACHE_NAME,
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;
  if (request.mode === "navigate") return;

  if (url.pathname === "/" || url.pathname === "/index.html" || url.pathname === "/service-worker.js") return;

  if (!STATIC_ASSET_URLS.has(url.href)) return;
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    }),
  );
});
