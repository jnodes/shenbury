// Service Worker for Shenbury - Production Version
const CACHE_NAME = 'shenbury-v2';
const urlsToCache = [
  '/',
  '/index.html',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&display=swap',
  'https://cdn.jsdelivr.net/npm/web3@1.8.0/dist/web3.min.js',
  'https://cdn.ethers.io/lib/ethers-5.7.2.umd.min.js'
];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Try to cache each URL, but don't fail if some aren't available
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(err => 
              console.log(`Failed to cache ${url}:`, err)
            )
          )
        );
      })
  );
  self.skipWaiting();
});

// Cache and return requests
self.addEventListener('fetch', event => {
  // Skip non-http(s) requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request).then(response => {
          // Check if valid response
          if(!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then(cache => {
            // Cache all artifact images
            if (event.request.url.includes('/assets/images/relics/') || 
                event.request.url.includes('.jpg') ||
                event.request.url.includes('.png') ||
                event.request.url.includes('.svg')) {
              cache.put(event.request, responseToCache);
            }
          });

          return response;
        });
      })
  );
});

// Update Service Worker
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
