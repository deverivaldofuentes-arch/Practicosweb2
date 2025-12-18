// Elementos del DOM
const modalTriggers = document.querySelectorAll('[data-modal]');
const modals = document.querySelectorAll('.modal');
const body = document.body;
const themeToggle = document.getElementById('themeToggle');
const themeOptions = document.querySelectorAll('.theme-option');
const filterButtons = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');
const galleryViewButtons = document.querySelectorAll('.gallery-view');
const settingsTabs = document.querySelectorAll('.settings-tab');
const settingsPanes = document.querySelectorAll('.settings-pane');
const confirmActionBtn = document.querySelector('.confirm-action');
const saveSettingsBtn = document.querySelector('.save-settings');

// Variables de estado
let modalStack = [];
let currentTheme = localStorage.getItem('theme') || 'light';

/**
 * Inicializar el sistema de modales
 */
function initModalSystem() {
    // Aplicar tema guardado
    applyTheme(currentTheme);
    
    // Configurar eventos
    setupEventListeners();
    
    // Log de inicialización
    console.log('✅ Modal System Pro inicializado');
    console.log(`📊 ${modals.length} modales disponibles`);
    console.log(`🎨 Tema activo: ${currentTheme}`);
}

/**
 * Aplicar tema
 */
function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Actualizar botón de tema
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        const text = themeToggle.querySelector('.theme-text');
        
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
            text.textContent = 'Modo Claro';
        } else {
            icon.className = 'fas fa-moon';
            text.textContent = 'Modo Oscuro';
        }
    }
}

/**
 * Alternar tema
 */
function toggleTheme() {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(newTheme);
}

/**
 * Abrir un modal
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    
    if (!modal) {
        console.error(`❌ Modal ${modalId} no encontrado`);
        return;
    }
    
    // Agregar a la pila
    modalStack.push(modalId);
    
    // Mostrar modal
    modal.classList.add('active');
    body.classList.add('modal-open');
    
    // Enfocar el primer elemento enfocable
    setTimeout(() => {
        const focusable = modal.querySelector('button, input, textarea, select');
        if (focusable) focusable.focus();
    }, 100);
    
    // Ejecutar acciones específicas del modal
    switch(modalId) {
        case 'modal1':
            setupFormValidation();
            break;
        case 'modal4':
            initGallery();
            break;
        case 'modal6':
            initSettings();
            break;
    }
    
    console.log(`📂 Modal abierto: ${modalId}`);
    updateModalCounter();
}

/**
 * Cerrar un modal
 */
function closeModal(modal) {
    if (!modal) return;
    
    const modalId = modal.id;
    
    // Remover de la pila
    modalStack = modalStack.filter(id => id !== modalId);
    
    // Ocultar modal
    modal.classList.remove('active');
    
    // Si no hay más modales, restaurar scroll
    if (modalStack.length === 0) {
        body.classList.remove('modal-open');
    } else {
        // Volver al modal anterior
        const previousModalId = modalStack[modalStack.length - 1];
        const previousModal = document.getElementById(previousModalId);
        if (previousModal) {
            previousModal.classList.add('active');
        }
    }
    
    console.log(`📂 Modal cerrado: ${modalId}`);
    updateModalCounter();
}

/**
 * Cerrar todos los modales
 */
function closeAllModals() {
    modals.forEach(modal => {
        modal.classList.remove('active');
    });
    
    modalStack = [];
    body.classList.remove('modal-open');
    
    console.log('📂 Todos los modales cerrados');
    updateModalCounter();
}

/**
 * Cerrar modal actual
 */
function closeCurrentModal() {
    if (modalStack.length === 0) return;
    
    const currentModalId = modalStack[modalStack.length - 1];
    const currentModal = document.getElementById(currentModalId);
    
    if (currentModal) {
        closeModal(currentModal);
    }
}

/**
 * Actualizar contador de modales
 */
function updateModalCounter() {
    const counter = document.getElementById('imageCounter');
    if (counter) {
        counter.textContent = `Mostrando ${galleryItems.length} imágenes`;
    }
}

/**
 * Configurar validación de formulario
 */
function setupFormValidation() {
    const form = document.getElementById('contactForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validación simple
        const name = form.querySelector('#name').value.trim();
        const email = form.querySelector('#email').value.trim();
        const message = form.querySelector('#message').value.trim();
        
        if (!name || !email || !message) {
            showFormError('Por favor, completa todos los campos requeridos');
            return;
        }
        
        if (!isValidEmail(email)) {
            showFormError('Por favor, ingresa un correo electrónico válido');
            return;
        }
        
        // Simular envío
        showFormSuccess();
    });
}

/**
 * Mostrar error en formulario
 */
function showFormError(message) {
    // En una implementación real, mostrarías esto en el modal
    alert(`Error: ${message}`);
}

/**
 * Mostrar éxito en formulario
 */
function showFormSuccess() {
    const submitBtn = document.querySelector('#contactForm .btn-primary');
    const originalText = submitBtn.innerHTML;
    
    // Cambiar a estado de éxito
    submitBtn.innerHTML = '<i class="fas fa-check"></i> ¡Enviado!';
    submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    submitBtn.disabled = true;
    
    // Restaurar después de 2 segundos
    setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = '';
        submitBtn.disabled = false;
        
        // Cerrar modal
        closeCurrentModal();
        
        // Mostrar mensaje de éxito
        alert('¡Mensaje enviado con éxito! Te contactaremos pronto.');
        
        // Resetear formulario
        document.getElementById('contactForm').reset();
    }, 2000);
}

/**
 * Validar email
 */
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Inicializar galería
 */
function initGallery() {
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            viewFullImage(index);
        });
    });
    
    galleryViewButtons.forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            viewFullImage(index);
        });
    });
    
    // Navegación de galería
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            navigateGallery(-1);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            navigateGallery(1);
        });
    }
    
    // Filtros de galería
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterGallery(btn.textContent);
        });
    });
}

/**
 * Ver imagen en tamaño completo
 */
function viewFullImage(index) {
    const item = galleryItems[index];
    const img = item.querySelector('img');
    const fullSrc = img.getAttribute('data-full');
    const alt = img.getAttribute('alt');
    
    // En una implementación real, aquí abrirías un lightbox
    alert(`Ver imagen completa: ${alt}\nURL: ${fullSrc}`);
}

/**
 * Navegar por la galería
 */
function navigateGallery(direction) {
    const dots = document.querySelectorAll('.gallery-dots .dot');
    if (dots.length === 0) return;
    
    const activeIndex = Array.from(dots).findIndex(dot => dot.classList.contains('active'));
    
    let newIndex = activeIndex + direction;
    if (newIndex < 0) newIndex = dots.length - 1;
    if (newIndex >= dots.length) newIndex = 0;
    
    // Actualizar puntos
    dots.forEach(dot => dot.classList.remove('active'));
    dots[newIndex].classList.add('active');
    
    console.log(`Navegando a imagen ${newIndex + 1}`);
}

/**
 * Filtrar galería
 */
function filterGallery(filter) {
    console.log(`Filtrando galería por: ${filter}`);
    
    galleryItems.forEach(item => {
        const caption = item.querySelector('h4')?.textContent || '';
        const show = filter === 'Todas' || caption.toLowerCase().includes(filter.toLowerCase());
        item.style.display = show ? 'block' : 'none';
    });
    
    // Actualizar contador
    const visibleItems = document.querySelectorAll('.gallery-item[style*="block"]').length;
    const counter = document.getElementById('imageCounter');
    if (counter) {
        counter.textContent = `Mostrando ${visibleItems} imágenes`;
    }
}

/**
 * Inicializar configuración
 */
function initSettings() {
    // Cambiar pestañas
    settingsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Actualizar pestañas activas
            settingsTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Mostrar panel correspondiente
            settingsPanes.forEach(pane => pane.classList.remove('active'));
            const targetPane = document.getElementById(tabId);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
    
    // Selector de tema
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.getAttribute('data-theme');
            
            // Actualizar opciones activas
            themeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            // Aplicar tema
            applyTheme(theme);
        });
    });
}

/**
 * Configurar eventos
 */
function setupEventListeners() {
    // Botones para abrir modales
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const modalId = trigger.dataset.modal;
            openModal(modalId);
        });
    });
    
    // Cerrar modales
    modals.forEach(modal => {
        // Botón de cerrar
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeModal(modal);
            });
        }
        
        // Botón de cancelar
        const cancelBtns = modal.querySelectorAll('.cancel-btn');
        cancelBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                closeModal(modal);
            });
        });
        
        // Click en overlay
        const overlay = modal.querySelector('.modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => {
                closeModal(modal);
            });
        }
        
        // Prevenir cierre al hacer click en contenido
        const content = modal.querySelector('.modal-content');
        if (content) {
            content.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    });
    
    // Botón de confirmar acción
    if (confirmActionBtn) {
        confirmActionBtn.addEventListener('click', () => {
            // Simular acción
            const originalText = confirmActionBtn.innerHTML;
            confirmActionBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
            confirmActionBtn.disabled = true;
            
            setTimeout(() => {
                alert('✅ Acción confirmada correctamente');
                closeCurrentModal();
                confirmActionBtn.innerHTML = originalText;
                confirmActionBtn.disabled = false;
            }, 1500);
        });
    }
    
    // Guardar configuración
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => {
            // Simular guardado
            const originalText = saveSettingsBtn.innerHTML;
            saveSettingsBtn.innerHTML = '<i class="fas fa-check"></i> ¡Guardado!';
            
            setTimeout(() => {
                alert('✅ Configuración guardada correctamente');
                closeCurrentModal();
                saveSettingsBtn.innerHTML = originalText;
            }, 1500);
        });
    }
    
    // Toggle de tema
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Atajos de teclado
    document.addEventListener('keydown', (e) => {
        // Solo si no estamos en un input/textarea
        const isInputFocused = document.activeElement.tagName === 'INPUT' || 
                              document.activeElement.tagName === 'TEXTAREA' ||
                              document.activeElement.tagName === 'SELECT';
        
        switch(e.key) {
            case 'Escape':
                if (modalStack.length > 0) {
                    e.preventDefault();
                    closeCurrentModal();
                }
                break;
                
            case 'F':
            case 'f':
                if (!isInputFocused && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    openModal('modal1');
                }
                break;
                
            case 'C':
            case 'c':
                if (!isInputFocused && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    openModal('modal2');
                }
                break;
                
            case 'I':
            case 'i':
                if (!isInputFocused && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                    openModal('modal3');
                }
                break;
                
            case 'Tab':
                // Trap de foco dentro del modal activo
                if (modalStack.length > 0 && !isInputFocused) {
                    const currentModal = document.getElementById(modalStack[modalStack.length - 1]);
                    const focusableElements = currentModal.querySelectorAll('button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
                    
                    if (focusableElements.length > 0) {
                        const firstElement = focusableElements[0];
                        const lastElement = focusableElements[focusableElements.length - 1];
                        
                        if (e.shiftKey && document.activeElement === firstElement) {
                            e.preventDefault();
                            lastElement.focus();
                        } else if (!e.shiftKey && document.activeElement === lastElement) {
                            e.preventDefault();
                            firstElement.focus();
                        }
                    }
                }
                break;
        }
    });
    
    // Log de eventos para debugging
    console.log('🎮 Event listeners configurados');
}

/**
 * Inicializar al cargar la página
 */
document.addEventListener('DOMContentLoaded', () => {
    initModalSystem();
    
    // Mostrar mensaje de bienvenida
    setTimeout(() => {
        console.log('🚀 Modal System Pro listo para usar');
        console.log('📋 Atajos de teclado:');
        console.log('   ESC - Cerrar modal');
        console.log('   F - Abrir formulario');
        console.log('   C - Abrir confirmación');
        console.log('   I - Abrir información');
        console.log('   TAB - Navegar dentro del modal');
    }, 1000);
});

// Exportar funciones para uso externo (si es necesario)
window.ModalSystem = {
    openModal,
    closeModal,
    closeAllModals,
    applyTheme,
    toggleTheme
};
