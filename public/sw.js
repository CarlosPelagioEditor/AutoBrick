// AutoBrick Service Worker
const CACHE_NAME = 'autobrick-v1.3.0';

self.addEventListener('install', (event) => {
  // Activate new service worker immediately without waiting
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[SW] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Network-first strategy for dynamic & API calls, Stale-while-revalidate for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass service worker for API endpoints and version check to always get fresh data
  if (url.pathname.startsWith('/api/') || url.pathname === '/version.json') {
    event.respondWith(fetch(event.request));
    return;
  }

  // Normal request handling
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
