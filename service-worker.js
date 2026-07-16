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
   activado por defecto.

   v21: se agrega un chequeo rápido de molestias antes de entrenar
   (arquero): antes del calentamiento, se puede marcar con chips qué
   zona duele hoy (tobillo, rodilla, muñeca, etc.) y la app muestra un
   consejo práctico por zona (vendaje/muñequera, bajar intensidad,
   cuándo consultar a un profesional). Lo marcado ahí también prioriza
   la elongación al final de esa misma sesión. Se puede desactivar
   desde Ajustes → Entrenamiento; va activado por defecto.

   v22: se agregan más zonas al chequeo de molestias (dedo, pie/planta,
   cuello, costillas/torso, codo) y un campo de texto libre para lo que
   no esté en la lista — intenta matchear con una zona conocida y si no,
   da un consejo general (bajar intensidad, hielo, cuándo consultar a
   un profesional). Se pueden agregar varias y quitarlas con la ×.

   v23: ajuste visual — se saca el emoji de curita 🩹 repetido en cada
   chip del chequeo de molestias (quedaba recargado) y se varían los
   íconos de esa sección para que no se repitan tanto.

   v24: se agrega "cabeza" como zona propia en el chequeo de molestias
   (antes caía en el consejo genérico) con aviso sobre golpes/posible
   conmoción. Además se reescribe el consejo genérico del texto libre:
   antes arrancaba diciendo "no tenemos consejo específico" y sonaba
   inútil; ahora va directo al consejo práctico.

   v25: se saca el ícono (○/✓) de los chips del chequeo de molestias,
   queda solo el nombre de la parte del cuerpo.

   v26: se saca el campo de texto libre del chequeo de molestias (el
   consejo genérico no aportaba lo suficiente). Queda solo la
   selección por chips con las zonas ya cargadas.

   v27: en el test físico inicial se agrega una pregunta sobre
   condiciones de salud (cardíaca u otra) a tener en cuenta; si se
   marca, el resultado muestra un aviso recomendando consultar a un
   médico antes de repetir pruebas de esfuerzo máximo y qué señales
   de alarma frenar el entrenamiento. Además, el resultado ahora
   detecta el punto más flojo del test (ej. salto) y recomienda
   ejercicios de arquero puntuales para esa capacidad, con un botón
   para agregarlos directo a la próxima sesión.

   v28: los ejercicios con formato "X series x Y reps" ahora tienen
   un contador de series dentro de la sesión ("Serie 1/3", "2/3"...).
   Al terminar una serie que no es la última, se dispara un descanso
   corto (10/15/20s) en vez del descanso grande de entre-ejercicios,
   que sigue apareciendo recién cuando se completan todas las series.

   v29: se agrega una categoría nueva a Arquero, "Preparación Física"
   (FIS), con 6 ejercicios: sprints cortos, saltos pliométricos,
   flexiones explosivas, plancha con rotación, dominadas/remo con
   banda, y sentadilla búlgara. Se suma también una plantilla rápida
   "Preparación Física". El test físico inicial ahora recomienda
   estos ejercicios puntuales según el punto flojo detectado (antes
   usaba ejercicios de arco como aproximación, ahora son específicos
   de esa capacidad). La categoría nueva entra sola en el radar de
   atributos y en el cálculo de nivel (OVR) del arquero, sin tocar
   código aparte de sumarla a la lista de categorías.

   v30: fix importante — el archivo tenía varios cierres de comentario
   sueltos a la mitad del bloque de notas (entre v26 y v29), lo
   que rompía la sintaxis de todo el archivo. Un service worker con
   error de sintaxis no se instala, así que las versiones v27, v28 y
   v29 probablemente nunca llegaron a activarse en los dispositivos
   ya instalados por más que se subiera el HTML nuevo. Con este fix
   el archivo vuelve a ser JavaScript válido. */

const CACHE_NAME = 'arqueroplus-v30';
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
