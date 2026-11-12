/*
 * Service Worker de Oscar Calle — PWA Offline-First.
 * Guarda páginas, estilos, scripts, imágenes, manifest e iconos en Cache Storage.
 * La cola IndexedDB queda conservada hasta disponer de un endpoint real para enviarla.
 */
'use strict';

const CACHE_OSCAR = 'oscar-movilxd-offline-first-v6';
const RUTA_BASE_OSCAR = self.registration.scope;
const JQUERY_OSCAR = 'https://code.jquery.com/jquery-3.6.0.min.js';
const RECURSOS_OSCAR = [
  './',
  './index.html',
  './index.css',
  './index.js',
  './pwa.html',
  './pwa.css',
  './pwa.js',
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
  './imagenes/skatepark.webp'
];

// Déjalo vacío mientras no exista un servidor/API que reciba los formularios.
// Ejemplo de configuración futura: './api/registros' (debe existir realmente).
const ENDPOINT_SINCRONIZACION_OSCAR = '';
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
  // La prueba de Internet debe ir a la red; si se respondiera desde caché,
  // indicaría Online incluso cuando el dispositivo ya perdió conexión.
  if (url.searchParams.has('__connection_check')) return;
  const esMismoOrigen = url.origin === self.location.origin;
  const esJQuery = url.href === JQUERY_OSCAR;
  if (!esMismoOrigen && !esJQuery) return;

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

  // No se envían datos personales a servicios de prueba ni a destinos inventados.
  // La cola se conserva y se informa al usuario hasta configurar su backend real.
  if (!ENDPOINT_SINCRONIZACION_OSCAR) {
    await avisarClientesOscar('OSCAR_SYNC_SIN_ENDPOINT', 'Los registros siguen guardados en este dispositivo. Falta configurar el servidor receptor.');
    return;
  }

  for (const registro of pendientes) {
    const respuesta = await fetch(new URL(ENDPOINT_SINCRONIZACION_OSCAR, RUTA_BASE_OSCAR), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ idLocal: registro.id, creadoEn: registro.creadoEn, ...registro.datos })
    });
    if (!respuesta.ok) throw new Error('El servidor rechazó el registro (' + respuesta.status + ').');
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
