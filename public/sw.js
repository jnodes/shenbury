// Service Worker for Shenbury - Fixed Version with Cache Bust
const CACHE_NAME = 'shenbury-v4'; // CHANGED FROM v3 to v4 - THIS IS IMPORTANT!
const urlsToCache = [
  '/',
  '/index.html'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting(); // Force immediate activation
});

// Fetch handler with proper error handling
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip non-HTTP requests
  if (!event.request.url.startsWith('http')) return;

  // Parse URL
  const requestURL = new URL(event.request.url);

  // Skip external domains (CDNs) - DO NOT CACHE EXTERNAL RESOURCES
  if (requestURL.origin !== location.origin) {
    // Let external requests go through normally without caching
    event.respondWith(fetch(event.request));
    return;
  }

  // Handle local requests
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Always fetch fresh HTML files to avoid cache issues
        if (event.request.url.endsWith('.html') || event.request.url.endsWith('/')) {
          return fetch(event.request).then(response => {
            // Update cache with fresh version
            if (response && response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, responseToCache);
              });
            }
            return response;
          }).catch(() => {
            // If offline, return cached version
            return response || new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
        }

        // For non-HTML resources, use cache-first strategy
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
          // For other failures, return offline message
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
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service worker activated with cache:', CACHE_NAME);
      return self.clients.claim();
    })
  );
});
