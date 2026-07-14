self.addEventListener("install", () => {
  console.log("[SW] Installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW] Activated");
  event.waitUntil(clients.claim());
});

self.addEventListener("fetch", () => {
  // Network only - no cache for dynamic content
});
