(() => {

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

// DATOS LOCALES: IndexedDB conserva la cola incluso si se cierra el navegador.
// Nunca se almacenan la contraseña ni su confirmación.
const BASE_DATOS_OSCAR = 'oscar-pwa-datos-locales';
const ALMACEN_COLA_OSCAR = 'cola-registros';

function abrirBaseDatosOscar() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('Este navegador no ofrece IndexedDB.'));
      return;
    }
    const solicitud = indexedDB.open(BASE_DATOS_OSCAR, 1);
    solicitud.onupgradeneeded = () => {
      const base = solicitud.result;
      if (!base.objectStoreNames.contains(ALMACEN_COLA_OSCAR)) {
        const almacen = base.createObjectStore(ALMACEN_COLA_OSCAR, { keyPath: 'id', autoIncrement: true });
        almacen.createIndex('estado', 'estado', { unique: false });
      }
    };
    solicitud.onsuccess = () => resolve(solicitud.result);
    solicitud.onerror = () => reject(solicitud.error || new Error('No se pudo abrir IndexedDB.'));
    solicitud.onblocked = () => reject(new Error('La base local está bloqueada por otra pestaña.'));
  });
}

async function guardarRegistroPendienteOscar(datos) {
  const base = await abrirBaseDatosOscar();
  return new Promise((resolve, reject) => {
    const transaccion = base.transaction(ALMACEN_COLA_OSCAR, 'readwrite');
    let identificador = null;
    const solicitud = transaccion.objectStore(ALMACEN_COLA_OSCAR).add({
      creadoEn: new Date().toISOString(),
      estado: 'pendiente',
      datos
    });
    solicitud.onsuccess = () => { identificador = solicitud.result; };
    transaccion.oncomplete = () => { base.close(); resolve(identificador); };
    transaccion.onerror = () => { base.close(); reject(transaccion.error || new Error('Falló el guardado local.')); };
    transaccion.onabort = () => { base.close(); reject(transaccion.error || new Error('Se canceló el guardado local.')); };
  });
}

async function contarRegistrosPendientesOscar() {
  const base = await abrirBaseDatosOscar();
  return new Promise((resolve, reject) => {
    const transaccion = base.transaction(ALMACEN_COLA_OSCAR, 'readonly');
    let cantidad = 0;
    const solicitud = transaccion.objectStore(ALMACEN_COLA_OSCAR).count();
    solicitud.onsuccess = () => { cantidad = solicitud.result; };
    transaccion.oncomplete = () => { base.close(); resolve(cantidad); };
    transaccion.onerror = () => { base.close(); reject(transaccion.error || new Error('Falló la consulta local.')); };
    transaccion.onabort = () => { base.close(); reject(transaccion.error || new Error('Se canceló la consulta local.')); };
  });
}


async function programarSincronizacionRegistrosOscar() {
  if (!('serviceWorker' in navigator)) return false;
  try {
    const registro = await navigator.serviceWorker.ready;
    if (registro.sync && typeof registro.sync.register === 'function') {
      await registro.sync.register('oscar-registros-pendientes');
      return true;
    }
  } catch (error) {
    console.warn('No se pudo programar la sincronización en segundo plano:', error);
  }
  return false;
}

let estadoRedConfirmadoOscar = null;
let comprobacionRedEnCursoOscar = false;
let temporizadorEstadoRedOscar = null;

function actualizarEstadoRedOscar(enLinea, mostrarMensaje = false) {
  const cambioEstado = estadoRedConfirmadoOscar !== enLinea;
  estadoRedConfirmadoOscar = enLinea;
  $('#estadoRedEstado').toggleClass('is-online', enLinea).toggleClass('is-offline', !enLinea);
  $('#estadoRedTexto').text(enLinea ? 'Online' : 'Offline');
  $('#estadoRedSidebar').text(enLinea ? 'Con conexión a Internet' : 'Modo offline · datos locales');
  const color = enLinea ? '#76d6a0' : '#f59b55';
  $('#estadoRedIndicador, #estadoRedPunto').css({ background: color, boxShadow: `0 0 0 4px ${enLinea ? 'rgba(118,214,160,.1)' : 'rgba(245,155,85,.14)'}` });

  if (!mostrarMensaje || !cambioEstado) return;
  if (!enLinea) {
    mostrarAvisoOscar('Sin acceso a Internet. La página y sus recursos guardados siguen disponibles.');
    return;
  }
  contarRegistrosPendientesOscar().then(cantidad => {
    if (cantidad > 0) {
      programarSincronizacionRegistrosOscar();
      mostrarAvisoOscar(`Internet recuperado. Hay ${cantidad} registro(s) local(es) pendiente(s); falta configurar un servidor para enviarlos.`);
    } else {
      mostrarAvisoOscar('Conexión a Internet recuperada. La aplicación está en línea.');
    }
  }).catch(() => mostrarAvisoOscar('Conexión a Internet recuperada.'));
}

async function comprobarConexionRealOscar(mostrarMensaje = false) {
  if (!navigator.onLine) {
    actualizarEstadoRedOscar(false, mostrarMensaje);
    return false;
  }
  if (comprobacionRedEnCursoOscar) return estadoRedConfirmadoOscar === true;
  comprobacionRedEnCursoOscar = true;
  const controlador = new AbortController();
  const limite = window.setTimeout(() => controlador.abort(), 5000);
  try {
    const destino = new URL('./index.html', window.location.href);
    destino.searchParams.set('__connection_check', String(Date.now()));
    const respuesta = await fetch(destino.href, {
      method: 'GET', cache: 'no-store', credentials: 'same-origin', redirect: 'follow',
      headers: { 'Cache-Control': 'no-cache' }, signal: controlador.signal
    });
    const enLinea = navigator.onLine && respuesta.ok;
    actualizarEstadoRedOscar(enLinea, mostrarMensaje);
    return enLinea;
  } catch (error) {
    actualizarEstadoRedOscar(false, mostrarMensaje);
    return false;
  } finally {
    window.clearTimeout(limite);
    comprobacionRedEnCursoOscar = false;
  }
}

function detenerMonitoreoRedOscar() {
  window.clearInterval(temporizadorEstadoRedOscar);
  temporizadorEstadoRedOscar = null;
}

function iniciarMonitoreoRedOscar() {
  detenerMonitoreoRedOscar();
  if (document.visibilityState === 'hidden') return;
  comprobarConexionRealOscar(false);
  temporizadorEstadoRedOscar = window.setInterval(() => {
    if (document.visibilityState === 'visible') comprobarConexionRealOscar(false);
  }, 20000);
}

function hidratarDetectorRedOscar() {
  $(window)
    .off('online.oscarRed offline.oscarRed')
    .on('online.oscarRed', () => comprobarConexionRealOscar(true))
    .on('offline.oscarRed', () => actualizarEstadoRedOscar(false, true));
  $(document)
    .off('visibilitychange.oscarRed')
    .on('visibilitychange.oscarRed', () => {
      if (document.visibilityState === 'hidden') detenerMonitoreoRedOscar();
      else iniciarMonitoreoRedOscar();
    });
  iniciarMonitoreoRedOscar();
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

// Persistencia de preferencias no sensibles (filtros y búsquedas) con LocalStorage.
// No se guarda información personal escrita en el formulario.
const CLAVE_PREFERENCIAS_OSCAR = 'oscar-pwa-preferencias-v1';
function hidratarPersistenciaLocalOscar() {
  const selectorCambios = '#areaSelect, #moduleSelect, #genreSelect, #artistSelect';
  const selectorBusquedas = '#musicSearch, #gameSearch';
  const guardarPreferencias = () => {
    const estado = {
      area: $('#areaSelect').val() || '',
      modulo: $('#moduleSelect').val() || '',
      genero: $('#genreSelect').val() || '',
      artista: $('#artistSelect').val() || '',
      busquedaMusica: $('#musicSearch').val() || '',
      busquedaJuegos: $('#gameSearch').val() || ''
    };
    try {
      localStorage.setItem(CLAVE_PREFERENCIAS_OSCAR, JSON.stringify(estado));
    } catch (error) {
      console.warn('No se pudieron guardar las preferencias locales:', error);
    }
  };

  $(document)
    .off('change.oscarPersistencia', selectorCambios)
    .on('change.oscarPersistencia', selectorCambios, guardarPreferencias)
    .off('input.oscarPersistencia', selectorBusquedas)
    .on('input.oscarPersistencia', selectorBusquedas, guardarPreferencias);

  let estado = {};
  try {
    estado = JSON.parse(localStorage.getItem(CLAVE_PREFERENCIAS_OSCAR) || '{}') || {};
  } catch (error) {
    console.warn('No se pudieron leer las preferencias locales:', error);
  }

  if (estado.area) {
    $('#areaSelect').val(estado.area).trigger('change');
    if (estado.modulo) $('#moduleSelect').val(estado.modulo).trigger('change');
  }
  if (estado.genero) {
    $('#genreSelect').val(estado.genero).trigger('change');
    if (estado.artista) $('#artistSelect').val(estado.artista).trigger('change');
  }
  if (estado.busquedaMusica) $('#musicSearch').val(estado.busquedaMusica).trigger('input');
  if (estado.busquedaJuegos) $('#gameSearch').val(estado.busquedaJuegos).trigger('input');
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
      const formulario = this;
      // La cola conserva solo campos de contacto; jamás almacena contraseñas.
      const registroLocal = {
        nombre: $('#fullName').val().trim(),
        correo: $('#email').val().trim(),
        celular: $('#phone').val().trim(),
        fechaNacimiento: $('#birthDate').val(),
        mensaje: $('#message').val().trim()
      };
      $('#formStatus').text('Guardando el registro en este dispositivo…').attr('class', 'form-status');
      guardarRegistroPendienteOscar(registroLocal).then(() => {
        programarSincronizacionRegistrosOscar();
        const mensaje = navigator.onLine
          ? 'Validación correcta. Registro guardado localmente y pendiente de envío: todavía no hay un servidor configurado. La contraseña no se almacenó.'
          : 'Validación correcta. Registro guardado localmente y pendiente de envío al recuperar la conexión. La contraseña no se almacenó.';
        $('#formStatus').text(mensaje).attr('class', 'form-status success');
        formulario.reset();
        $('#charCount').text('0 / 200');
        campos.concat(['terms']).forEach(idCampo => {
          $('#' + idCampo).closest('.form-field').removeClass('invalid');
          $('#err-' + idCampo).text('');
        });
        mostrarAvisoOscar('Registro guardado localmente. Quedó en la cola pendiente.');
      }).catch(error => {
        console.error('No se pudo guardar el registro local:', error);
        $('#formStatus').text('No se pudo guardar localmente. Tus datos siguen en el formulario; intenta nuevamente.').attr('class', 'form-status error');
        mostrarAvisoOscar('No se pudo guardar el registro en este dispositivo.');
      });
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
  hidratarPersistenciaLocalOscar();
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
  hidratarDetectorRedOscar();
});

// Limpieza de temporizadores al salir. Los listeners delegados se registran
// con .off() antes de .on(); no se eliminan aquí para no romper el regreso desde bfcache.
$(window)
  .off('pagehide.oscarLimpieza')
  .on('pagehide.oscarLimpieza', function () {
    window.clearTimeout(temporizadorHidratacionOscar);
    window.clearTimeout(temporizadorAvisoOscar);
    detenerMonitoreoRedOscar();
  });

// Si el navegador restaura la página desde bfcache antes de hidratarla,
// vuelve a programar la hidratación pendiente una sola vez.
$(window)
  .off('pageshow.oscarRehidratar')
  .on('pageshow.oscarRehidratar', function (event) {
    iniciarMonitoreoRedOscar();
    const $contenedor = $('#contenedorMenu');
    if (event.originalEvent && event.originalEvent.persisted && $contenedor.attr('data-hidratado') !== 'true') {
      window.clearTimeout(temporizadorHidratacionOscar);
      temporizadorHidratacionOscar = window.setTimeout(hidratarInterfazOscar, 500);
    }
  });


// Registro del Service Worker estándar solicitado en la guía del ingeniero.
(function registrarOfflineOscar() {
  if (!('serviceWorker' in navigator) || location.protocol !== 'https:') return;
  const registrar = async () => {
    try {
      const registro = await navigator.serviceWorker.register('./sw.js', {
        scope: './',
        updateViaCache: 'none'
      });
      console.info('Service Worker PWA registrado con éxito:', registro.scope);
      const cantidad = await contarRegistrosPendientesOscar().catch(() => 0);
      if (cantidad > 0) programarSincronizacionRegistrosOscar();
    } catch (error) {
      console.error('Fallo en el registro del Service Worker:', error);
    }
  };
  if (document.readyState === 'complete') registrar();
  else window.addEventListener('load', registrar, { once: true });
})();

// Respuestas del Service Worker sobre el estado de la cola local.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', event => {
    if (!event.data) return;
    if (event.data.tipo === 'OSCAR_SYNC_SIN_ENDPOINT') {
      $('#formStatus').text('Tus datos siguen guardados en este dispositivo. Para enviarlos falta configurar el servidor receptor.').attr('class', 'form-status');
    } else if (event.data.tipo === 'OSCAR_SYNC_COMPLETADA') {
      mostrarAvisoOscar('Los registros pendientes se sincronizaron correctamente.');
    }
  });
}

})();
