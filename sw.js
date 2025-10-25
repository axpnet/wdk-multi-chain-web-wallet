// Minimal service worker for WDK Wallet
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Optional: basic fetch passthrough (no caching)
self.addEventListener('fetch', () => {
  // Let the network handle requests
});
