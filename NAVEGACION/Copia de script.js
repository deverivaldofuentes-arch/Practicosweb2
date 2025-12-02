/* ===============================================
   MENÚ HAMBURGUESA INTERACTIVO
   ===============================================
   
   Funcionalidad para abrir/cerrar el menú en móviles
   =============================================== */

// Seleccionar elementos
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Toggle del menú
navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Cerrar menú al hacer click en un enlace
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Cerrar menú al hacer click fuera
document.addEventListener('click', (e) => {
    if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    }
});

// Marcar enlace activo según scroll (BONUS)
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section[id]');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (pageYOffset >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

console.log('🎮 Navegación interactiva cargada');
console.log('💡 Características:');
console.log('  - Menú hamburguesa responsive');
console.log('  - Cierre automático al hacer click en enlaces');
console.log('  - Cierre al hacer click fuera del menú');
console.log('  - Marcado activo según scroll (BONUS)');
