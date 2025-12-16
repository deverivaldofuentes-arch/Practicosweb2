const btnOpen = document.querySelector('.btn-open');
const btnClose = document.querySelector('.btn-close');
const modalOverlay = document.querySelector('#modalOverlay');
const btnModalAction = document.querySelector('.btn-modal-action');

// Elementos para focus trapping (accesibilidad)
const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
let firstFocusableElement, lastFocusableElement;

function openModal() {
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Configurar focus trapping para accesibilidad
    const focusableContent = modalOverlay.querySelectorAll(focusableElements);
    firstFocusableElement = focusableContent[0];
    lastFocusableElement = focusableContent[focusableContent.length - 1];
    
    // Enfocar el primer elemento interactivo del modal
    setTimeout(() => {
        firstFocusableElement.focus();
    }, 100);
    
    // Agregar event listener para trap de focus
    modalOverlay.addEventListener('keydown', trapTabKey);
}

function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    
    // Remover event listener de trap de focus
    modalOverlay.removeEventListener('keydown', trapTabKey);
    
    // Regresar focus al botón que abrió el modal
    setTimeout(() => {
        btnOpen.focus();
    }, 100);
}

// Función para atrapar el tab key dentro del modal (accesibilidad)
function trapTabKey(e) {
    if (e.key !== 'Tab') return;
    
    if (e.shiftKey) { // shift + tab
        if (document.activeElement === firstFocusableElement) {
            e.preventDefault();
            lastFocusableElement.focus();
        }
    } else { // tab
        if (document.activeElement === lastFocusableElement) {
            e.preventDefault();
            firstFocusableElement.focus();
        }
    }
}

// Event listeners
btnOpen.addEventListener('click', openModal);
btnClose.addEventListener('click', closeModal);
btnModalAction.addEventListener('click', closeModal);

// Cerrar al hacer clic fuera del modal
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

// Cerrar con tecla Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
    }
});

// Prevenir que el clic dentro del modal cierre el overlay
document.querySelector('.modal').addEventListener('click', (e) => {
    e.stopPropagation();
});

// Mejorar accesibilidad: abrir modal con Enter cuando está enfocado
btnOpen.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        openModal();
    }
});

// Agregar soporte táctil mejorado para dispositivos móviles
let touchStartY = 0;
let touchEndY = 0;

modalOverlay.addEventListener('touchstart', (e) => {
    touchStartY = e.changedTouches[0].screenY;
});

modalOverlay.addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].screenY;
    
    // Cerrar modal con gesto de deslizar hacia abajo (solo en móviles)
    if (touchStartY - touchEndY > 100 && window.innerWidth <= 768) {
        closeModal();
    }
});
