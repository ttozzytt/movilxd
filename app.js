'use strict';

// Vistas existentes en pwa.html.
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

  // Actualiza cada botón de navegación por su ID concreto.
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
  const $visor = $('#photoViewer');
  $('#photoViewerImage').attr({
    src: $botonFoto.attr('data-photo'),
    alt: $botonFoto.find('img').attr('alt') || 'Fotografía personal de Oscar'
  });
  $('#photoViewerCaption').text($botonFoto.attr('data-caption') || '');
  $visor.addClass('open').attr('aria-hidden', 'false');
  $('body').addClass('viewer-open');
}

function cerrarFotoOscar() {
  $('#photoViewer').removeClass('open').attr('aria-hidden', 'true');
  $('#photoViewerImage').attr('src', '');
  $('body').removeClass('viewer-open');
}

function marcarBotonListoOscar(selector) {
  $(selector).prop('disabled', false).attr('data-hidratado', 'true');
}

// Cada botón recibe su propio evento, después se habilita y queda marcado como hidratado.
function hidratarMenuSuperiorOscar() {
  $('#btnPWA').off('click.menuMovil').on('click.menuMovil', function () {
    const menuAbierto = $('#mobileMenu').is(':visible');
    $('#mobileMenu').stop(true, true).slideToggle(300);
    $(this).attr({
      'aria-expanded': String(!menuAbierto),
      'aria-label': menuAbierto ? 'Abrir menú' : 'Cerrar menú'
    });
  });
  marcarBotonListoOscar('#btnPWA');

  $('#btnActualizar').off('click.actualizarPagina').on('click.actualizarPagina', function () {
    window.location.reload();
  });
  marcarBotonListoOscar('#btnActualizar');

  $('#btnIrInicio').off('click.volverInicio').on('click.volverInicio', function () {
    mostrarVistaOscar('inicio');
    cerrarMenuMovilOscar();
  });
  marcarBotonListoOscar('#btnIrInicio');

  $('#enlaceMarcaInicio').off('click.marcaInicio').on('click.marcaInicio', function (event) {
    event.preventDefault();
    mostrarVistaOscar('inicio');
  }).attr('data-hidratado', 'true');
}

function hidratarNavegacionOscar() {
  $('#navInicio').off('click.navLateral').on('click.navLateral', () => mostrarVistaOscar('inicio'));
  $('#navPerfil').off('click.navLateral').on('click.navLateral', () => mostrarVistaOscar('perfil'));
  $('#navRutina').off('click.navLateral').on('click.navLateral', () => mostrarVistaOscar('rutina'));
  $('#navFavoritos').off('click.navLateral').on('click.navLateral', () => mostrarVistaOscar('favoritos'));
  $('#navContacto').off('click.navLateral').on('click.navLateral', () => mostrarVistaOscar('contacto'));
  ['#navInicio','#navPerfil','#navRutina','#navFavoritos','#navContacto'].forEach(marcarBotonListoOscar);

  $('#mobileInicio').off('click.navMovil').on('click.navMovil', () => { mostrarVistaOscar('inicio'); cerrarMenuMovilOscar(); });
  $('#mobilePerfil').off('click.navMovil').on('click.navMovil', () => { mostrarVistaOscar('perfil'); cerrarMenuMovilOscar(); });
  $('#mobileRutina').off('click.navMovil').on('click.navMovil', () => { mostrarVistaOscar('rutina'); cerrarMenuMovilOscar(); });
  $('#mobileFavoritos').off('click.navMovil').on('click.navMovil', () => { mostrarVistaOscar('favoritos'); cerrarMenuMovilOscar(); });
  $('#mobileContacto').off('click.navMovil').on('click.navMovil', () => { mostrarVistaOscar('contacto'); cerrarMenuMovilOscar(); });
  ['#mobileInicio','#mobilePerfil','#mobileRutina','#mobileFavoritos','#mobileContacto'].forEach(marcarBotonListoOscar);

  $('#bottomInicio').off('click.navInferior').on('click.navInferior', () => mostrarVistaOscar('inicio'));
  $('#bottomPerfil').off('click.navInferior').on('click.navInferior', () => mostrarVistaOscar('perfil'));
  $('#bottomRutina').off('click.navInferior').on('click.navInferior', () => mostrarVistaOscar('rutina'));
  $('#bottomFavoritos').off('click.navInferior').on('click.navInferior', () => mostrarVistaOscar('favoritos'));
  $('#bottomContacto').off('click.navInferior').on('click.navInferior', () => mostrarVistaOscar('contacto'));
  ['#bottomInicio','#bottomPerfil','#bottomRutina','#bottomFavoritos','#bottomContacto'].forEach(marcarBotonListoOscar);
}

function hidratarAccesosDeInicioOscar() {
  $('#btnConoceme').off('click.accesoInicio').on('click.accesoInicio', () => mostrarVistaOscar('perfil'));
  $('#btnMisGustos').off('click.accesoInicio').on('click.accesoInicio', () => mostrarVistaOscar('favoritos'));
  $('#btnTarjetaTiempoLibre').off('click.accesoInicio').on('click.accesoInicio', () => mostrarVistaOscar('perfil'));
  $('#btnTarjetaGustos').off('click.accesoInicio').on('click.accesoInicio', () => mostrarVistaOscar('favoritos'));
  $('#btnTarjetaMeta').off('click.accesoInicio').on('click.accesoInicio', () => mostrarVistaOscar('perfil'));
  $('#btnInteresesPerfil').off('click.accesoInicio').on('click.accesoInicio', () => mostrarVistaOscar('perfil'));
  ['#btnConoceme','#btnMisGustos','#btnTarjetaTiempoLibre','#btnTarjetaGustos','#btnTarjetaMeta','#btnInteresesPerfil'].forEach(marcarBotonListoOscar);
}

function hidratarGaleriaOscar() {
  $('#btnFotoSkateInicio').off('click.foto').on('click.foto', function () { abrirFotoOscar(this); });
  $('#btnFotoAtardecerInicio').off('click.foto').on('click.foto', function () { abrirFotoOscar(this); });
  $('#btnFotoPlayaInicio').off('click.foto').on('click.foto', function () { abrirFotoOscar(this); });
  $('#btnFotoRetratoPerfil').off('click.foto').on('click.foto', function () { abrirFotoOscar(this); });
  $('#btnFotoPlayaPerfil').off('click.foto').on('click.foto', function () { abrirFotoOscar(this); });
  $('#btnFotoSkateDetalle').off('click.foto').on('click.foto', function () { abrirFotoOscar(this); });
  $('#btnFotoSkateparkRutina').off('click.foto').on('click.foto', function () { abrirFotoOscar(this); });
  $('#btnFotoAtardecerRutina').off('click.foto').on('click.foto', function () { abrirFotoOscar(this); });
  $('#btnFotoFogataRutina').off('click.foto').on('click.foto', function () { abrirFotoOscar(this); });
  [
    '#btnFotoSkateInicio','#btnFotoAtardecerInicio','#btnFotoPlayaInicio',
    '#btnFotoRetratoPerfil','#btnFotoPlayaPerfil','#btnFotoSkateDetalle',
    '#btnFotoSkateparkRutina','#btnFotoAtardecerRutina','#btnFotoFogataRutina'
  ].forEach(marcarBotonListoOscar);

  $('#btnCerrarFoto').off('click.cerrarFoto').on('click.cerrarFoto', cerrarFotoOscar);
  marcarBotonListoOscar('#btnCerrarFoto');

  $('#photoViewer').off('click.fondoFoto').on('click.fondoFoto', function (event) {
    if (event.target === this) cerrarFotoOscar();
  });
  $(window).off('keydown.teclaFoto').on('keydown.teclaFoto', function (event) {
    if (event.key === 'Escape') cerrarFotoOscar();
  });
}

const modulosPorAreaOscar = {
  academico: [{ value: 'web2', label: 'Diseño Web II (SIS-0141)', detail: 'Área académica · UPDS' }],
  desarrollo: [{ value: 'pwa', label: 'Arquitectura PWA', detail: 'Área de desarrollo de software' }]
};

function hidratarFiltroTresCapasOscar() {
  $('#areaSelect').off('change.filtroTresCapas').on('change.filtroTresCapas', function () {
    const areaElegida = this.value;
    const modulos = modulosPorAreaOscar[areaElegida] || [];
    $('#moduleSelect').empty().append(new Option('Selecciona un módulo', ''));
    modulos.forEach(modulo => $('#moduleSelect').append(new Option(modulo.label, modulo.value)));
    $('#moduleSelect').prop('disabled', modulos.length === 0);
    $('#layerResult').html('<span class="result-icon">✦</span><div><small>RESULTADO</small><strong>Esperando selección</strong><p>Elige un módulo para ver el elemento.</p></div>');
  });
  $('#moduleSelect').off('change.filtroTresCapas').on('change.filtroTresCapas', function () {
    const modulos = modulosPorAreaOscar[$('#areaSelect').val()] || [];
    const moduloElegido = modulos.find(modulo => modulo.value === this.value);
    if (!moduloElegido) {
      $('#layerResult').html('<span class="result-icon">✦</span><div><small>RESULTADO</small><strong>Esperando selección</strong><p>El resultado aparecerá aquí.</p></div>');
      return;
    }
    $('#layerResult').html('<span class="result-icon">✓</span><div><small>CAPA 3 · ELEMENTO FILTRADO</small><strong>' + moduloElegido.label + '</strong><p>' + moduloElegido.detail + '</p></div>');
  });
  $('#areaSelect, #moduleSelect').attr('data-hidratado', 'true');
}

function hidratarBusquedasOscar() {
  $('#musicSearch').off('input.busquedaMusica').on('input.busquedaMusica', function () {
    const texto = this.value.trim().toLocaleLowerCase('es');
    let visibles = 0;
    $('#musicList .favorite-row').each(function () {
      const coincide = this.dataset.search.toLocaleLowerCase('es').includes(texto);
      this.hidden = !coincide;
      if (coincide) visibles++;
    });
    $('#musicEmpty').prop('hidden', visibles !== 0);
  });
  $('#gameSearch').off('input.busquedaJuegos').on('input.busquedaJuegos', function () {
    const texto = this.value.trim().toLocaleLowerCase('es');
    let visibles = 0;
    $('#gameList .game-card').each(function () {
      const coincide = this.dataset.search.toLocaleLowerCase('es').includes(texto);
      this.hidden = !coincide;
      if (coincide) visibles++;
    });
    $('#gameEmpty').prop('hidden', visibles !== 0);
  });
  $('#musicSearch, #gameSearch').attr('data-hidratado', 'true');
}

function hidratarSeleccionMusicalOscar() {
  const artistasPorGenero = {
    rap: ['Neutro Shorty', 'CRO', 'Charles Ans', 'Penyair', 'Lil Peep'],
    trap: ['Lil Xan', 'Ghostemane']
  };
  $('#genreSelect').off('change.generoMusical').on('change.generoMusical', function () {
    const generoElegido = this.value;
    const $artistas = $('#artistSelect').empty().append(new Option('Selecciona un artista', ''));
    (artistasPorGenero[generoElegido] || []).forEach(artista => $artistas.append(new Option(artista, artista)));
    $artistas.prop('disabled', !generoElegido);
    $('#artistResult').text(generoElegido ? 'Ahora selecciona un artista.' : 'Selecciona un género para continuar.');
  });
  $('#artistSelect').off('change.artista').on('change.artista', function () {
    $('#artistResult').text(this.value ? 'Tu selección: ' + this.value : 'Selecciona un artista.');
  });
  $('#genreSelect, #artistSelect').attr('data-hidratado', 'true');
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

function mostrarAvisoOscar(mensaje) {
  const $aviso = $('#toast');
  $aviso.text(mensaje).addClass('show');
  window.clearTimeout(mostrarAvisoOscar.temporizador);
  mostrarAvisoOscar.temporizador = window.setTimeout(() => $aviso.removeClass('show'), 2800);
}

function hidratarFormularioOscar() {
  $('#birthDate').attr('max', fechaHoyOscar);
  const camposOscar = ['fullName', 'email', 'phone', 'birthDate', 'password', 'confirmPassword', 'message'];
  camposOscar.forEach(idCampo => {
    $('#' + idCampo).off('.validacionCampo');
    $('#' + idCampo).on('blur.validacionCampo', () => validarCampoOscar(idCampo));
    $('#' + idCampo).on('input.validacionCampo', function () {
      if ($('#' + idCampo).closest('.form-field').hasClass('invalid')) validarCampoOscar(idCampo);
      if (idCampo === 'password' && $('#confirmPassword').val()) validarCampoOscar('confirmPassword');
    }).attr('data-hidratado', 'true');
  });
  $('#terms').off('.validacionTerminos').on('change.validacionTerminos', () => validarCampoOscar('terms')).attr('data-hidratado', 'true');
  $('#message').off('input.contadorMensaje').on('input.contadorMensaje', function () {
    $('#charCount').text(this.value.length + ' / 200');
  });
  $('#btnValidarFormulario').off('click.validarFormulario').on('click.validarFormulario', function (event) {
    event.preventDefault();
    $('#personalForm').trigger('submit');
  });
  marcarBotonListoOscar('#btnValidarFormulario');

  $('#personalForm').off('submit.validacionFormulario').on('submit.validacionFormulario', function (event) {
    event.preventDefault();
    const resultados = camposOscar.map(validarCampoOscar).concat([validarCampoOscar('terms')]);
    const primerError = camposOscar.find((idCampo, indice) => !resultados[indice]);
    if (primerError || !resultados[resultados.length - 1]) {
      $('#formStatus').text('Revisa los campos marcados antes de continuar.').attr('class', 'form-status error');
      $('#' + (primerError || 'terms')).trigger('focus');
      return;
    }
    $('#formStatus').text('¡Validación correcta! Los datos pasaron todas las comprobaciones. No se enviaron a un servidor.').attr('class', 'form-status success');
    this.reset();
    $('#charCount').text('0 / 200');
    camposOscar.concat(['terms']).forEach(idCampo => {
      $('#' + idCampo).closest('.form-field').removeClass('invalid');
      $('#err-' + idCampo).text('');
    });
    mostrarAvisoOscar('Formulario validado correctamente.');
  });
  $('#personalForm').attr('data-hidratado', 'true');
}

function hidratarInterfazOscar() {
  const $contenedorMenu = $('#contenedorMenu');
  if (!$contenedorMenu.length || $contenedorMenu.attr('data-hidratado') === 'true') return;

  hidratarMenuSuperiorOscar();
  hidratarNavegacionOscar();
  hidratarAccesosDeInicioOscar();
  hidratarGaleriaOscar();
  hidratarFiltroTresCapasOscar();
  hidratarBusquedasOscar();
  hidratarSeleccionMusicalOscar();
  hidratarFormularioOscar();

  $contenedorMenu.attr('data-hidratado', 'true');
  const botonesPendientes = document.querySelectorAll('button[data-hidratado="false"]');
  if (botonesPendientes.length) {
    console.error('Quedaron botones sin hidratar:', Array.from(botonesPendientes).map(boton => boton.id || boton.textContent.trim()));
  } else {
    console.info('Hidratación completada: ' + document.querySelectorAll('button[data-hidratado=\"true\"]').length + ' botones con eventos conectados.');
  }
}

// La vista HTML aparece primero; después de 500 ms JavaScript conecta los eventos al DOM existente.
$(function () {
  window.setTimeout(hidratarInterfazOscar, 500);
});

// La primera pantalla se muestra sin esperar a los eventos; las interacciones se conectan en la hidratación.
const vistaInicialOscar = (window.location.hash || '#inicio').replace('#', '');
mostrarVistaOscar(vistasOscar.includes(vistaInicialOscar) ? vistaInicialOscar : 'inicio');
