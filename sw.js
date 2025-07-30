const CACHE_NAME = 'ai-outfit-v8';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests and external resources
  if (event.request.method !== 'GET' ||
      url.hostname.includes('api.open-meteo.com') ||
      url.hostname.includes('image.pollinations.ai') ||
      url.protocol === 'chrome-extension:' ||
      url.protocol === 'chrome:' ||
      url.protocol === 'moz-extension:' ||
      url.protocol === 'safari-extension:' ||
      url.pathname.includes('.well-known') ||
      url.hostname !== location.hostname) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
}); 