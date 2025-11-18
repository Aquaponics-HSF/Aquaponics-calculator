const CACHE_NAME = 'aquaponics-calculator-v1';
const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'icon-192-full.png',
  'icon-512-full.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) {
        fetch(request).then(response => {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, response.clone());
          });
        });
        return cached;
      }

      return fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('index.html'));
    })
  );
});
