self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('meteo')
        .then((cache) => {
          return cache.addAll([
            './',
            'index.html',
            'style.css',
            'main.js',
            'manifest.json',
            'gestionTemps.js',
         ]);
        })
        .then(() => {
          return self.skipWaiting();
        })
    );
  });

  // fetch event
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  });