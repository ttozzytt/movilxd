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
  let controladorActual = null;
  let revision = 0;

  function pintar(enLinea) {
    estadoConfirmado = enLinea;
    indicador.classList.toggle('is-online', enLinea);
    indicador.classList.toggle('is-offline', !enLinea);
    indicador.classList.remove('is-checking');
    texto.textContent = enLinea ? 'Online' : 'Offline';
  }

  async function comprobar() {
    // navigator.onLine solo es una pista del navegador. La decisión final
    // depende de que el recurso del mismo sitio responda por la red.
    if (enCurso) return estadoConfirmado === true;

    enCurso = true;
    const revisionActual = ++revision;
    const controlador = new AbortController();
    controladorActual = controlador;
    const limite = window.setTimeout(() => controlador.abort(), 8000);

    try {
      const destino = new URL('./manifest.json', document.baseURI || window.location.href);
      destino.searchParams.set('__connection_check', String(Date.now()));
      let respuesta = null;
      try {
        respuesta = await fetch(destino.href, {
          method: 'HEAD',
          cache: 'no-store',
          credentials: 'same-origin',
          redirect: 'follow',
          signal: controlador.signal
        });
      } catch (errorHead) {
        if (controlador.signal.aborted) throw errorHead;
        // Un navegador o servidor puede rechazar HEAD aunque GET esté disponible.
      }

      // Si HEAD no está soportado o falla por el método, se prueba GET en la red.
      if (!respuesta || !respuesta.ok) {
        respuesta = await fetch(destino.href, {
          method: 'GET',
          cache: 'no-store',
          credentials: 'same-origin',
          redirect: 'follow',
          signal: controlador.signal
        });
      }

      const enLinea = revisionActual === revision && respuesta.ok;
      if (revisionActual === revision) pintar(enLinea);
      return enLinea;
    } catch (error) {
      if (revisionActual === revision) pintar(false);
      return false;
    } finally {
      window.clearTimeout(limite);
      if (revisionActual === revision) {
        controladorActual = null;
        enCurso = false;
      }
    }
  }

  function detener() {
    window.clearInterval(temporizador);
    temporizador = null;
    revision++;
    if (controladorActual) controladorActual.abort();
    controladorActual = null;
    enCurso = false;
  }

  function iniciar() {
    window.clearInterval(temporizador);
    temporizador = null;
    if (document.visibilityState === 'hidden') return;
    comprobar();
    temporizador = window.setInterval(() => {
      if (document.visibilityState === 'visible') comprobar();
    }, 20000);
  }

  function alCambiarIndicadorDelNavegador() {
    // online/offline provoca una comprobación nueva; no fija el estado por sí solo.
    revision++;
    if (controladorActual) controladorActual.abort();
    controladorActual = null;
    enCurso = false;
    iniciar();
  }

  function controlarVisibilidad() {
    if (document.visibilityState === 'hidden') detener();
    else iniciar();
  }

  window.removeEventListener('online', alCambiarIndicadorDelNavegador);
  window.removeEventListener('offline', alCambiarIndicadorDelNavegador);
  window.removeEventListener('pagehide', detener);
  window.removeEventListener('pageshow', iniciar);
  document.removeEventListener('visibilitychange', controlarVisibilidad);
  window.addEventListener('online', alCambiarIndicadorDelNavegador);
  window.addEventListener('offline', alCambiarIndicadorDelNavegador);
  window.addEventListener('pagehide', detener);
  window.addEventListener('pageshow', iniciar);
  document.addEventListener('visibilitychange', controlarVisibilidad);
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

