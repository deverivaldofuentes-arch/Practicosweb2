// Elementos del DOM
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const menuToggle = document.getElementById('menuToggle');
const tabButtonsContainer = document.getElementById('tabButtonsContainer');
const contactForm = document.getElementById('contactForm');
const themeSelect = document.getElementById('themeSelect');
const animationsToggle = document.getElementById('animationsToggle');
const resetSettingsBtn = document.getElementById('resetSettings');
const exportSettingsBtn = document.getElementById('exportSettings');

// Variables de estado
let isMenuOpen = false;

/**
 * Cambiar a una pestaña específica
 */
function switchTab(targetTabId) {
    // Validar que el tab exista
    const targetTab = document.getElementById(targetTabId);
    if (!targetTab) {
        console.error(`Tab ${targetTabId} no encontrado`);
        return;
    }
    
    // Remover clase 'active' de todos los botones
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
    });
    
    // Remover clase 'active' de todos los contenidos
    tabContents.forEach(content => {
        content.classList.remove('active');
    });
    
    // Activar el botón clickeado
    const activeButton = document.querySelector(`[data-tab="${targetTabId}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
        activeButton.setAttribute('aria-selected', 'true');
        // Hacer scroll al botón si el menú está abierto en móvil
        if (window.innerWidth <= 768 && isMenuOpen) {
            activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
    
    // Mostrar el contenido correspondiente
    targetTab.classList.add('active');
    
    // Actualizar estadísticas animadas
    if (targetTabId === 'tab3') {
        animateStats();
    }
    
    // Guardar tab activo en localStorage
    localStorage.setItem('activeTab', targetTabId);
    
    // Cerrar menú en móvil después de seleccionar
    if (window.innerWidth <= 768) {
        closeMenu();
    }
    
    console.log(`Tab cambiado a: ${targetTabId}`);
}

/**
 * Obtener índice del tab activo
 */
function getActiveTabIndex() {
    const activeButton = document.querySelector('.tab-btn.active');
    return Array.from(tabButtons).indexOf(activeButton);
}

/**
 * Navegar al tab anterior
 */
function previousTab() {
    const currentIndex = getActiveTabIndex();
    const previousIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
    const previousTabId = tabButtons[previousIndex].dataset.tab;
    switchTab(previousTabId);
}

/**
 * Navegar al tab siguiente
 */
function nextTab() {
    const currentIndex = getActiveTabIndex();
    const nextIndex = (currentIndex + 1) % tabButtons.length;
    const nextTabId = tabButtons[nextIndex].dataset.tab;
    switchTab(nextTabId);
}

/**
 * Abrir/cerrar menú hamburguesa
 */
function toggleMenu() {
    isMenuOpen = !isMenuOpen;
    
    if (menuToggle) {
        menuToggle.classList.toggle('active', isMenuOpen);
        menuToggle.setAttribute('aria-expanded', isMenuOpen);
    }
    
    if (tabButtonsContainer) {
        tabButtonsContainer.classList.toggle('active', isMenuOpen);
    }
    
    // Actualizar el texto del botón para lectores de pantalla
    const menuLabel = isMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación';
    if (menuToggle) {
        menuToggle.setAttribute('aria-label', menuLabel);
    }
}

/**
 * Cerrar menú
 */
function closeMenu() {
    isMenuOpen = false;
    
    if (menuToggle) {
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Abrir menú de navegación');
    }
    
    if (tabButtonsContainer) {
        tabButtonsContainer.classList.remove('active');
    }
}

/**
 * Animar números de estadísticas
 */
function animateStats() {
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'));
        const suffix = stat.textContent.includes('%') ? '%' : '';
        const isPercent = suffix === '%';
        
        let current = 0;
        const increment = target / 50; // Animación de 50 pasos
        const timer = setInterval(() => {
            current += increment;
            
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            if (isPercent) {
                stat.textContent = `${Math.floor(current)}%`;
            } else {
                stat.textContent = Math.floor(current);
            }
        }, 30);
    });
}

/**
 * Cambiar tema de color
 */
function changeTheme(theme) {
    document.body.classList.remove('theme-default', 'theme-dark', 'theme-light', 'theme-blue');
    
    switch(theme) {
        case 'dark':
            document.body.classList.add('theme-dark');
            document.body.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)';
            break;
        case 'light':
            document.body.classList.add('theme-light');
            document.body.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)';
            break;
        case 'blue':
            document.body.classList.add('theme-blue');
            document.body.style.background = 'linear-gradient(135deg, #3498db 0%, #2c3e50 100%)';
            break;
        default:
            document.body.classList.add('theme-default');
            document.body.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
            break;
    }
    
    localStorage.setItem('theme', theme);
}

/**
 * Restablecer configuración
 */
function resetSettings() {
    localStorage.removeItem('activeTab');
    localStorage.removeItem('theme');
    localStorage.removeItem('animationsEnabled');
    
    if (themeSelect) themeSelect.value = 'default';
    if (animationsToggle) animationsToggle.checked = true;
    
    changeTheme('default');
    switchTab('tab1');
    
    alert('Configuración restablecida a valores predeterminados');
}

/**
 * Exportar configuración
 */
function exportSettings() {
    const settings = {
        activeTab: localStorage.getItem('activeTab') || 'tab1',
        theme: localStorage.getItem('theme') || 'default',
        animationsEnabled: localStorage.getItem('animationsEnabled') !== 'false',
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'tab-system-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Event listeners para los botones de tabs
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.dataset.tab;
        switchTab(targetTab);
    });
});

// Event listener para el menú hamburguesa
if (menuToggle) {
    menuToggle.addEventListener('click', toggleMenu);
}

// Navegación con teclado
document.addEventListener('keydown', (e) => {
    // Solo si estamos enfocados en un tab o en ningún input
    const isInputFocused = document.activeElement.tagName === 'INPUT' || 
                          document.activeElement.tagName === 'TEXTAREA' ||
                          document.activeElement.tagName === 'SELECT';
    
    switch(e.key) {
        case 'ArrowLeft':
            if (!isInputFocused) {
                e.preventDefault();
                previousTab();
            }
            break;
        case 'ArrowRight':
            if (!isInputFocused) {
                e.preventDefault();
                nextTab();
            }
            break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
            // Atajos numéricos: presionar 1, 2, 3, 4, 5
            if (!isInputFocused) {
                const tabIndex = parseInt(e.key);
                if (tabIndex <= tabButtons.length) {
                    switchTab(`tab${tabIndex}`);
                }
            }
            break;
        case 'm':
        case 'M':
            // Atajo para mostrar/ocultar menú
            if (!isInputFocused) {
                e.preventDefault();
                toggleMenu();
            }
            break;
        case 'Escape':
            // Cerrar menú con ESC
            if (isMenuOpen) {
                e.preventDefault();
                closeMenu();
            }
            break;
    }
});

// Prevenir envío del formulario de contacto
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Mostrar mensaje de éxito
        const submitBtn = contactForm.querySelector('.cta-btn');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Mensaje Enviado';
        submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        
        setTimeout(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.style.background = '';
            alert('¡Mensaje enviado con éxito! En una aplicación real, esto se enviaría al servidor.');
            contactForm.reset();
        }, 2000);
    });
}

// Event listeners para configuración
if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
        changeTheme(e.target.value);
    });
}

if (animationsToggle) {
    animationsToggle.addEventListener('change', (e) => {
        localStorage.setItem('animationsEnabled', e.target.checked);
        
        if (!e.target.checked) {
            document.querySelectorAll('.tab-content').forEach(content => {
                content.style.animation = 'none';
            });
        } else {
            document.querySelectorAll('.tab-content').forEach(content => {
                content.style.animation = '';
            });
        }
    });
}

if (resetSettingsBtn) {
    resetSettingsBtn.addEventListener('click', resetSettings);
}

if (exportSettingsBtn) {
    exportSettingsBtn.addEventListener('click', exportSettings);
}

// Cerrar menú al hacer clic fuera en móvil
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && isMenuOpen) {
        const isClickInsideMenu = tabButtonsContainer.contains(e.target);
        const isClickOnToggle = menuToggle.contains(e.target);
        
        if (!isClickInsideMenu && !isClickOnToggle) {
            closeMenu();
        }
    }
});

// Cargar configuración al iniciar
window.addEventListener('DOMContentLoaded', () => {
    // Cargar tema guardado
    const savedTheme = localStorage.getItem('theme') || 'default';
    if (themeSelect) themeSelect.value = savedTheme;
    changeTheme(savedTheme);
    
    // Cargar preferencia de animaciones
    const animationsEnabled = localStorage.getItem('animationsEnabled') !== 'false';
    if (animationsToggle) animationsToggle.checked = animationsEnabled;
    
    // Cargar tab guardado
    const savedTab = localStorage.getItem('activeTab');
    
    if (savedTab && document.getElementById(savedTab)) {
        switchTab(savedTab);
    } else {
        // Por defecto, mostrar el primer tab
        switchTab('tab1');
    }
    
    // Animar estadísticas si el tab 3 está activo
    if (savedTab === 'tab3' || (!savedTab && document.getElementById('tab1').classList.contains('active'))) {
        // Pequeño delay para asegurar que el DOM esté listo
        setTimeout(() => {
            if (document.getElementById('tab3').classList.contains('active')) {
                animateStats();
            }
        }, 500);
    }
    
    // Añadir focus visible para accesibilidad
    tabButtons.forEach(button => {
        button.addEventListener('focus', () => {
            button.style.outline = '2px solid #667eea';
            button.style.outlineOffset = '2px';
        });
        
        button.addEventListener('blur', () => {
            button.style.outline = 'none';
        });
    });
    
    // Cerrar menú al redimensionar si se vuelve a escritorio
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && isMenuOpen) {
            closeMenu();
        }
    });
    
    console.log('Sistema de tabs mejorado inicializado');
    console.log('Atajos de teclado disponibles:');
    console.log('- Flechas ← → : Navegar entre tabs');
    console.log('- Números 1-5 : Ir directamente a un tab');
    console.log('- M : Mostrar/ocultar menú');
    console.log('- ESC : Cerrar menú');
});

// CSS adicional para temas
const style = document.createElement('style');
style.textContent = `
    .theme-dark .tabs-container,
    .theme-dark .main-header {
        background: #2d3748;
        color: #e2e8f0;
    }
    
    .theme-dark .tabs-container h1,
    .theme-dark .tabs-container h2,
    .theme-dark .tabs-container h3,
    .theme-dark .main-header h1 {
        color: #e2e8f0;
    }
    
    .theme-dark .tabs-container p,
    .theme-dark .tabs-container label,
    .theme-dark .main-header .subtitle {
        color: #a0aec0;
    }
    
    .theme-dark .tab-btn {
        color: #a0aec0;
    }
    
    .theme-dark .tab-btn.active {
        color: #667eea;
        background: rgba(102, 126, 234, 0.2);
    }
    
    .theme-dark .feature,
    .theme-dark .service-card,
    .theme-dark .contact-info,
    .theme-dark .setting-group {
        background: #4a5568;
        color: #e2e8f0;
    }
    
    .theme-blue .tab-btn.active {
        border-bottom-color: #3498db;
        background: rgba(52, 152, 219, 0.1);
    }
    
    .theme-blue .cta-btn {
        background: linear-gradient(135deg, #3498db 0%, #2c3e50 100%);
    }
`;
document.head.appendChild(style);
