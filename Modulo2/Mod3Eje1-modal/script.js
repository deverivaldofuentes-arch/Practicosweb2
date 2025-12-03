document.addEventListener('DOMContentLoaded', function() {
  const btnOpen = document.querySelector('.btn-open');
  const btnClose = document.querySelector('.btn-close');
  const modalOverlay = document.querySelector('.modal-overlay');

  // Abrir modal
  btnOpen.addEventListener('click', function() {
    modalOverlay.classList.remove('hidden');
  });

  // Cerrar modal con el botón X
  btnClose.addEventListener('click', function() {
    modalOverlay.classList.add('hidden');
  });

  // Cerrar modal al hacer clic fuera del contenido
  modalOverlay.addEventListener('click', function(e) {
    if (e.target === modalOverlay) {
      modalOverlay.classList.add('hidden');
    }
  });

  // Cerrar modal con la tecla ESC
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && !modalOverlay.classList.contains('hidden')) {
      modalOverlay.classList.add('hidden');
    }
  });
});
