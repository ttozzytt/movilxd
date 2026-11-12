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

// Detector de Internet real para la portada.
// La prueba usa destinos externos y no consulta Cache Storage ni navigator.onLine.
(function detectarInternetPortadaOscar() {
  const indicador = document.getElementById('estadoRedPortada');
  const texto = document.getElementById('estadoRedPortadaTexto');
  if (!indicador || !texto) return;

  const destinos = [
    'https://www.gstatic.com/generate_204',
    'https://www.cloudflare.com/cdn-cgi/trace',
    'https://www.msftconnecttest.com/connecttest.txt'
  ];
  let estadoConfirmado = null;
  let enCurso = false;
  let revision = 0;
  let controladores = [];
  let temporizador = null;

  function pintar(enLinea) {
    estadoConfirmado = enLinea;
    indicador.classList.toggle('is-online', enLinea);
    indicador.classList.toggle('is-offline', !enLinea);
    indicador.classList.remove('is-checking');
    texto.textContent = enLinea ? 'Online' : 'Offline';
  }

  function programarSiguiente() {
    window.clearTimeout(temporizador);
    // Reintenta más seguido cuando está Offline para detectar la vuelta de Wi-Fi/datos.
    temporizador = window.setTimeout(comprobar, estadoConfirmado ? 15000 : 5000);
  }

  async function comprobar() {
    if (enCurso || document.visibilityState === 'hidden') return;
    enCurso = true;
    const revisionActual = ++revision;
    controladores = destinos.map(() => new AbortController());

    const pruebas = destinos.map((destino, indice) => {
      const controlador = controladores[indice];
      const limite = window.setTimeout(() => controlador.abort(), 3500);
      const url = new URL(destino);
      url.searchParams.set('_oscar_ping', `${Date.now()}-${revisionActual}-${indice}`);
      return fetch(url.href, {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-store',
        credentials: 'omit',
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        signal: controlador.signal
      }).then(respuesta => {
        // En no-cors la respuesta normal es opaca; que fetch resuelva sin redirección
        // demuestra que hubo respuesta de Internet. Un portal cautivo redirigido no cuenta.
        if (respuesta.redirected) throw new Error('La conexión fue redirigida a un portal.');
        if (respuesta.type === 'opaque' || respuesta.ok) return true;
        throw new Error('El destino de conectividad no respondió correctamente.');
      }).finally(() => window.clearTimeout(limite));
    });

    try {
      await Promise.any(pruebas);
      if (revisionActual === revision) pintar(true);
    } catch (error) {
      if (revisionActual === revision) pintar(false);
    } finally {
      controladores.forEach(controlador => controlador.abort());
      if (revisionActual === revision) {
        controladores = [];
        enCurso = false;
        programarSiguiente();
      }
    }
  }

  function reiniciar() {
    window.clearTimeout(temporizador);
    revision++;
    controladores.forEach(controlador => controlador.abort());
    controladores = [];
    enCurso = false;
    comprobar();
  }

  function detener() {
    window.clearTimeout(temporizador);
    revision++;
    controladores.forEach(controlador => controlador.abort());
    controladores = [];
    enCurso = false;
  }

  window.addEventListener('online', reiniciar);
  window.addEventListener('offline', reiniciar);
  window.addEventListener('pageshow', reiniciar);
  window.addEventListener('pagehide', detener);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') detener();
    else reiniciar();
  });

  texto.textContent = 'Comprobando...';
  indicador.classList.add('is-checking');
  indicador.classList.remove('is-online', 'is-offline');
  comprobar();
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

