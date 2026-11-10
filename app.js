'use strict';

const views = ['inicio', 'perfil', 'rutina', 'favoritos', 'contacto'];
const pageLabels = { inicio: 'Inicio', perfil: 'Sobre mí', rutina: 'Mi rutina', favoritos: 'Favoritos', contacto: 'Formulario' };

function showView(name) {
  if (!views.includes(name)) return;
  document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === `view-${name}`));
  document.querySelectorAll('[data-view]').forEach(button => button.classList.toggle('active', button.dataset.view === name));
  document.getElementById('pageName').textContent = pageLabels[name];
  document.getElementById('mainContent').scrollTop = 0;
  history.replaceState(null, '', `#${name}`);
}

// Navegación y menú hamburguesa con jQuery, siguiendo la guía de clase.
$(() => {
  $('[data-view]').on('click', function () {
    showView(this.dataset.view);
    closeMobileMenu();
  });
  $('[data-go]').on('click', function () { showView(this.dataset.go); });
  $('#mobileMenuToggle').on('click', function () {
    const opening = !$('#mobileMenu').hasClass('open');
    $('#mobileMenu').toggleClass('open', opening);
    $(this).attr({ 'aria-expanded': String(opening), 'aria-label': opening ? 'Cerrar menú' : 'Abrir menú' }).text(opening ? '×' : '☰');
  });
});
function closeMobileMenu() {
  $('#mobileMenu').removeClass('open');
  $('#mobileMenuToggle').attr({ 'aria-expanded': 'false', 'aria-label': 'Abrir menú' }).text('☰');
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
$('#areaSelect').on('change', function () {
  const selectedArea = $(this).val();
  $('#moduleSelect').empty().append(new Option('Selecciona un módulo', ''));
  const modules = modulesByArea[selectedArea] || [];
  modules.forEach(module => $('#moduleSelect').append(new Option(module.label, module.value)));
  $('#moduleSelect').prop('disabled', modules.length === 0);
  $('#layerResult').html('<span class="result-icon">✦</span><div><small>RESULTADO</small><strong>Esperando selección</strong><p>Elige un módulo para ver el elemento.</p></div>');
});
$('#moduleSelect').on('change', function () {
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
  rap: ['Métricas Frías', 'Joes Yawar Cru', 'Forty MC'],
  trap: ['Ghostemane']
};
const genreSelect = document.getElementById('genreSelect');
const artistSelect = document.getElementById('artistSelect');
const artistResult = document.getElementById('artistResult');
genreSelect.addEventListener('change', () => {
  artistSelect.innerHTML = '<option value="">Selecciona un artista</option>';
  (artistsByGenre[genreSelect.value] || []).forEach(artist => artistSelect.add(new Option(artist, artist)));
  artistSelect.disabled = !genreSelect.value;
  artistResult.textContent = genreSelect.value ? 'Ahora selecciona un artista.' : 'Selecciona un género para continuar.';
});
artistSelect.addEventListener('change', () => {
  artistResult.textContent = artistSelect.value ? `Tu selección: ${artistSelect.value}` : 'Selecciona un artista.';
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
  const element = document.getElementById(id);
  const eventName = id === 'terms' ? 'change' : 'blur';
  element.addEventListener(eventName, () => validateField(id));
  if (id !== 'terms') element.addEventListener('input', () => {
    if (element.closest('.form-field').classList.contains('invalid')) validateField(id);
    if (id === 'password' && document.getElementById('confirmPassword').value) validateField('confirmPassword');
  });
});
document.getElementById('message').addEventListener('input', event => {
  document.getElementById('charCount').textContent = `${event.target.value.length} / 200`;
});
$(form).on('submit', event => {
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

// Instalación PWA.
let installPrompt = null;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
  installBtn.hidden = false;
});
installBtn.addEventListener('click', async () => {
  if (!installPrompt) {
    showToast('En Chrome/Edge: abre el menú del navegador y elige “Instalar aplicación”.');
    return;
  }
  installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt = null;
});
window.addEventListener('appinstalled', () => {
  installBtn.textContent = '✓ Aplicación instalada';
  installBtn.disabled = true;
  showToast('La aplicación quedó instalada.');
});

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => showToast('No se pudo activar el modo sin conexión.')));
}
