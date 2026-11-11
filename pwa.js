/*
 * El mismo pwa.js cumple dos funciones:
 * 1) En el navegador ejecuta la aplicación jQuery.
 * 2) En segundo plano funciona como Service Worker para el modo offline.
 * Así se mantienen exactamente seis archivos de código, sin vendor ni sw.js adicional.
 */
(function iniciarProyectoOscar() {
  const contextoServiceWorker =
    typeof ServiceWorkerGlobalScope !== 'undefined' &&
    self instanceof ServiceWorkerGlobalScope;

  if (contextoServiceWorker) {
    'use strict';
    const CACHE_OSCAR = 'oscar-movilxd-seis-offline-v2';
    const BASE_OSCAR = self.registration.scope;
    const JQUERY_OSCAR = 'https://code.jquery.com/jquery-3.6.0.min.js';
    const RECURSOS_OSCAR = [
      './',
      './index.html',
      './index.css',
      './index.js',
      './pwa.html',
      './pwa.css',
      './pwa.js',
      './imagenes/retrato-verde.webp',
      './imagenes/retrato-blanco-negro.webp',
      './imagenes/selfie-espejo.webp',
      './imagenes/skate-detalle.webp',
      './imagenes/skatepark.webp',
      './imagenes/atardecer.webp',
      './imagenes/playa.webp',
      './imagenes/fogata.webp'
    ];

    self.addEventListener('install', event => {
      event.waitUntil((async () => {
        const cache = await caches.open(CACHE_OSCAR);
        // Guardar los recursos propios del proyecto.
        for (const ruta of RECURSOS_OSCAR) {
          const url = new URL(ruta, BASE_OSCAR).href;
          const respuesta = await fetch(new Request(url, { cache: 'reload' }));
          if (!respuesta.ok) throw new Error('No se pudo guardar ' + ruta + ' (' + respuesta.status + ')');
          await cache.put(url, respuesta);
        }
        // Guardar jQuery del CDN como respuesta opaca para que también esté disponible offline.
        try {
          const solicitudJQuery = new Request(JQUERY_OSCAR, { mode: 'no-cors', cache: 'reload' });
          const respuestaJQuery = await fetch(solicitudJQuery);
          if (respuestaJQuery.ok || respuestaJQuery.type === 'opaque') {
            await cache.put(solicitudJQuery, respuestaJQuery);
          }
        } catch (error) {
          console.warn('jQuery no pudo guardarse para offline; se intentará cargar online:', error);
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
      const esJQuery = url.href === JQUERY_OSCAR;
      if (url.origin !== self.location.origin && !esJQuery) return;

      if (solicitud.mode === 'navigate') {
        event.respondWith((async () => {
          try {
            const respuesta = await fetch(solicitud);
            if (respuesta && respuesta.ok) {
              const cache = await caches.open(CACHE_OSCAR);
              await cache.put(solicitud, respuesta.clone());
            }
            return respuesta;
          } catch (error) {
            const cache = await caches.open(CACHE_OSCAR);
            const guardada = await cache.match(solicitud, { ignoreSearch: true, ignoreVary: true });
            if (guardada) return guardada;
            const destino = url.pathname.endsWith('/pwa.html') ? 'pwa.html' : 'index.html';
            return (await cache.match(new URL(destino, BASE_OSCAR).href)) ||
              new Response('Abre esta página una vez con Internet para guardarla y usarla offline.', {
                status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' }
              });
          }
        })());
        return;
      }

      event.respondWith((async () => {
        const cache = await caches.open(CACHE_OSCAR);
        const guardada = await cache.match(solicitud, { ignoreSearch: true, ignoreVary: true });
        if (guardada) return guardada;
        try {
          const respuesta = await fetch(solicitud);
          if (respuesta && (respuesta.ok || respuesta.type === 'opaque')) {
            await cache.put(solicitud, respuesta.clone());
          }
          return respuesta;
        } catch (error) {
          return new Response('', { status: 504, statusText: 'Recurso no disponible offline' });
        }
      })());
    });
    return;
  }

  // ===== Código normal de la aplicación web (solo contexto de navegador) =====
'use strict';

// Vistas que existen en pwa.html.
const vistasOscar = ['inicio', 'perfil', 'rutina', 'favoritos', 'contacto'];
const nombresVistasOscar = {
  inicio: 'Inicio', perfil: 'Sobre mí', rutina: 'Mi rutina',
  favoritos: 'Favoritos', contacto: 'Formulario'
};

function mostrarVistaOscar(nombreVista) {
  if (!vistasOscar.includes(nombreVista)) return;
  const nuevaVista = document.getElementById('view-' + nombreVista);
  const vistaActual = document.querySelector('.view.active');
  const nombreActual = vistaActual ? vistaActual.id.replace('view-', '') : '';
  if (!nuevaVista) return;

  if (nombreActual !== nombreVista) {
    document.querySelectorAll('.view').forEach(vista => {
      vista.classList.remove('active', 'slide-from-left', 'slide-from-right');
    });
    nuevaVista.classList.add('active');
    if (nombreActual) {
      const avanza = vistasOscar.indexOf(nombreVista) > vistasOscar.indexOf(nombreActual);
      const claseMovimiento = avanza ? 'slide-from-right' : 'slide-from-left';
      nuevaVista.classList.add(claseMovimiento);
      nuevaVista.addEventListener('animationend', () => nuevaVista.classList.remove(claseMovimiento), { once: true });
    }
  }

  const botonesPorVista = {
    inicio: ['#navInicio', '#mobileInicio', '#bottomInicio'],
    perfil: ['#navPerfil', '#mobilePerfil', '#bottomPerfil'],
    rutina: ['#navRutina', '#mobileRutina', '#bottomRutina'],
    favoritos: ['#navFavoritos', '#mobileFavoritos', '#bottomFavoritos'],
    contacto: ['#navContacto', '#mobileContacto', '#bottomContacto']
  };
  Object.entries(botonesPorVista).forEach(([vista, selectores]) => {
    selectores.forEach(selector => $(selector).toggleClass('active', vista === nombreVista));
  });
  $('#pageName').text(nombresVistasOscar[nombreVista]);
  $('#mainContent').scrollTop(0);
  history.replaceState(null, '', '#' + nombreVista);
}

function cerrarMenuMovilOscar() {
  $('#mobileMenu').stop(true, true).slideUp(300);
  $('#btnPWA').attr({ 'aria-expanded': 'false', 'aria-label': 'Abrir menú' });
}

function abrirFotoOscar(botonFoto) {
  const $botonFoto = $(botonFoto);
  $('#photoViewerImage').attr({
    src: $botonFoto.attr('data-photo'),
    alt: $botonFoto.find('img').attr('alt') || 'Fotografía personal de Oscar'
  });
  $('#photoViewerCaption').text($botonFoto.attr('data-caption') || '');
  $('#photoViewer').addClass('open').attr('aria-hidden', 'false');
  $('body').addClass('viewer-open');
}

function cerrarFotoOscar() {
  $('#photoViewer').removeClass('open').attr('aria-hidden', 'true');
  $('#photoViewerImage').attr('src', '');
  $('body').removeClass('viewer-open');
}

function mensajeErrorCampoOscar(idCampo) {
  const valor = $('#' + idCampo).val().trim();
  switch (idCampo) {
    case 'fullName':
      if (!valor) return 'Escribe tu nombre completo.';
      if (valor.length < 3) return 'Debe tener al menos 3 caracteres.';
      if (!/^[\p{L}][\p{L}\s'.-]{1,59}$/u.test(valor)) return 'Usa letras y separadores válidos.';
      return '';
    case 'email':
      if (!valor) return 'El correo es obligatorio.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valor)) return 'Ingresa un correo válido.';
      return '';
    case 'phone':
      if (!valor) return 'El celular es obligatorio.';
      if (!/^\d{8}$/.test(valor)) return 'Ingresa los 8 dígitos del celular.';
      return '';
    case 'birthDate':
      if (!valor) return 'Selecciona tu fecha de nacimiento.';
      if (valor > fechaHoyOscar) return 'La fecha no puede ser futura.';
      return '';
    case 'password':
      if (!valor) return 'La contraseña es obligatoria.';
      if (valor.length < 8) return 'Usa al menos 8 caracteres.';
      if (!/[A-ZÁÉÍÓÚÑ]/.test(valor) || !/[a-záéíóúñ]/.test(valor) || !/\d/.test(valor)) return 'Incluye mayúscula, minúscula y número.';
      return '';
    case 'confirmPassword':
      if (!valor) return 'Repite la contraseña.';
      if (valor !== $('#password').val()) return 'Las contraseñas no coinciden.';
      return '';
    case 'message':
      if (!valor) return 'Escribe un mensaje.';
      if (valor.length < 10) return 'El mensaje debe tener al menos 10 caracteres.';
      if (valor.length > 200) return 'Superaste el máximo de 200 caracteres.';
      return '';
    case 'terms':
      return $('#terms').prop('checked') ? '' : 'Debes aceptar esta condición.';
    default: return '';
  }
}

const fechaAhoraOscar = new Date();
const fechaHoyOscar = new Date(fechaAhoraOscar.getTime() - fechaAhoraOscar.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

function validarCampoOscar(idCampo) {
  const error = mensajeErrorCampoOscar(idCampo);
  const $campo = $('#' + idCampo);
  const $contenedor = $campo.closest('.form-field');
  if ($contenedor.length) $contenedor.toggleClass('invalid', Boolean(error));
  $('#err-' + idCampo).text(error);
  return error === '';
}

let temporizadorAvisoOscar = null;
function mostrarAvisoOscar(mensaje) {
  const $aviso = $('#toast');
  $aviso.text(mensaje).addClass('show');
  window.clearTimeout(temporizadorAvisoOscar);
  temporizadorAvisoOscar = window.setTimeout(() => $aviso.removeClass('show'), 2800);
}

const modulosPorAreaOscar = {
  academico: [{ value: 'web2', label: 'Diseño Web II (SIS-0141)', detail: 'Área académica · UPDS' }],
  desarrollo: [{ value: 'pwa', label: 'Arquitectura PWA', detail: 'Área de desarrollo de software' }]
};

const artistasPorGeneroOscar = {
  rap: ['Neutro Shorty', 'CRO', 'Charles Ans', 'Penyair', 'Lil Peep'],
  trap: ['Lil Xan', 'Ghostemane']
};

// EVENT BUBBLING: el clic del texto o icono sube hasta document.
// Un solo listener delegado atiende todos los enlaces y botones de navegación.
function hidratarDelegacionEventosOscar() {
  $(document)
    .off('click.oscarNavegacion', '[data-vista-navegacion]')
    .on('click.oscarNavegacion', '[data-vista-navegacion]', function (event) {
      event.preventDefault();
      // Las tarjetas también usan este listener: no registramos un segundo clic.
      if (this.matches('.tarjeta-item')) {
        console.info('Event Bubbling: objetivo:', event.target, '| elemento delegado:', this);
      }
      mostrarVistaOscar(this.dataset.vistaNavegacion);
      if (this.dataset.cerrarMenu === 'true') cerrarMenuMovilOscar();
    });

  $(document)
    .off('click.oscarAcciones', '[data-accion-oscar]')
    .on('click.oscarAcciones', '[data-accion-oscar]', function (event) {
      const accion = this.dataset.accionOscar;
      if (accion === 'alternar-menu') {
        const menuAbierto = $('#mobileMenu').is(':visible');
        $('#mobileMenu').stop(true, true).slideToggle(300);
        $(this).attr({ 'aria-expanded': String(!menuAbierto), 'aria-label': menuAbierto ? 'Abrir menú' : 'Cerrar menú' });
      } else if (accion === 'actualizar-pagina') {
        window.location.reload();
      } else if (accion === 'abrir-foto') {
        abrirFotoOscar(this);
      } else if (accion === 'cerrar-foto') {
        cerrarFotoOscar();
      }
    });

  $(document)
    .off('click.oscarCerrarVisor', '#photoViewer')
    .on('click.oscarCerrarVisor', '#photoViewer', function (event) {
      if (event.target === this) cerrarFotoOscar();
    });

  $(window)
    .off('keydown.oscarCerrarVisor')
    .on('keydown.oscarCerrarVisor', function (event) {
      if (event.key === 'Escape') cerrarFotoOscar();
    });
}

function hidratarFiltroTresCapasOscar() {
  $(document)
    .off('change.oscarArea', '#areaSelect')
    .on('change.oscarArea', '#areaSelect', function () {
      const modulos = modulosPorAreaOscar[this.value] || [];
      $('#moduleSelect').empty().append(new Option('Selecciona un módulo', ''));
      modulos.forEach(modulo => $('#moduleSelect').append(new Option(modulo.label, modulo.value)));
      $('#moduleSelect').prop('disabled', modulos.length === 0);
      $('#layerResult').html('<span class="result-icon">✦</span><div><small>RESULTADO</small><strong>Esperando selección</strong><p>Elige un módulo para ver el elemento.</p></div>');
    });

  $(document)
    .off('change.oscarModulo', '#moduleSelect')
    .on('change.oscarModulo', '#moduleSelect', function () {
      const modulos = modulosPorAreaOscar[$('#areaSelect').val()] || [];
      const modulo = modulos.find(item => item.value === this.value);
      if (!modulo) {
        $('#layerResult').html('<span class="result-icon">✦</span><div><small>RESULTADO</small><strong>Esperando selección</strong><p>El resultado aparecerá aquí.</p></div>');
        return;
      }
      $('#layerResult').html('<span class="result-icon">✓</span><div><small>CAPA 3 · ELEMENTO FILTRADO</small><strong>' + modulo.label + '</strong><p>' + modulo.detail + '</p></div>');
    });
}

function hidratarBusquedasOscar() {
  $(document)
    .off('input.oscarBusquedaMusica', '#musicSearch')
    .on('input.oscarBusquedaMusica', '#musicSearch', function () {
      const texto = this.value.trim().toLocaleLowerCase('es');
      let visibles = 0;
      $('#musicList .favorite-row').each(function () {
        const coincide = (this.dataset.search || '').toLocaleLowerCase('es').includes(texto);
        this.hidden = !coincide;
        if (coincide) visibles++;
      });
      $('#musicEmpty').prop('hidden', visibles !== 0);
    });

  $(document)
    .off('input.oscarBusquedaJuegos', '#gameSearch')
    .on('input.oscarBusquedaJuegos', '#gameSearch', function () {
      const texto = this.value.trim().toLocaleLowerCase('es');
      let visibles = 0;
      $('#gameList .game-card').each(function () {
        const coincide = (this.dataset.search || '').toLocaleLowerCase('es').includes(texto);
        this.hidden = !coincide;
        if (coincide) visibles++;
      });
      $('#gameEmpty').prop('hidden', visibles !== 0);
    });
}

function hidratarSeleccionMusicalOscar() {
  $(document)
    .off('change.oscarGenero', '#genreSelect')
    .on('change.oscarGenero', '#genreSelect', function () {
      const $artistas = $('#artistSelect').empty().append(new Option('Selecciona un artista', ''));
      (artistasPorGeneroOscar[this.value] || []).forEach(artista => $artistas.append(new Option(artista, artista)));
      $artistas.prop('disabled', !this.value);
      $('#artistResult').text(this.value ? 'Ahora selecciona un artista.' : 'Selecciona un género para continuar.');
    });

  $(document)
    .off('change.oscarArtista', '#artistSelect')
    .on('change.oscarArtista', '#artistSelect', function () {
      $('#artistResult').text(this.value ? 'Tu selección: ' + this.value : 'Selecciona un artista.');
    });
}

function hidratarValidacionesOscar() {
  const camposSelector = '#personalForm .form-field input, #personalForm textarea';
  $('#birthDate').attr('max', fechaHoyOscar);

  // focusout se delega porque blur no se propaga como un evento normal.
  $(document)
    .off('focusout.oscarValidacion', camposSelector)
    .on('focusout.oscarValidacion', camposSelector, function () {
      validarCampoOscar(this.id);
    });

  $(document)
    .off('input.oscarValidacion', camposSelector)
    .on('input.oscarValidacion', camposSelector, function () {
      if ($(this).closest('.form-field').hasClass('invalid')) validarCampoOscar(this.id);
      if (this.id === 'password' && $('#confirmPassword').val()) validarCampoOscar('confirmPassword');
      if (this.id === 'message') $('#charCount').text(this.value.length + ' / 200');
    });

  $(document)
    .off('change.oscarTerminos', '#terms')
    .on('change.oscarTerminos', '#terms', function () {
      validarCampoOscar('terms');
    });

  $(document)
    .off('submit.oscarFormulario', '#personalForm')
    .on('submit.oscarFormulario', '#personalForm', function (event) {
      event.preventDefault();
      const campos = ['fullName', 'email', 'phone', 'birthDate', 'password', 'confirmPassword', 'message'];
      const resultados = campos.map(validarCampoOscar);
      const terminosValidos = validarCampoOscar('terms');
      const indiceError = resultados.findIndex(resultado => !resultado);
      if (indiceError !== -1 || !terminosValidos) {
        $('#formStatus').text('Revisa los campos marcados antes de continuar.').attr('class', 'form-status error');
        $('#' + (indiceError !== -1 ? campos[indiceError] : 'terms')).trigger('focus');
        return;
      }
      $('#formStatus').text('¡Validación correcta! Los datos pasaron todas las comprobaciones. No se enviaron a un servidor.').attr('class', 'form-status success');
      this.reset();
      $('#charCount').text('0 / 200');
      campos.concat(['terms']).forEach(idCampo => {
        $('#' + idCampo).closest('.form-field').removeClass('invalid');
        $('#err-' + idCampo).text('');
      });
      mostrarAvisoOscar('Formulario validado correctamente.');
    });
}

function marcarControlesHidratadosOscar() {
  // Los botones y enlaces empiezan estáticos/deshabilitados en HTML.
  // Después de conectar los eventos delegados, se activan sin reconstruir el DOM.
  $('button[data-hidratado="false"]').prop('disabled', false).attr('data-hidratado', 'true');
  $('[data-hidratado="false"]').not('button').attr('data-hidratado', 'true');
  $('#personalForm, #areaSelect, #moduleSelect, #genreSelect, #artistSelect, #musicSearch, #gameSearch').attr('data-hidratado', 'true');
}

let temporizadorHidratacionOscar = null;
function hidratarInterfazOscar() {
  const $contenedor = $('#contenedorMenu');
  if (!$contenedor.length || $contenedor.attr('data-hidratado') === 'true') return;

  hidratarDelegacionEventosOscar();
  hidratarFiltroTresCapasOscar();
  hidratarBusquedasOscar();
  hidratarSeleccionMusicalOscar();
  hidratarValidacionesOscar();
  marcarControlesHidratadosOscar();
  $contenedor.attr('data-hidratado', 'true');

  const total = document.querySelectorAll('button[data-hidratado="true"]').length;
  console.info('Hidratación completada:', total, 'botones activados.');
  console.info('Event Bubbling activo: las acciones se atienden mediante delegación desde document.');
}

$(function () {
  // La inicialización ocurre una sola vez. Se conserva el identificador para poder limpiarlo.
  window.clearTimeout(temporizadorHidratacionOscar);
  temporizadorHidratacionOscar = window.setTimeout(hidratarInterfazOscar, 500);
  const vistaInicial = (window.location.hash || '#inicio').replace('#', '');
  mostrarVistaOscar(vistasOscar.includes(vistaInicial) ? vistaInicial : 'inicio');
});

// Limpieza de temporizadores al salir. Los listeners delegados se registran
// con .off() antes de .on(); no se eliminan aquí para no romper el regreso desde bfcache.
$(window)
  .off('pagehide.oscarLimpieza')
  .on('pagehide.oscarLimpieza', function () {
    window.clearTimeout(temporizadorHidratacionOscar);
    window.clearTimeout(temporizadorAvisoOscar);
  });

// Si el navegador restaura la página desde bfcache antes de hidratarla,
// vuelve a programar la hidratación pendiente una sola vez.
$(window)
  .off('pageshow.oscarRehidratar')
  .on('pageshow.oscarRehidratar', function (event) {
    const $contenedor = $('#contenedorMenu');
    if (event.originalEvent && event.originalEvent.persisted && $contenedor.attr('data-hidratado') !== 'true') {
      window.clearTimeout(temporizadorHidratacionOscar);
      temporizadorHidratacionOscar = window.setTimeout(hidratarInterfazOscar, 500);
    }
  });


// Registra el mismo Service Worker cuando se abre pwa.html directamente.
(function registrarOfflineOscar() {
  if (!('serviceWorker' in navigator) || location.protocol !== 'https:') return;
  (async () => {
    try {
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
  })();
})();

})();
