// Seleccionar elementos del DOM
const navbarToggle = document.getElementById('navbarToggle');
const navbarMenu = document.getElementById('navbarMenu');
const navbarActions = document.querySelector('.navbar-actions');
const navLinks = document.querySelectorAll('.nav-link');
const navbar = document.getElementById('navbar');

/**
 * Toggle del menú móvil
 */
navbarToggle.addEventListener('click', () => {
    // Toggle de la clase "active" en el botón hamburguesa
    navbarToggle.classList.toggle('active');
    
    // Toggle de la clase "active" en el menú y acciones
    navbarMenu.classList.toggle('active');
    navbarActions.classList.toggle('active');
    
    // Prevenir scroll del body cuando el menú está abierto
    if (navbarMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
});

/**
 * Cerrar el menú al hacer clic en un enlace (en móviles)
 */
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        // Cerrar el menú móvil
        navbarToggle.classList.remove('active');
        navbarMenu.classList.remove('active');
        navbarActions.classList.remove('active');
        document.body.style.overflow = '';
        
        // Quitar clase active de todos los enlaces
        navLinks.forEach(l => l.classList.remove('active'));
        
        // Añadir clase active al enlace clicado
        link.classList.add('active');
    });
});

/**
 * Cambiar el estilo de la navbar al hacer scroll
 */
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Cambiar el color de fondo de la navbar al hacer scroll
    if (currentScroll > 100) {
        navbar.style.background = 'rgba(26, 26, 46, 0.95)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.background = '#1a1a2e';
        navbar.style.backdropFilter = 'none';
    }
    
    lastScroll = currentScroll;
});

/**
 * Scroll spy - Resaltar el enlace de la sección actual
 */
const sections = document.querySelectorAll('.section');

const observerOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px',
    threshold: 0
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            
            // Quitar active de todos los enlaces
            navLinks.forEach(link => {
                link.classList.remove('active');
            });
            
            // Añadir active al enlace correspondiente
            const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    });
}, observerOptions);

// Observar todas las secciones
sections.forEach(section => {
    observer.observe(section);
});

/**
 * Cerrar el menú al hacer clic fuera de él (en móviles)
 */
document.addEventListener('click', (e) => {
    const isClickInsideNavbar = navbar.contains(e.target);
    const isMenuOpen = navbarMenu.classList.contains('active');
    
    if (!isClickInsideNavbar && isMenuOpen) {
        navbarToggle.classList.remove('active');
        navbarMenu.classList.remove('active');
        navbarActions.classList.remove('active');
        document.body.style.overflow = '';
    }
});

/**
 * Animación de aparición suave para las cards al hacer scroll
 */
const observeElements = document.querySelectorAll('.service-card, .portfolio-item, .testimonial');

const fadeInObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }, index * 100);
        }
    });
}, {
    threshold: 0.1
});

observeElements.forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    fadeInObserver.observe(element);
});
