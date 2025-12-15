// Datos de las imágenes
const images = [
    {
        id: 1,
        url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
        title: 'Montañas al Amanecer',
        category: 'naturaleza',
        description: 'Hermoso paisaje montañoso al amanecer'
    },
    {
        id: 2,
        url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=500',
        title: 'Ciudad Moderna',
        category: 'ciudad',
        description: 'Rascacielos en una gran ciudad'
    },
    {
        id: 3,
        url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500',
        title: 'Tecnología Digital',
        category: 'tecnologia',
        description: 'Circuitos y tecnología moderna'
    },
    {
        id: 4,
        url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500',
        title: 'Retrato Profesional',
        category: 'personas',
        description: 'Fotografía de retrato profesional'
    },
    {
        id: 5,
        url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500',
        title: 'Bosque Mágico',
        category: 'naturaleza',
        description: 'Sendero en un bosque encantado'
    },
    {
        id: 6,
        url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=500',
        title: 'Skyline Nocturno',
        category: 'ciudad',
        description: 'Ciudad iluminada de noche'
    },
    {
        id: 7,
        url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=500',
        title: 'Gadgets Modernos',
        category: 'tecnologia',
        description: 'Dispositivos tecnológicos'
    },
    {
        id: 8,
        url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500',
        title: 'Equipo de Trabajo',
        category: 'personas',
        description: 'Grupo de personas trabajando'
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

/**
 * Renderizar galería
 */
function renderGallery(imagesToRender = images) {
    // Limpiar galería
    gallery.innerHTML = '';
    
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
}

/**
 * Filtrar por categoría
 */
function filterByCategory(category) {
    currentFilter = category;
    applyFilters();
}

/**
 * Buscar imágenes
 */
function searchImages(query) {
    applyFilters(query);
}

/**
 * Aplicar todos los filtros
 */
function applyFilters(searchQuery = '') {
    filteredImages = images.filter(image => {
        const matchesCategory = currentFilter === 'all' || image.category === currentFilter;
        const matchesSearch = searchQuery === '' || 
            image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            image.description.toLowerCase().includes(searchQuery.toLowerCase());
        
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
    } else {
        gallery.classList.remove('list-view');
    }
}

/**
 * Abrir lightbox
 */
function openLightbox(index) {
    currentLightboxIndex = index;
    updateLightbox();
    lightbox.classList.add('active');
}

/**
 * Cerrar lightbox
 */
function closeLightbox() {
    lightbox.classList.remove('active');
}

/**
 * Actualizar contenido del lightbox
 */
function updateLightbox() {
    const image = filteredImages[currentLightboxIndex];
    lightboxImg.src = image.url;
    lightboxTitle.textContent = image.title;
    lightboxCategory.textContent = image.category;
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

// Event listeners
searchInput.addEventListener('input', (e) => {
    searchImages(e.target.value);
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterByCategory(btn.dataset.filter);
    });
});

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

// Navegación con teclado en lightbox
document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
});

// Inicializar
renderGallery();
