// Change the FIRST line to force an update
// Service Worker for Shenbury - EMERGENCY KILL SWITCH v5
const CACHE_NAME = 'shenbury-v5-no-cache';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

// TEMPORARILY DISABLE ALL CACHING
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request));
});
