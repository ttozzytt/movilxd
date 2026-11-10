'use strict';

const views = ['inicio', 'perfil', 'rutina', 'favoritos', 'contacto'];
const pageLabels = { inicio: 'Inicio', perfil: 'Sobre mí', rutina: 'Mi rutina', favoritos: 'Favoritos', contacto: 'Formulario' };

function showView(name) {
  if (!views.includes(name)) return;

  const nextView = document.getElementById(`view-${name}`);
  const currentView = document.querySelector('.view.active');
  const currentName = currentView ? currentView.id.replace('view-', '') : '';

  // Cambio de pantallas: al avanzar entra desde la derecha; al retroceder, desde la izquierda.
  if (currentName !== name) {
    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('active', 'slide-from-left', 'slide-from-right');
    });

    nextView.classList.add('active');

    if (currentName) {
      const goingForward = views.indexOf(name) > views.indexOf(currentName);
      const animationClass = goingForward ? 'slide-from-right' : 'slide-from-left';
      nextView.classList.add(animationClass);
      nextView.addEventListener('animationend', () => {
        nextView.classList.remove(animationClass);
      }, { once: true });
    }
  }

  document.querySelectorAll('[data-view]').forEach(button => button.classList.toggle('active', button.dataset.view === name));
  document.getElementById('pageName').textContent = pageLabels[name];
  document.getElementById('mainContent').scrollTop = 0;
  history.replaceState(null, '', `#${name}`);
}

// Navegación con delegación de eventos. Se limpia el listener anterior antes de asignarlo.
$(document).ready(function () {
  $(document).off('click', '[data-view]');
  $(document).on('click', '[data-view]', function () {
    showView(this.dataset.view);
    closeMobileMenu();
  });

  $(document).off('click', '[data-go]');
  $(document).on('click', '[data-go]', function () {
    showView(this.dataset.go);
  });

  // Simulación de hidratación: conecta el botón estático con su evento jQuery.
  // Se ejecuta una sola vez y verifica data-hidratado para evitar eventos duplicados.
  function hidratarInterfaz() {
    const $box = $('#contenedorMenu');
    if (!$box.length || $box.attr('data-hidratado') === 'true') return;

    $('#btnPWA')
      .prop('disabled', false)
      .text('☰ Menú Interactivo (Hidratado)')
      .off('click')
      .on('click', function () {
        const $menu = $('#mobileMenu');
        const opening = !$menu.is(':visible');
        $menu.stop(true, true).slideToggle(300);
        $(this).attr({
          'aria-expanded': String(opening),
          'aria-label': opening ? 'Cerrar menú' : 'Abrir menú'
        });
      });

    $box.attr('data-hidratado', 'true');
  }

  // La interfaz se muestra primero estática y se hidrata 500 ms después.
  setTimeout(hidratarInterfaz, 500);
});

function closeMobileMenu() {
  $('#mobileMenu').stop(true, true).slideUp(300);
  $('#btnPWA').attr({ 'aria-expanded': 'false', 'aria-label': 'Abrir menú' });
}
const firstView = location.hash.replace('#', '');
showView(views.includes(firstView) ? firstView : 'inicio');

// Filtro de tres capas: área -> módulo -> resultado (tercera capa).
const modulesByArea = {
  academico: [{ value: 'web2', label: 'Diseño Web II (SIS-0141)', detail: 'Área académica · UPDS' }],
  desarrollo: [{ value: 'pwa', label: 'Arquitectura PWA', detail: 'Área de desarrollo de software' }]
};
const areaSelect = document.getElementById('areaSelect');
const moduleSelect = document.getElementById('moduleSelect');
const layerResult = document.getElementById('layerResult');
$('#areaSelect').off('change.filtro').on('change.filtro', function () {
  const selectedArea = $(this).val();
  $('#moduleSelect').empty().append(new Option('Selecciona un módulo', ''));
  const modules = modulesByArea[selectedArea] || [];
  modules.forEach(module => $('#moduleSelect').append(new Option(module.label, module.value)));
  $('#moduleSelect').prop('disabled', modules.length === 0);
  $('#layerResult').html('<span class="result-icon">✦</span><div><small>RESULTADO</small><strong>Esperando selección</strong><p>Elige un módulo para ver el elemento.</p></div>');
});
$('#moduleSelect').off('change.filtro').on('change.filtro', function () {
  const selected = (modulesByArea[$('#areaSelect').val()] || []).find(module => module.value === $(this).val());
  if (!selected) {
    $('#layerResult').html('<span class="result-icon">✦</span><div><small>RESULTADO</small><strong>Esperando selección</strong><p>El resultado aparecerá aquí.</p></div>');
    return;
  }
  $('#layerResult').html(`<span class="result-icon">✓</span><div><small>CAPA 3 · ELEMENTO FILTRADO</small><strong>${selected.label}</strong><p>${selected.detail}</p></div>`);
});

// Búsqueda local de artistas y videojuegos.
function addSearch(inputId, listId, itemSelector, emptyId) {
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  const empty = document.getElementById(emptyId);
  input.addEventListener('input', () => {
    const query = input.value.trim().toLocaleLowerCase('es');
    let visible = 0;
    list.querySelectorAll(itemSelector).forEach(item => {
      const match = item.dataset.search.toLocaleLowerCase('es').includes(query);
      item.hidden = !match;
      if (match) visible++;
    });
    empty.hidden = visible !== 0;
  });
}
addSearch('musicSearch', 'musicList', '.favorite-row', 'musicEmpty');
addSearch('gameSearch', 'gameList', '.game-card', 'gameEmpty');

// Selección dependiente de género musical -> artista.
const artistsByGenre = {
  rap: ['Neutro Shorty', 'CRO', 'Charles Ans', 'Penyair', 'Lil Peep'],
  trap: ['Lil Xan', 'Ghostemane']
};
const genreSelect = document.getElementById('genreSelect');
const artistSelect = document.getElementById('artistSelect');
const artistResult = document.getElementById('artistResult');
$('#genreSelect').off('change.genero').on('change.genero', function () {
  artistSelect.innerHTML = '<option value="">Selecciona un artista</option>';
  (artistsByGenre[this.value] || []).forEach(artist => artistSelect.add(new Option(artist, artist)));
  artistSelect.disabled = !this.value;
  artistResult.textContent = this.value ? 'Ahora selecciona un artista.' : 'Selecciona un género para continuar.';
});

$('#artistSelect').off('change.genero').on('change.genero', function () {
  artistResult.textContent = this.value ? `Tu selección: ${this.value}` : 'Selecciona un artista.';
});

// Validación del formulario: errores por campo, validación al salir/editar y confirmación local.
const form = document.getElementById('personalForm');
const fieldIds = ['fullName', 'email', 'phone', 'birthDate', 'password', 'confirmPassword', 'message', 'terms'];
const status = document.getElementById('formStatus');
const today = new Date();
const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
document.getElementById('birthDate').max = localToday;

function getError(id) {
  const value = document.getElementById(id).value.trim();
  switch (id) {
    case 'fullName':
      if (!value) return 'Escribe tu nombre completo.';
      if (value.length < 3) return 'Debe tener al menos 3 caracteres.';
      if (!/^[\p{L}][\p{L}\s'.-]{1,59}$/u.test(value)) return 'Usa letras y separadores válidos.';
      return '';
    case 'email':
      if (!value) return 'El correo es obligatorio.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return 'Ingresa un correo válido.';
      return '';
    case 'phone':
      if (!value) return 'El celular es obligatorio.';
      if (!/^\d{8}$/.test(value)) return 'Ingresa los 8 dígitos del celular.';
      return '';
    case 'birthDate':
      if (!value) return 'Selecciona tu fecha de nacimiento.';
      if (value > localToday) return 'La fecha no puede ser futura.';
      return '';
    case 'password':
      if (!value) return 'La contraseña es obligatoria.';
      if (value.length < 8) return 'Usa al menos 8 caracteres.';
      if (!/[A-ZÁÉÍÓÚÑ]/.test(value) || !/[a-záéíóúñ]/.test(value) || !/\d/.test(value)) return 'Incluye mayúscula, minúscula y número.';
      return '';
    case 'confirmPassword':
      if (!value) return 'Repite la contraseña.';
      if (value !== document.getElementById('password').value) return 'Las contraseñas no coinciden.';
      return '';
    case 'message':
      if (!value) return 'Escribe un mensaje.';
      if (value.length < 10) return 'El mensaje debe tener al menos 10 caracteres.';
      if (value.length > 200) return 'Superaste el máximo de 200 caracteres.';
      return '';
    case 'terms':
      return document.getElementById('terms').checked ? '' : 'Debes aceptar esta condición.';
    default: return '';
  }
}
function validateField(id) {
  const field = document.getElementById(id);
  const error = getError(id);
  const wrapper = field.closest('.form-field');
  if (wrapper) wrapper.classList.toggle('invalid', Boolean(error));
  const message = document.getElementById(`err-${id}`);
  if (message) message.textContent = error;
  if (id === 'terms') document.getElementById('err-terms').textContent = error;
  return !error;
}
fieldIds.forEach(id => {
  const $element = $(`#${id}`);
  const eventName = id === 'terms' ? 'change' : 'blur';

  // Limpia eventos de validación anteriores antes de volver a registrarlos.
  $element.off('.validacion');
  $element.on(`${eventName}.validacion`, () => validateField(id));

  if (id !== 'terms') {
    $element.on('input.validacion', () => {
      if ($element.closest('.form-field').hasClass('invalid')) validateField(id);
      if (id === 'password' && $('#confirmPassword').val()) validateField('confirmPassword');
    });
  }
});

$('#message').off('input.contador').on('input.contador', function () {
  $('#charCount').text(`${this.value.length} / 200`);
});

// El formulario también limpia el evento submit previo para evitar duplicaciones.
$(form).off('submit.validacion').on('submit.validacion', event => {
  event.preventDefault();
  const checks = fieldIds.map(validateField);
  const firstInvalid = fieldIds.find((id, index) => !checks[index]);
  if (firstInvalid) {
    status.textContent = 'Revisa los campos marcados antes de continuar.';
    status.className = 'form-status error';
    document.getElementById(firstInvalid).focus();
    return;
  }
  status.textContent = '¡Validación correcta! Los datos pasaron todas las comprobaciones. No se enviaron a un servidor.';
  status.className = 'form-status success';
  form.reset();
  document.getElementById('charCount').textContent = '0 / 200';
  fieldIds.forEach(id => {
    const field = document.getElementById(id);
    const wrapper = field.closest('.form-field');
    if (wrapper) wrapper.classList.remove('invalid');
    const error = document.getElementById(`err-${id}`);
    if (error) error.textContent = '';
  });
  showToast('Formulario validado correctamente.');
});

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2800);
}


// Galería de fotos: al tocar una imagen se abre en grande.
const photoViewer = document.getElementById('photoViewer');
const photoViewerImage = document.getElementById('photoViewerImage');
const photoViewerCaption = document.getElementById('photoViewerCaption');
const photoViewerClose = document.getElementById('photoViewerClose');

function closePhotoViewer() {
  if (!photoViewer) return;
  photoViewer.classList.remove('open');
  photoViewer.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('viewer-open');
  photoViewerImage.src = '';
}

document.querySelectorAll('.photo-card[data-photo]').forEach(photoButton => {
  photoButton.addEventListener('click', () => {
    photoViewerImage.src = photoButton.dataset.photo;
    photoViewerImage.alt = photoButton.querySelector('img')?.alt || 'Fotografía personal';
    photoViewerCaption.textContent = photoButton.dataset.caption || '';
    photoViewer.classList.add('open');
    photoViewer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('viewer-open');
  });
});

if (photoViewerClose) photoViewerClose.addEventListener('click', closePhotoViewer);
if (photoViewer) photoViewer.addEventListener('click', event => {
  if (event.target === photoViewer) closePhotoViewer();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closePhotoViewer();
});
