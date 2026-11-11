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

// EVENT BUBBLING: el clic nace en el hijo (por ejemplo, el texto de una tarjeta)
// y sube hasta document. Un solo escuchador delegado atiende todas las tarjetas.
function hidratarDelegacionEventosOscar() {
  $(document)
    .off('click.oscarTarjetas', '.tarjeta-item')
    .on('click.oscarTarjetas', '.tarjeta-item', function (event) {
      const destino = this.dataset.destinoTarjeta;
      console.info('Event Bubbling: clic en hijo recibido por la tarjeta:', event.target);
      if (destino) mostrarVistaOscar(destino);
    });

  // Un solo escuchador atiende navegación, menú, fotos y acciones de la interfaz.
  $(document)
    .off('click.oscarNavegacion', '[data-vista-navegacion]')
    .on('click.oscarNavegacion', '[data-vista-navegacion]', function (event) {
      event.preventDefault();
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

// Limpieza de listeners y temporizador al abandonar la página.
$(window)
  .off('pagehide.oscarLimpieza')
  .on('pagehide.oscarLimpieza', function () {
    window.clearTimeout(temporizadorHidratacionOscar);
    $(document).off('.oscarTarjetas .oscarNavegacion .oscarAcciones .oscarCerrarVisor .oscarArea .oscarModulo .oscarBusquedaMusica .oscarBusquedaJuegos .oscarGenero .oscarArtista .oscarValidacion .oscarTerminos .oscarFormulario');
    $(window).off('keydown.oscarCerrarVisor');
    window.clearTimeout(temporizadorAvisoOscar);
  });
