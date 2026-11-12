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

// Estado de conexión real en portada: verifica el acceso al sitio, no solo la red local.
(function detectarEstadoRedPortadaOscar() {
  const indicador = document.getElementById('estadoRedPortada');
  const texto = document.getElementById('estadoRedPortadaTexto');
  if (!indicador || !texto) return;
  let estadoConfirmado = null;
  let enCurso = false;
  let temporizador = null;

  function pintar(enLinea) {
    estadoConfirmado = enLinea;
    indicador.classList.toggle('is-online', enLinea);
    indicador.classList.toggle('is-offline', !enLinea);
    texto.textContent = enLinea ? 'Online' : 'Offline';
  }

  async function comprobar() {
    if (!navigator.onLine) { pintar(false); return false; }
    if (enCurso) return estadoConfirmado === true;
    enCurso = true;
    const controlador = new AbortController();
    const limite = window.setTimeout(() => controlador.abort(), 5000);
    try {
      const destino = new URL('./index.html', window.location.href);
      destino.searchParams.set('__connection_check', String(Date.now()));
      const respuesta = await fetch(destino.href, {
        method: 'GET', cache: 'no-store', credentials: 'same-origin', redirect: 'follow',
        headers: { 'Cache-Control': 'no-cache' }, signal: controlador.signal
      });
      pintar(navigator.onLine && respuesta.ok);
      return estadoConfirmado;
    } catch (error) {
      pintar(false);
      return false;
    } finally {
      window.clearTimeout(limite);
      enCurso = false;
    }
  }

  function detener() { window.clearInterval(temporizador); temporizador = null; }
  function iniciar() {
    detener();
    if (document.visibilityState === 'hidden') return;
    comprobar();
    temporizador = window.setInterval(() => {
      if (document.visibilityState === 'visible') comprobar();
    }, 20000);
  }

  function pintarOffline() { pintar(false); }
  function controlarVisibilidad() {
    if (document.visibilityState === 'hidden') detener();
    else iniciar();
  }
  // Evita acumular listeners si la inicialización vuelve a ejecutarse.
  window.removeEventListener('online', iniciar);
  window.removeEventListener('offline', pintarOffline);
  document.removeEventListener('visibilitychange', controlarVisibilidad);
  window.removeEventListener('pagehide', detener);
  window.removeEventListener('pageshow', iniciar);
  window.addEventListener('online', iniciar);
  window.addEventListener('offline', pintarOffline);
  document.addEventListener('visibilitychange', controlarVisibilidad);
  window.addEventListener('pagehide', detener);
  window.addEventListener('pageshow', iniciar);
  iniciar();
})();

// Registro del Service Worker estándar indicado por la guía PWA Offline-First.
(function registrarOfflineOscar() {
  if (!('serviceWorker' in navigator) || location.protocol !== 'https:') return;
  const registrar = async () => {
    try {
      const registro = await navigator.serviceWorker.register('./sw.js', {
        scope: './',
        updateViaCache: 'none'
      });
      console.info('Service Worker PWA registrado con éxito:', registro.scope);
    } catch (error) {
      console.error('Fallo en el registro del Service Worker:', error);
    }
  };
  if (document.readyState === 'complete') registrar();
  else window.addEventListener('load', registrar, { once: true });
})();

