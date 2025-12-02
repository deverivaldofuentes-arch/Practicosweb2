/* ===============================================
   MENÚ HAMBURGUESA INTERACTIVO
   ===============================================
   
   Funcionalidad para abrir/cerrar el menú en móviles
   =============================================== */

// Seleccionar elementos
document.addEventListener('DOMContentLoaded', function() {
  // Seleccionar elementos
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');
  const navItems = document.querySelectorAll('.nav-item');
  const heroSection = document.getElementById('inicio');

  // Función para abrir/cerrar menú
  function toggleMenu() {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
    navToggle.setAttribute('aria-expanded', !isExpanded);

    // Bloquear scroll cuando el menú está abierto
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
  }

  // Función para cerrar menú
  function closeMenu() {
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  // Toggle del menú hamburguesa
  navToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleMenu();
  });

  // Cerrar menú al hacer click en un enlace
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Solo cerrar si es un enlace de navegación (no el botón CTA)
      if (!this.classList.contains('btn-cta')) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        if (targetId.startsWith('#')) {
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            // Scroll suave
            targetElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }

        // Cerrar menú después de un retraso para permitir el scroll
        setTimeout(closeMenu, 300);
      }
    });
  });

  // Cerrar menú al hacer click fuera
  document.addEventListener('click', function(e) {
    if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
      closeMenu();
    }
  });

  // Cerrar menú al presionar Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeMenu();
    }
  });

  // Marcar enlace activo según scroll
  function setActiveLink() {
    let currentSection = '';
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;

      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    // Si estamos en la parte superior, marcar "inicio"
    if (window.scrollY < 100) {
      currentSection = 'inicio';
    }

    navLinks.forEach(link => {
      link.classList.remove('active');
      const linkId = link.getAttribute('href').substring(1);
      if (linkId === currentSection) {
        link.classList.add('active');
      }
    });
  }

  // Ejecutar al cargar y al hacer scroll
  window.addEventListener('scroll', setActiveLink);
  setActiveLink(); // Inicializar al cargar

  // Prevenir que el menú se cierre al hacer click dentro de él
  navMenu.addEventListener('click', function(e) {
    e.stopPropagation();
  });

  // Responsive: cerrar menú al cambiar tamaño de ventana (si está abierto en móvil y se pasa a desktop)
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
      closeMenu();
    }
  });

  console.log('  - Navegación interactiva cargada correctamente');
  console.log('  - Funcionalidades activas:');
  console.log('  - Menú hamburguesa responsive');
  console.log('  - Scroll suave a secciones');
  console.log('  - Cierre automático al hacer click en enlaces');
  console.log('  - Cierre con click fuera o tecla Escape');
  console.log('  - Marcado activo según scroll');
  console.log('  - Soporte para accesibilidad (ARIA)');
});
