"use strict";

// La portada muestra primero el HTML. Después de 500 ms se conectan
// los eventos de las fotografías al DOM que ya está cargado.
(function hidratarPortadaOscar() {
  const portada = document.querySelector('.entry-page-gallery');
  const visor = document.getElementById('entryLightbox');
  const imagen = document.getElementById('entryLightboxImage');
  const texto = document.getElementById('entryLightboxCaption');
  const cerrar = document.getElementById('entryLightboxClose');
  if (!portada || !visor || !imagen || !texto || !cerrar) return;

  function abrirFoto(ruta, descripcion) {
    imagen.src = ruta;
    imagen.alt = descripcion || 'Fotografía personal de Oscar';
    texto.textContent = descripcion || '';
    visor.classList.add('open');
    visor.setAttribute('aria-hidden', 'false');
    cerrar.focus();
  }

  function cerrarFoto() {
    visor.classList.remove('open');
    visor.setAttribute('aria-hidden', 'true');
    imagen.removeAttribute('src');
  }

  function manejarClicPortada(evento) {
    const foto = evento.target.closest('[data-foto-ampliar]');
    if (!foto || !portada.contains(foto)) return;
    abrirFoto(foto.dataset.fotoAmpliar, foto.dataset.fotoDescripcion);
  }

  function manejarTecla(evento) {
    if (evento.key === 'Escape' && visor.classList.contains('open')) cerrarFoto();
  }

  function hidratarControlesPortada() {
    if (portada.dataset.hidratado === 'true') return;
    // Un listener delegado permite abrir cualquier fotografía de la portada.
    portada.removeEventListener('click', manejarClicPortada);
    portada.addEventListener('click', manejarClicPortada);
    cerrar.removeEventListener('click', cerrarFoto);
    cerrar.addEventListener('click', cerrarFoto);
    visor.addEventListener('click', evento => {
      if (evento.target === visor) cerrarFoto();
    }, { once: false });
    document.removeEventListener('keydown', manejarTecla);
    document.addEventListener('keydown', manejarTecla);
    portada.querySelectorAll('button[data-hidratado="false"]').forEach(boton => {
      boton.disabled = false;
      boton.dataset.hidratado = 'true';
    });
    cerrar.disabled = false;
    cerrar.dataset.hidratado = 'true';
    portada.dataset.hidratado = 'true';
    console.info('Hidratación de portada completada:', portada.querySelectorAll('button[data-hidratado="true"]').length, 'botones.');
  }

  let temporizadorPortada = null;
  function programarHidratacion() {
    if (portada.dataset.hidratado === 'true') return;
    window.clearTimeout(temporizadorPortada);
    temporizadorPortada = window.setTimeout(hidratarControlesPortada, 500);
  }
  programarHidratacion();
  window.addEventListener('pagehide', () => window.clearTimeout(temporizadorPortada), { once: true });
  window.addEventListener('pageshow', evento => {
    if (evento.persisted && portada.dataset.hidratado !== 'true') programarHidratacion();
  });
})();

// Modo sin conexión: el Service Worker está incluido dentro de pwa.js.
(function registrarOfflineOscar() {
  if (!('serviceWorker' in navigator) || location.protocol !== 'https:') return;
  const registrar = async () => {
    try {
      // Retira únicamente la versión antigua que usaba un sw.js separado.
      const registros = await navigator.serviceWorker.getRegistrations();
      const anteriores = registros.filter(registro => {
        const trabajador = registro.active || registro.waiting || registro.installing;
        return trabajador && new URL(trabajador.scriptURL).pathname.endsWith('/sw.js');
      });
      if (anteriores.length) {
        await Promise.all(anteriores.map(registro => registro.unregister()));
        const nombresCache = await caches.keys();
        await Promise.all(nombresCache.filter(nombre => /oscar|movilxd/i.test(nombre)).map(nombre => caches.delete(nombre)));
      }
      const registro = await navigator.serviceWorker.register('./pwa.js?worker=oscar-offline-v2', {
        scope: './', updateViaCache: 'none'
      });
      console.info('Almacenamiento offline registrado:', registro.scope);
    } catch (error) {
      console.warn('No se pudo activar el modo offline:', error);
    }
  };
  if (document.readyState === 'complete') registrar();
  else window.addEventListener('load', registrar, { once: true });
})();
