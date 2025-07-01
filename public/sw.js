// Service Worker for Shenbury - Fixed Version
const CACHE_NAME = 'shenbury-v3';
const urlsToCache = [
  '/',
  '/index.html'
  // Removed external URLs that were causing failures
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Only cache local files, not external CDNs
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Fetch handler with proper error handling
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip non-HTTP requests
  if (!event.request.url.startsWith('http')) return;

  // Parse URL
  const requestURL = new URL(event.request.url);

  // Skip external domains (CDNs)
  if (requestURL.origin !== location.origin) {
    // Let external requests go through normally
    event.respondWith(fetch(event.request));
    return;
  }

  // Handle local requests
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        // Fetch from network
        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the response for local assets only
          if (event.request.url.includes('/assets/')) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }

          return response;
        }).catch(() => {
          // If fetch fails and it's an image, return placeholder
          if (event.request.destination === 'image') {
            return caches.match('/assets/images/placeholder.jpg');
          }
          // For other failures, return offline page if you have one
          return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// Activate and clean old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});
