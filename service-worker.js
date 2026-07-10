/* ARQUERO+ — Service Worker
   Cachea la app la primera vez que se abre con conexión, y después
   la sirve desde caché aunque no haya internet. Si cambiás el HTML,
   subí también un CACHE_NAME nuevo (ej. 'v2') para forzar la
   actualización del caché en los dispositivos de los usuarios.

   Nota: el login con Google (Firebase) y el guardado en la nube
   necesitan internet SÍ o SÍ. Sin conexión, la app sigue funcionando
   con el progreso guardado localmente en el dispositivo. */

const CACHE_NAME = 'arqueroplus-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        ASSETS_TO_CACHE.map(url =>
          cache.add(url).catch(err => console.warn('No se pudo cachear', url, err))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // Los pedidos a Firebase/Google (login, base de datos en la nube) van
  // directo a la red, no los cacheamos: necesitan estar siempre frescos
  // y requieren conexión real.
  if (event.request.url.includes('googleapis.com') ||
      event.request.url.includes('gstatic.com') ||
      event.request.url.includes('firebaseio.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      const networkFetch = fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
