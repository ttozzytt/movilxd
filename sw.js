/*
 * Service Worker de Oscar Calle — PWA Offline-First.
 * Guarda páginas, estilos, scripts, imágenes, manifest e iconos en Cache Storage.
 * La cola IndexedDB queda conservada hasta disponer de un endpoint real para enviarla.
 */
'use strict';

const CACHE_OSCAR = 'oscar-movilxd-offline-first-v29-personal-database';
const RUTA_BASE_OSCAR = self.registration.scope;
const JQUERY_OSCAR = 'https://code.jquery.com/jquery-3.6.0.min.js';
const ORIGENES_IMAGENES_EXTERNAS_OSCAR = new Set([
  'https://www.rocketleague.com',
  'https://cdn2.unrealengine.com',
  'https://store-images.s-microsoft.com',
  'https://www.vga4a.com',
  'https://cdn.mos.cms.futurecdn.net',
  'https://img.pccomponentes.com',
  'https://www.strafe.com',
  'https://staticg.sportskeeda.com',
  'https://static.actugaming.net',
  'https://thumb.wikimedia.org',
  'https://upload.wikimedia.org',
  'https://tn.com.ar',
  'https://i.blogs.es',
  'https://resizer.glanacion.com',
  'https://snapcalorie-webflow-website.s3.us-east-2.amazonaws.com',
  'https://www.krill.fr',
  'https://static.wixstatic.com'
]);
const RECURSOS_OSCAR = [
  './',
  './index.html',
  './index.css',
  './index.js',
  './pwa.html',
  './pwa.css?v=c3a2-games-gallery-20261121-r2',
  './pwa.js?v=personal-database-20261121-r1',
  './theme.css?v=games-mobile-larger-20261121-r1',
  './js/security-and-vitals.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './imagenes/atardecer.webp',
  './imagenes/fogata.webp',
  './imagenes/playa.webp',
  './imagenes/retrato-blanco-negro.webp',
  './imagenes/retrato-verde.webp',
  './imagenes/selfie-espejo.webp',
  './imagenes/skate-detalle.webp',
  './imagenes/parque-skate.webp'
];

// API real del proyecto Supabase independiente oscar-personal.
const ENDPOINT_SINCRONIZACION_OSCAR = 'https://mjwuhcxwkingmkgofjjl.supabase.co/rest/v1/personal_contact_submissions?on_conflict=request_id';
const CLAVE_PUBLICA_SUPABASE_OSCAR = 'sb_publishable_3q0TpNW92yFZZYKHlOm1Jw_ZKg_-3XT';
const BASE_DATOS_OSCAR = 'oscar-pwa-datos-locales';
const ALMACEN_COLA_OSCAR = 'cola-registros';
const ETIQUETA_SYNC_OSCAR = 'oscar-registros-pendientes';

function claveCacheOscar(url) {
  const normalizada = new URL(url, RUTA_BASE_OSCAR);
  if (normalizada.origin === self.location.origin) normalizada.search = '';
  return normalizada.href;
}

async function guardarRespuestaOscar(cache, solicitud, respuesta) {
  if (!respuesta || (!respuesta.ok && respuesta.type !== 'opaque')) return;
  const clave = claveCacheOscar(solicitud.url || solicitud);
  await cache.put(clave, respuesta.clone());
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_OSCAR);

    // Los recursos del propio proyecto son obligatorios para completar la instalación.
    for (const ruta of RECURSOS_OSCAR) {
      const url = new URL(ruta, RUTA_BASE_OSCAR).href;
      const respuesta = await fetch(new Request(url, { cache: 'reload' }));
      if (!respuesta.ok) {
        throw new Error('No se pudo almacenar ' + ruta + ' (' + respuesta.status + ').');
      }
      await cache.put(claveCacheOscar(url), respuesta);
    }

    // jQuery se guarda como respuesta opaca para poder usarlo offline.
    try {
      const solicitud = new Request(JQUERY_OSCAR, { mode: 'no-cors', cache: 'reload' });
      const respuesta = await fetch(solicitud);
      if (respuesta.ok || respuesta.type === 'opaque') {
        await cache.put(JQUERY_OSCAR, respuesta);
      }
    } catch (error) {
      // La instalación del proyecto no se cancela si el CDN está temporalmente caído.
      console.warn('No se pudo precargar jQuery. Se volverá a intentar cuando haya conexión.', error);
    }

    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const nombres = await caches.keys();
    await Promise.all(nombres
      .filter(nombre => nombre.startsWith('oscar-movilxd-') && nombre !== CACHE_OSCAR)
      .map(nombre => caches.delete(nombre)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const solicitud = event.request;
  if (solicitud.method !== 'GET') return;

  const url = new URL(solicitud.url);
  // Las pruebas de Internet V10 usan destinos externos. Este SW nunca los cachea ni los intercepta.
  // Las rutas locales con el parámetro de prueba también se dejan pasar directamente a la red.
  if (url.searchParams.has('__connection_check')) return;
  // Las fotos de la galería son locales y están precargadas en el app shell.
  const esMismoOrigen = url.origin === self.location.origin;
  const esJQuery = url.href === JQUERY_OSCAR;
  const esImagenExterna = !esMismoOrigen
    && solicitud.destination === 'image'
    && ORIGENES_IMAGENES_EXTERNAS_OSCAR.has(url.origin);
  if (!esMismoOrigen && !esJQuery && !esImagenExterna) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_OSCAR);
    const clave = claveCacheOscar(solicitud.url);
    const guardada = await cache.match(clave, { ignoreSearch: true, ignoreVary: true });

    // OFFLINE-FIRST: se entrega primero la copia local si ya existe.
    if (guardada) return guardada;

    try {
      const respuesta = await fetch(solicitud);
      await guardarRespuestaOscar(cache, solicitud, respuesta);
      return respuesta;
    } catch (error) {
      if (solicitud.mode === 'navigate') {
        const destino = url.pathname.endsWith('/pwa.html') ? 'pwa.html' : 'index.html';
        const respaldo = await cache.match(new URL(destino, RUTA_BASE_OSCAR).href);
        if (respaldo) return respaldo;
      }
      return new Response('Este recurso todavía no está guardado en el dispositivo. Conéctate a Internet y vuelve a abrir la página.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  })());
});

function abrirBaseOscar() {
  return new Promise((resolve, reject) => {
    const solicitud = indexedDB.open(BASE_DATOS_OSCAR, 1);
    solicitud.onupgradeneeded = () => {
      const base = solicitud.result;
      if (!base.objectStoreNames.contains(ALMACEN_COLA_OSCAR)) {
        const almacen = base.createObjectStore(ALMACEN_COLA_OSCAR, { keyPath: 'id', autoIncrement: true });
        almacen.createIndex('estado', 'estado', { unique: false });
      }
    };
    solicitud.onsuccess = () => resolve(solicitud.result);
    solicitud.onerror = () => reject(solicitud.error || new Error('No se pudo abrir la cola local.'));
  });
}

async function obtenerPendientesOscar() {
  const base = await abrirBaseOscar();
  return new Promise((resolve, reject) => {
    const transaccion = base.transaction(ALMACEN_COLA_OSCAR, 'readonly');
    const solicitud = transaccion.objectStore(ALMACEN_COLA_OSCAR).getAll();
    solicitud.onsuccess = () => resolve((solicitud.result || []).filter(registro => registro.estado === 'pendiente'));
    solicitud.onerror = () => reject(solicitud.error || new Error('No se pudo leer la cola local.'));
    transaccion.oncomplete = () => base.close();
    transaccion.onerror = () => { base.close(); reject(transaccion.error); };
  });
}

async function actualizarPendienteOscar(id, datos) {
  const base = await abrirBaseOscar();
  return new Promise((resolve, reject) => {
    const transaccion = base.transaction(ALMACEN_COLA_OSCAR, 'readwrite');
    transaccion.objectStore(ALMACEN_COLA_OSCAR).put({
      id, creadoEn: new Date().toISOString(), estado: 'pendiente', datos
    });
    transaccion.oncomplete = () => { base.close(); resolve(); };
    transaccion.onerror = () => { base.close(); reject(transaccion.error); };
  });
}

async function eliminarPendienteOscar(id) {
  const base = await abrirBaseOscar();
  return new Promise((resolve, reject) => {
    const transaccion = base.transaction(ALMACEN_COLA_OSCAR, 'readwrite');
    transaccion.objectStore(ALMACEN_COLA_OSCAR).delete(id);
    transaccion.oncomplete = () => { base.close(); resolve(); };
    transaccion.onerror = () => { base.close(); reject(transaccion.error); };
  });
}

async function avisarClientesOscar(tipo, detalle = '') {
  const clientes = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  clientes.forEach(cliente => cliente.postMessage({ tipo, detalle }));
}

async function sincronizarColaOscar() {
  const pendientes = await obtenerPendientesOscar();
  if (!pendientes.length) return;

  // Idempotencia por request_id: un reintento no crea un segundo registro.
  for (const registro of pendientes) {
    const datos = registro.datos || {};
    if (!datos.requestId) {
      datos.requestId = crypto.randomUUID();
      datos.acceptedTerms = true;
      await actualizarPendienteOscar(registro.id, datos);
    }
    const payload = {
      request_id: datos.requestId,
      nombre: datos.nombre,
      correo: datos.correo,
      celular: datos.celular,
      fecha_nacimiento: datos.fechaNacimiento,
      mensaje: datos.mensaje,
      accepted_terms: datos.acceptedTerms === true
    };
    const respuesta = await fetch(ENDPOINT_SINCRONIZACION_OSCAR, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': CLAVE_PUBLICA_SUPABASE_OSCAR,
        'Prefer': 'resolution=ignore-duplicates,return=minimal'
      },
      body: JSON.stringify(payload)
    });
    if (!respuesta.ok) {
      const detalle = await respuesta.text().catch(() => '');
      throw new Error('Supabase rechazó el registro (' + respuesta.status + '): ' + detalle);
    }
    await eliminarPendienteOscar(registro.id);
  }

  await avisarClientesOscar('OSCAR_SYNC_COMPLETADA', 'Los registros pendientes fueron recibidos por el servidor.');
}

// Background Sync: se ejecuta cuando el navegador recupera conexión.
self.addEventListener('sync', event => {
  if (event.tag === ETIQUETA_SYNC_OSCAR) {
    event.waitUntil(sincronizarColaOscar());
  }
});

self.addEventListener('message', event => {
  if (event.data && event.data.tipo === 'OSCAR_INTENTAR_SINCRONIZACION') {
    event.waitUntil(sincronizarColaOscar());
  }
});
