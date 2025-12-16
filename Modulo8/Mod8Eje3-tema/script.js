// Sistema de Cambio de Tema Mejorado
class ThemeSwitcher {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.body = document.body;
        this.icon = this.themeToggle.querySelector('.icon');
        this.currentThemeElement = document.getElementById('currentTheme');
        this.systemPreferenceElement = document.getElementById('systemPreference');
        this.init();
    }

    init() {
        this.loadTheme();
        this.detectSystemTheme();
        this.setupEventListeners();
        this.createParticles();
        this.updateSystemInfo();
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        
        if (savedTheme === 'dark') {
            this.body.classList.add('dark-mode');
            this.updateIcon('sun');
            this.updateCurrentTheme('Oscuro');
        } else if (savedTheme === 'light') {
            this.body.classList.remove('dark-mode');
            this.updateIcon('moon');
            this.updateCurrentTheme('Claro');
        } else {
            // Si no hay tema guardado, usar preferencia del sistema
            this.followSystemPreference();
        }
    }

    detectSystemTheme() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        const systemTheme = prefersDark.matches ? 'Oscuro' : 'Claro';
        this.systemPreferenceElement.textContent = systemTheme;
        
        // Escuchar cambios en la preferencia del sistema
        prefersDark.addEventListener('change', (e) => {
            const newSystemTheme = e.matches ? 'Oscuro' : 'Claro';
            this.systemPreferenceElement.textContent = newSystemTheme;
            
            // Solo seguir la preferencia del sistema si no hay tema guardado
            if (!localStorage.getItem('theme')) {
                this.followSystemPreference();
            }
        });
    }

    followSystemPreference() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        if (prefersDark.matches) {
            this.body.classList.add('dark-mode');
            this.updateIcon('sun');
            this.updateCurrentTheme('Oscuro');
        } else {
            this.body.classList.remove('dark-mode');
            this.updateIcon('moon');
            this.updateCurrentTheme('Claro');
        }
    }

    toggleTheme() {
        const isDark = this.body.classList.toggle('dark-mode');
        const theme = isDark ? 'dark' : 'light';
        
        // Guardar preferencia
        localStorage.setItem('theme', theme);
        
        // Actualizar icono con animación
        this.updateIcon(isDark ? 'sun' : 'moon', true);
        
        // Actualizar información del tema
        this.updateCurrentTheme(isDark ? 'Oscuro' : 'Claro');
        
        // Efecto visual en el botón
        this.animateToggleButton();
        
        // Disparar evento personalizado
        this.dispatchThemeChangeEvent(theme);
        
        // Log para debugging
        console.log(`Tema cambiado a: ${theme}`);
    }

    updateIcon(iconType, animate = false) {
        const icons = {
            moon: '🌙',
            sun: '☀️'
        };
        
        this.icon.textContent = icons[iconType];
        
        if (animate) {
            this.icon.style.transform = 'scale(1.5) rotate(180deg)';
            setTimeout(() => {
                this.icon.style.transform = 'scale(1) rotate(0deg)';
            }, 300);
        }
    }

    updateCurrentTheme(themeName) {
        this.currentThemeElement.textContent = themeName;
        this.currentThemeElement.style.color = themeName === 'Oscuro' ? '#60a5fa' : '#f59e0b';
    }

    updateSystemInfo() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
        this.systemPreferenceElement.textContent = prefersDark.matches ? 'Oscuro' : 'Claro';
    }

    animateToggleButton() {
        // Animación del botón
        this.themeToggle.style.transform = 'scale(0.9)';
        setTimeout(() => {
            this.themeToggle.style.transform = 'scale(1)';
        }, 100);
        
        // Efecto de onda
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(59, 130, 246, 0.3);
            transform: translate(-50%, -50%);
            pointer-events: none;
            animation: ripple 0.6s ease-out;
        `;
        
        this.themeToggle.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    dispatchThemeChangeEvent(theme) {
        const event = new CustomEvent('themeChanged', {
            detail: {
                theme: theme,
                timestamp: new Date().toISOString()
            }
        });
        document.dispatchEvent(event);
    }

    setupEventListeners() {
        // Click en el botón
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Atajos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                this.toggleTheme();
            }
            
            if (e.ctrlKey && e.shiftKey && e.key === 'L') {
                e.preventDefault();
                this.setTheme('light');
            }
            
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                this.setTheme('dark');
            }
        });
        
        // Escuchar eventos personalizados
        document.addEventListener('themeChanged', (e) => {
            console.log('Tema cambiado:', e.detail);
        });
    }

    setTheme(theme) {
        if (theme === 'dark') {
            this.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            this.updateIcon('sun', true);
            this.updateCurrentTheme('Oscuro');
        } else {
            this.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
            this.updateIcon('moon', true);
            this.updateCurrentTheme('Claro');
        }
        this.animateToggleButton();
    }

    createParticles() {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer) return;
        
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Tamaño aleatorio
            const size = Math.random() * 4 + 1;
            
            // Posición aleatoria
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            
            // Animación aleatoria
            const duration = Math.random() * 10 + 10;
            const delay = Math.random() * 5;
            
            particle.style.cssText = `
                width: ${size}px;
                height: ${size}px;
                left: ${posX}%;
                top: ${posY}%;
                background: var(--accent);
                animation-duration: ${duration}s;
                animation-delay: ${delay}s;
                opacity: ${Math.random() * 0.1 + 0.05};
            `;
            
            particlesContainer.appendChild(particle);
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const themeSwitcher = new ThemeSwitcher();
    
    // Añadir estilos para la animación ripple
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                width: 200px;
                height: 200px;
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
});

// Animación de entrada para los elementos
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observar elementos para animación de scroll
    document.querySelectorAll('.card, .feature-item, .stat-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});
