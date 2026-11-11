"use strict";

// Delegación de eventos: un listener en la galería atiende las cinco fotografías.
(function iniciarGaleriaOscar() {
  const galeria = document.querySelector('.entry-preview-grid');
  const visor = document.getElementById('entryLightbox');
  const imagen = document.getElementById('entryLightboxImage');
  const texto = document.getElementById('entryLightboxCaption');
  const cerrar = document.getElementById('entryLightboxClose');
  if (!galeria || !visor || !imagen || !texto || !cerrar) return;

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

  function manejarClicGaleria(evento) {
    const foto = evento.target.closest('[data-foto-ampliar]');
    if (!foto || !galeria.contains(foto)) return;
    abrirFoto(foto.dataset.fotoAmpliar, foto.dataset.fotoDescripcion);
  }

  function manejarTecla(evento) {
    if (evento.key === 'Escape' && visor.classList.contains('open')) cerrarFoto();
  }

  galeria.addEventListener('click', manejarClicGaleria);
  cerrar.addEventListener('click', cerrarFoto);
  visor.addEventListener('click', evento => {
    if (evento.target === visor) cerrarFoto();
  });
  document.addEventListener('keydown', manejarTecla);

  // Libera los escuchadores cuando se abandona esta página.
  window.addEventListener('pagehide', function limpiarGaleria() {
    galeria.removeEventListener('click', manejarClicGaleria);
    cerrar.removeEventListener('click', cerrarFoto);
    document.removeEventListener('keydown', manejarTecla);
  }, { once:true });
})();
