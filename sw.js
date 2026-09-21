/**
 * Vault Service Worker (Offline PWA Engine)
 * Provides 100% offline functionality via Cache-First strategy
 */

const CACHE_NAME = "vault-cache-v3";

const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.svg",
  "./css/variables.css",
  "./css/reset.css",
  "./css/mobile-app.css",
  "./css/components.css",
  "./css/screens.css",
  "./js/app.js",
  "./js/store.js",
  "./js/screens.js",
  "./js/charts.js",
  "./js/interactions.js",
  "./js/data.js",
  "./assets/avatars/luffy.png",
  "./assets/avatars/zoro.png",
  "./assets/avatars/sanji.png",
  "./assets/avatars/chopper.png",
  "./assets/avatars/law.png",
  "./assets/avatars/ace.png",
  "./assets/avatars/shanks.png",
  "./assets/avatars/nami.png",
];

// Install: Pre-cache all local assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn("Service Worker pre-caching warning:", err);
      })
  );
});

// Activate: Clean up any old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: Cache-First strategy with network fallback
self.addEventListener("fetch", (event) => {
  // Only handle GET requests and http/https schemes
  if (event.request.method !== "GET" || !event.request.url.startsWith("http")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return from cache immediately
        return cachedResponse;
      }

      // If not in cache, fetch from network and optionally cache
      return fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === "basic"
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If network fails (offline) and not in cache, return fallback if navigation
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
        });
    })
  );
});
