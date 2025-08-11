const CACHE_NAME = 'dog-food-calculator-v1.7';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/icon.svg',
  '/192x192.png',
  '/512x512.png',
  '/manifest.json'
];

// Install event - cache all necessary assets
self.addEventListener('install', event => {
  // Skip waiting to activate the new service worker immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all clients immediately
  event.waitUntil(self.clients.claim());
});

// Fetch event - implement stale-while-revalidate strategy
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        // Return cached response immediately if available
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // Check if we received a valid response
          if (networkResponse && networkResponse.status === 200) {
            // Update the cache with the fresh response
            const responseToCache = networkResponse.clone();
            cache.put(event.request, responseToCache);
            
            // If this is a navigation request and we have a cached version,
            // check if the content has changed
            if (event.request.mode === 'navigate' && response) {
              // Compare the response bodies to detect changes
              Promise.all([
                response.text(),
                networkResponse.text()
              ]).then(([cachedBody, networkBody]) => {
                if (cachedBody !== networkBody) {
                  // Send message to the client about the update
                  self.clients.matchAll().then(clients => {
                    clients.forEach(client => {
                      client.postMessage({ type: 'UPDATE_AVAILABLE' });
                    });
                  });
                }
              });
            }
          }
          return networkResponse;
        }).catch(() => {
          // If network request fails, return cached response if available
          return response || new Response('No internet connection', { status: 503 });
        });

        // Return cached response immediately if available, otherwise wait for network
        return response || fetchPromise;
      });
    })
  );
});

// Listen for message from the page to skip waiting
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
