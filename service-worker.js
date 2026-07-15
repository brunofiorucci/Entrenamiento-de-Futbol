/* ARQUERO+ — Service Worker
   Cachea la app la primera vez que se abre con conexión, y después
   la sirve desde caché aunque no haya internet. Si cambiás el HTML,
   subí también un CACHE_NAME nuevo (ej. 'v2') para forzar la
   actualización del caché en los dispositivos de los usuarios.

   Nota: el login con Google (Firebase) y el guardado en la nube
   necesitan internet SÍ o SÍ. Sin conexión, la app sigue funcionando
   con el progreso guardado localmente en el dispositivo.

   v8: agrega el aviso de "racha en riesgo" (variante del recordatorio
   diario que avisa antes si tenés una racha de días entrenando y hoy
   todavía no cargaste sesión). No cambia el comportamiento del SW en
   sí, pero fuerza a los dispositivos a bajar la versión nueva del HTML.

   v12: agrega el minijuego de reflejos "Atajá el Remate" en la pestaña
   Entrenar (solo posición Arquero). Bump de versión para forzar la
   actualización del HTML en los dispositivos ya instalados.

   v13: fix de UX en el minijuego — el amague (pelota que no hay que
   tocar) ahora es mucho más distinguible (rojo fuerte + ✕), porque
   antes se confundía con un remate real y parecía "no contar" los
   toques rápidos cuando en realidad estaba penalizando correctamente
   haber tocado un amague.

   v14: se agregan 3 niveles de dificultad (Fácil/Medio/Difícil) al
   minijuego de reflejos, más un nivel secreto "Leyenda" que se
   desbloquea al promediar 500ms o menos (con 75%+ de precisión) en
   Difícil. Además, jugar el minijuego con buena precisión ahora suma
   al atributo de Reflejos (REF) en la carta del arquero.

   v15: el aporte del minijuego al atributo de Reflejos (REF) ahora es
   un sistema de puntos acumulados en vez de +1 directo por partida:
   hacen falta 10 puntos para subir 1 punto real del atributo, y cada
   dificultad pesa distinto (Fácil=1, Medio=2, Difícil=3, Leyenda=4),
   para que la carta no se infle jugando un par de veces.

   v16: fix de balance en Medio y Difícil del minijuego de reflejos —
   la ventana de reacción se achicaba demasiado rápido (llegaba a su
   piso mínimo ya en el remate 9-10), haciendo que pareciera que el
   arco "se ponía en contra" solo. Se suaviza la curva en esos dos
   niveles; Fácil queda igual.

   v17: en la biblioteca de ejercicios de Arquero, cada ejercicio
   ahora indica si se puede hacer solo, si necesita un compañero, o
   si admite ambas modalidades, con un filtro nuevo para elegir eso
   además del filtro de categoría existente.

   v18: durante una sesión de entrenamiento en curso, cada ejercicio
   ahora tiene el mismo botón "i" que en la biblioteca para ver su
   descripción completa (cómo se hace), sin tener que salir de la
   sesión ni perder el progreso marcado.

   v19: al marcar un ejercicio como terminado durante la sesión (y si
   todavía quedan ejercicios pendientes), se abre automáticamente el
   temporizador de descanso (30/60/90s) en vez de tener que abrirlo a
   mano con el botón ⏱. Al desmarcar un ejercicio no se abre. Sigue
   sonando/vibrando al terminar la cuenta regresiva, como ya hacía.

   v20: se agrega un calentamiento previo específico de Arquero (6
   movimientos cortos, ~4-5 min) que aparece antes de cada sesión,
   con checklist e info de cada movimiento. Se puede saltar en el
   momento o desactivar del todo desde Ajustes → Entrenamiento. Va
   activado por defecto. */

const CACHE_NAME = 'arqueroplus-v20';
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

// Recordatorio diario de entrenamiento: al tocar la notificación,
// enfoca una pestaña de la app ya abierta o abre una nueva.
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});
