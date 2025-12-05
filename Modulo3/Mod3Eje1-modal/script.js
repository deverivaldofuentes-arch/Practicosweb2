// Seleccionar elementos del DOM
const btnOpen = document.querySelector('.btn-open');
const btnClose = document.querySelector('.btn-close');
const modalOverlay = document.querySelector('#modalOverlay');
const btnModalAction = document.querySelector('.btn-modal-action');

/**
 * Función para abrir el modal
 */
function openModal() {
    modalOverlay.classList.add('active');
    // Prevenir scroll del body cuando el modal está abierto
    document.body.style.overflow = 'hidden';
}

/**
 * Función para cerrar el modal
 */
function closeModal() {
    modalOverlay.classList.remove('active');
    // Restaurar scroll del body
    document.body.style.overflow = '';
}

// Event listener para abrir el modal
btnOpen.addEventListener('click', openModal);

// Event listener para cerrar el modal con el botón X
btnClose.addEventListener('click', closeModal);

// Event listener para cerrar el modal con el botón de acción
btnModalAction.addEventListener('click', closeModal);

// Event listener para cerrar el modal al hacer clic en el overlay (fuera del modal)
modalOverlay.addEventListener('click', (e) => {
    // Verificar que el clic fue en el overlay y no en el modal
    if (e.target === modalOverlay) {
        closeModal();
    }
});

// Event listener para cerrar el modal con la tecla Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
    }
});

// Prevenir que los clics dentro del modal cierren el modal
document.querySelector('.modal').addEventListener('click', (e) => {
    e.stopPropagation();
});
