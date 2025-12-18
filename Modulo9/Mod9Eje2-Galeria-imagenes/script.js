// Datos de las imágenes (ampliados)
const images = [
    {
        id: 1,
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        title: 'Montañas al Amanecer',
        category: 'naturaleza',
        description: 'Hermoso paisaje montañoso con los primeros rayos del sol'
    },
    {
        id: 2,
        url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800',
        title: 'Ciudad Moderna',
        category: 'ciudad',
        description: 'Rascacielos iluminados en una gran metrópolis'
    },
    {
        id: 3,
        url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
        title: 'Tecnología Digital',
        category: 'tecnologia',
        description: 'Circuitos y tecnología moderna en detalle macro'
    },
    {
        id: 4,
        url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800',
        title: 'Retrato Profesional',
        category: 'personas',
        description: 'Fotografía de retrato profesional con iluminación de estudio'
    },
    {
        id: 5,
        url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
        title: 'Bosque Mágico',
        category: 'naturaleza',
        description: 'Sendero en un bosque encantado con rayos de sol filtrándose'
    },
    {
        id: 6,
        url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w-800',
        title: 'Skyline Nocturno',
        category: 'ciudad',
        description: 'Ciudad iluminada durante la noche desde una perspectiva aérea'
    },
    {
        id: 7,
        url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
        title: 'Gadgets Modernos',
        category: 'tecnologia',
        description: 'Dispositivos tecnológicos de última generación'
    },
    {
        id: 8,
        url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800',
        title: 'Equipo de Trabajo',
        category: 'personas',
        description: 'Grupo de profesionales colaborando en un espacio moderno'
    },
    {
        id: 9,
        url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800',
        title: 'Aurora Boreal',
        category: 'naturaleza',
        description: 'Espectacular aurora boreal en cielos nórdicos'
    },
    {
        id: 10,
        url: 'https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=800',
        title: 'Arquitectura Urbana',
        category: 'ciudad',
        description: 'Diseño arquitectónico contemporáneo en entorno urbano'
    }
];

// Variables globales
let currentFilter = 'all';
let currentView = 'grid';
let currentLightboxIndex = 0;
let filteredImages = [...images];

// Elementos del DOM
const gallery = document.getElementById('gallery');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const viewBtns = document.querySelectorAll('.view-btn');
const imageCount = document.getElementById('imageCount');
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxTitle = document.getElementById('lightboxTitle');
const lightboxCategory = document.getElementById('lightboxCategory');
const lightboxDescription = document.getElementById('lightboxDescription');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');

/**
 * Crear estrellas de fondo
 */
function createStars() {
    const starsContainer = document.getElementById('stars');
    for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (Math.random() * 2 + 1) + 's';
        starsContainer.appendChild(star);
    }
}

/**
 * Mostrar notificación
 */
function showNotification(message) {
    notificationText.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

/**
 * Renderizar galería
 */
function renderGallery(imagesToRender = images) {
    // Limpiar galería
    gallery.innerHTML = '';
    
    // Si no hay resultados
    if (imagesToRender.length === 0) {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = `
            <div style="text-align: center; padding: 3rem; background: var(--dark-card); border-radius: 20px;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <h3 style="color: var(--text-light); margin-bottom: 0.5rem;">No se encontraron imágenes</h3>
                <p style="color: var(--text-muted);">Intenta con otros términos de búsqueda o filtros</p>
            </div>
        `;
        gallery.appendChild(noResults);
        
        imageCount.textContent = '0';
        return;
    }
    
    // Crear elementos para cada imagen
    imagesToRender.forEach((image, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.dataset.id = image.id;
        item.dataset.index = index;
        item.dataset.category = image.category;
        
        item.innerHTML = `
            <img src="${image.url}" alt="${image.title}" loading="lazy">
            <div class="gallery-info">
                <span class="gallery-category">${image.category}</span>
                <h3>${image.title}</h3>
                <p class="gallery-description">${image.description}</p>
            </div>
        `;
        
        // Event listener para abrir lightbox
        item.addEventListener('click', () => openLightbox(index));
        
        gallery.appendChild(item);
    });
    
    // Actualizar contador
    imageCount.textContent = imagesToRender.length;
    
    // Aplicar vista actual
    if (currentView === 'list') {
        gallery.classList.add('list-view');
    } else {
        gallery.classList.remove('list-view');
    }
}

/**
 * Filtrar por categoría
 */
function filterByCategory(category) {
    currentFilter = category;
    applyFilters();
    showNotification(`Filtro aplicado: ${category === 'all' ? 'Todas' : category}`);
}

/**
 * Buscar imágenes
 */
function searchImages(query) {
    applyFilters(query);
    if (query) {
        showNotification(`Buscando: "${query}"`);
    }
}

/**
 * Aplicar todos los filtros
 */
function applyFilters(searchQuery = '') {
    filteredImages = images.filter(image => {
        const matchesCategory = currentFilter === 'all' || image.category === currentFilter;
        const matchesSearch = searchQuery === '' || 
            image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            image.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            image.category.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesCategory && matchesSearch;
    });
    
    renderGallery(filteredImages);
}

/**
 * Cambiar vista (grid/list)
 */
function changeView(view) {
    currentView = view;
    
    if (view === 'list') {
        gallery.classList.add('list-view');
        showNotification('Vista de lista activada');
    } else {
        gallery.classList.remove('list-view');
        showNotification('Vista de cuadrícula activada');
    }
}

/**
 * Abrir lightbox
 */
function openLightbox(index) {
    currentLightboxIndex = index;
    updateLightbox();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Cerrar lightbox
 */
function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = 'auto';
}

/**
 * Actualizar contenido del lightbox
 */
function updateLightbox() {
    const image = filteredImages[currentLightboxIndex];
    if (!image) return;
    
    lightboxImg.src = image.url;
    lightboxTitle.textContent = image.title;
    lightboxCategory.textContent = image.category;
    lightboxDescription.textContent = image.description;
}

/**
 * Navegación en lightbox
 */
function nextImage() {
    currentLightboxIndex = (currentLightboxIndex + 1) % filteredImages.length;
    updateLightbox();
}

function prevImage() {
    currentLightboxIndex = (currentLightboxIndex - 1 + filteredImages.length) % filteredImages.length;
    updateLightbox();
}

/**
 * Inicializar eventos
 */
function initEventListeners() {
    // Búsqueda
    searchInput.addEventListener('input', (e) => {
        searchImages(e.target.value);
    });
    
    // Filtros
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterByCategory(btn.dataset.filter);
        });
    });
    
    // Vista toggle
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            changeView(btn.dataset.view);
        });
    });
    
    // Lightbox controls
    document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    document.querySelector('.lightbox-next').addEventListener('click', nextImage);
    document.querySelector('.lightbox-prev').addEventListener('click', prevImage);
    
    // Cerrar lightbox al hacer clic fuera
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Navegación con teclado
    document.addEventListener('keydown', (e) => {
        // Atajo para búsqueda
        if (e.key === '/' && e.target !== searchInput) {
            e.preventDefault();
            searchInput.focus();
        }
        
        // Lightbox controls
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
    });
}

/**
 * Inicializar la aplicación
 */
function initApp() {
    createStars();
    initEventListeners();
    renderGallery();
    showNotification('Galería cargada correctamente');
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);
