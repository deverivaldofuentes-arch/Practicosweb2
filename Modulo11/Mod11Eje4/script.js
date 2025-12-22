// Elementos DOM
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const uploadArea = document.getElementById('uploadArea');
const gallery = document.getElementById('gallery');
const stats = document.getElementById('stats');
const totalImages = document.getElementById('totalImages');
const totalSize = document.getElementById('totalSize');
const maxResolution = document.getElementById('maxResolution');
const clearAllBtn = document.getElementById('clearAllBtn');
const downloadAllBtn = document.getElementById('downloadAllBtn');
const modal = document.getElementById('modal');
const modalImage = document.getElementById('modalImage');
const modalInfo = document.getElementById('modalInfo');
const modalClose = document.getElementById('modalClose');
const modalOverlay = document.getElementById('modalOverlay');
const emptyState = document.getElementById('emptyState');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');
const currentDate = document.getElementById('currentDate');
const viewBtns = document.querySelectorAll('.view-btn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const downloadBtn = document.getElementById('downloadBtn');
const rotateBtn = document.getElementById('rotateBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const currentImage = document.getElementById('currentImage');
const totalImagesModal = document.getElementById('totalImagesModal');
const zoomOut = document.getElementById('zoomOut');
const zoomIn = document.getElementById('zoomIn');
const zoomLevel = document.getElementById('zoomLevel');

// Variables de estado
let images = [];
let currentModalIndex = 0;
let currentZoom = 1;
let currentView = 'grid';
let rotation = 0;

// Inicialización
function init() {
    // Establecer fecha actual
    const now = new Date();
    currentDate.textContent = now.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Configurar eventos
    setupEventListeners();
    
    // Cargar imágenes del localStorage si existen
    loadFromLocalStorage();
    
    showNotification('Galería Pro inicializada', 'success');
}

/**
 * Configurar event listeners
 */
function setupEventListeners() {
    // Botón para seleccionar archivos
    browseBtn.addEventListener('click', () => fileInput.click());
    
    // Cambio en el input de archivos
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
        e.target.value = '';
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    });
    
    // Limpiar todas las imágenes
    clearAllBtn.addEventListener('click', clearAllImages);
    
    // Descargar todas las imágenes
    downloadAllBtn.addEventListener('click', downloadAllImages);
    
    // Controles de vista
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            gallery.className = `gallery ${currentView}-view`;
            saveToLocalStorage();
        });
    });
    
    // Modal
    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    
    // Navegación del modal
    prevBtn.addEventListener('click', showPrevImage);
    nextBtn.addEventListener('click', showNextImage);
    
    // Controles del modal
    downloadBtn.addEventListener('click', downloadCurrentImage);
    rotateBtn.addEventListener('click', rotateImage);
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // Zoom
    zoomOut.addEventListener('click', () => adjustZoom(-0.1));
    zoomIn.addEventListener('click', () => adjustZoom(0.1));
    
    // Teclado
    document.addEventListener('keydown', handleKeydown);
    
    // ESC para cerrar modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (modal.classList.contains('active')) {
                closeModal();
            }
        }
    });
    
    // Cerrar modal al hacer clic fuera en móvil
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

/**
 * Formatear tamaño de archivo
 */
function formatSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Obtener resolución de una imagen
 */
function getImageResolution(src, callback) {
    const img = new Image();
    img.onload = function() {
        callback({
            width: this.width,
            height: this.height,
            ratio: (this.width / this.height).toFixed(2)
        });
    };
    img.onerror = function() {
        callback({ width: 0, height: 0, ratio: 0 });
    };
    img.src = src;
}

/**
 * Procesar archivos subidos
 */
function handleFiles(files) {
    const validFiles = Array.from(files).filter(file => {
        if (!file.type.startsWith('image/')) {
            showNotification(`${file.name} no es una imagen válida`, 'error');
            return false;
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB
            showNotification(`${file.name} excede el límite de 10MB`, 'error');
            return false;
        }
        
        if (images.length >= 50) {
            showNotification('Límite de 50 imágenes alcanzado', 'error');
            return false;
        }
        
        return true;
    });
    
    if (validFiles.length === 0) return;
    
    let processed = 0;
    
    validFiles.forEach(file => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            getImageResolution(e.target.result, (resolution) => {
                const imageData = {
                    id: Date.now() + Math.random(),
                    src: e.target.result,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    resolution: resolution,
                    uploadedAt: new Date().toISOString(),
                    rotation: 0
                };
                
                images.push(imageData);
                processed++;
                
                if (processed === validFiles.length) {
                    renderGallery();
                    updateStats();
                    saveToLocalStorage();
                    showNotification(`${validFiles.length} imagen(es) cargada(s)`, 'success');
                }
            });
        };
        
        reader.readAsDataURL(file);
    });
}

/**
 * Renderizar galería
 */
function renderGallery() {
    if (images.length === 0) {
        gallery.innerHTML = '';
        stats.style.display = 'none';
        emptyState.style.display = 'block';
        downloadAllBtn.style.display = 'none';
        return;
    }
    
    stats.style.display = 'block';
    emptyState.style.display = 'none';
    downloadAllBtn.style.display = 'flex';
    
    gallery.innerHTML = images.map((img, index) => {
        const dimensionClass = img.resolution.width > img.resolution.height ? 'landscape' : 'portrait';
        
        return `
            <div class="gallery-item" style="--span: ${Math.ceil(img.resolution.height / 50)}" data-index="${index}">
                <div class="gallery-image-container">
                    <img src="${img.src}" alt="${img.name}" class="gallery-image">
                    <div class="gallery-overlay">
                        <button class="btn-remove" onclick="removeImage(${img.id}, event)">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
                <div class="gallery-info">
                    <div class="image-name" title="${img.name}">${img.name}</div>
                    <div class="image-meta">
                        <span class="image-size">
                            <i class="fas fa-hdd"></i>
                            ${formatSize(img.size)}
                        </span>
                        <span class="image-resolution">
                            <i class="fas fa-expand-alt"></i>
                            ${img.resolution.width}×${img.resolution.height}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Agregar evento click a cada imagen
    document.querySelectorAll('.gallery-image').forEach((img, index) => {
        img.addEventListener('click', () => openModal(index));
    });
}

/**
 * Actualizar estadísticas
 */
function updateStats() {
    totalImages.textContent = images.length;
    totalImagesModal.textContent = images.length;
    
    const total = images.reduce((sum, img) => sum + img.size, 0);
    totalSize.textContent = formatSize(total);
    
    const maxRes = images.reduce((max, img) => {
        const totalPixels = img.resolution.width * img.resolution.height;
        const maxPixels = max.width * max.height;
        return totalPixels > maxPixels ? img.resolution : max;
    }, { width: 0, height: 0 });
    
    maxResolution.textContent = `${maxRes.width}×${maxRes.height}`;
}

/**
 * Eliminar imagen
 */
function removeImage(id, event) {
    if (event) event.stopPropagation();
    
    if (confirm('¿Eliminar esta imagen de la galería?')) {
        images = images.filter(img => img.id !== id);
        renderGallery();
        updateStats();
        saveToLocalStorage();
        showNotification('Imagen eliminada', 'info');
    }
}

/**
 * Limpiar todas las imágenes
 */
function clearAllImages() {
    if (images.length === 0) return;
    
    if (confirm(`¿Eliminar todas las imágenes (${images.length}) de la galería?`)) {
        images = [];
        renderGallery();
        updateStats();
        saveToLocalStorage();
        showNotification('Galería limpiada', 'info');
    }
}

/**
 * Descargar todas las imágenes
 */
function downloadAllImages() {
    if (images.length === 0) return;
    
    showNotification('Preparando descarga...', 'info');
    
    // En una implementación real, aquí se usaría una librería como JSZip
    // Para este ejemplo, descargamos la primera imagen
    if (images.length > 0) {
        const link = document.createElement('a');
        link.download = images[0].name;
        link.href = images[0].src;
        link.click();
        showNotification('Descarga iniciada', 'success');
    }
}

/**
 * Abrir modal con imagen
 */
function openModal(index) {
    currentModalIndex = index;
    rotation = 0;
    currentZoom = 1;
    
    updateModal();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Cerrar modal
 */
function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

/**
 * Actualizar contenido del modal
 */
function updateModal() {
    const img = images[currentModalIndex];
    if (!img) return;
    
    modalImage.src = img.src;
    modalImage.style.transform = `rotate(${rotation}deg) scale(${currentZoom})`;
    
    const uploadedDate = new Date(img.uploadedAt);
    modalInfo.innerHTML = `
        <div class="info-row">
            <strong>Nombre:</strong> ${img.name}
        </div>
        <div class="info-row">
            <strong>Tamaño:</strong> ${formatSize(img.size)}
        </div>
        <div class="info-row">
            <strong>Resolución:</strong> ${img.resolution.width} × ${img.resolution.height} (${img.resolution.ratio}:1)
        </div>
        <div class="info-row">
            <strong>Tipo:</strong> ${img.type}
        </div>
        <div class="info-row">
            <strong>Subido:</strong> ${uploadedDate.toLocaleDateString()} ${uploadedDate.toLocaleTimeString()}
        </div>
    `;
    
    currentImage.textContent = currentModalIndex + 1;
    totalImagesModal.textContent = images.length;
    zoomLevel.textContent = `${Math.round(currentZoom * 100)}%`;
    
    // Actualizar estado de botones de navegación
    prevBtn.disabled = currentModalIndex === 0;
    nextBtn.disabled = currentModalIndex === images.length - 1;
}

/**
 * Mostrar imagen anterior
 */
function showPrevImage() {
    if (currentModalIndex > 0) {
        currentModalIndex--;
        rotation = 0;
        currentZoom = 1;
        updateModal();
    }
}

/**
 * Mostrar siguiente imagen
 */
function showNextImage() {
    if (currentModalIndex < images.length - 1) {
        currentModalIndex++;
        rotation = 0;
        currentZoom = 1;
        updateModal();
    }
}

/**
 * Descargar imagen actual
 */
function downloadCurrentImage() {
    const img = images[currentModalIndex];
    if (!img) return;
    
    const link = document.createElement('a');
    link.download = `galeria-pro-${img.name}`;
    link.href = img.src;
    link.click();
    showNotification('Imagen descargada', 'success');
}

/**
 * Rotar imagen
 */
function rotateImage() {
    rotation = (rotation + 90) % 360;
    modalImage.style.transform = `rotate(${rotation}deg) scale(${currentZoom})`;
}

/**
 * Alternar pantalla completa
 */
function toggleFullscreen() {
    const elem = modalImage;
    
    if (!document.fullscreenElement) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

/**
 * Ajustar zoom
 */
function adjustZoom(delta) {
    currentZoom = Math.max(0.1, Math.min(3, currentZoom + delta));
    modalImage.style.transform = `rotate(${rotation}deg) scale(${currentZoom})`;
    zoomLevel.textContent = `${Math.round(currentZoom * 100)}%`;
}

/**
 * Manejar teclas
 */
function handleKeydown(e) {
    if (!modal.classList.contains('active')) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            showPrevImage();
            break;
        case 'ArrowRight':
            showNextImage();
            break;
        case '+':
        case '=':
            if (e.ctrlKey) adjustZoom(0.1);
            break;
        case '-':
            if (e.ctrlKey) adjustZoom(-0.1);
            break;
        case 'r':
            rotateImage();
            break;
        case ' ':
            e.preventDefault();
            showNextImage();
            break;
    }
}

/**
 * Mostrar notificación
 */
function showNotification(message, type = 'info') {
    notificationText.textContent = message;
    
    // Cambiar color según tipo
    if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #ff6b6b, #ff4757)';
    } else if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #4cc9f0, #0099ff)';
    } else {
        notification.style.background = 'linear-gradient(135deg, #7209b7, #4361ee)';
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

/**
 * Guardar en localStorage
 */
function saveToLocalStorage() {
    try {
        const data = {
            images: images,
            view: currentView
        };
        localStorage.setItem('galleryPro', JSON.stringify(data));
    } catch (e) {
        console.error('Error al guardar en localStorage:', e);
    }
}

/**
 * Cargar desde localStorage
 */
function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('galleryPro');
        if (saved) {
            const data = JSON.parse(saved);
            images = data.images || [];
            currentView = data.view || 'grid';
            
            // Actualizar vista
            viewBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.view === currentView);
            });
            gallery.className = `gallery ${currentView}-view`;
            
            if (images.length > 0) {
                renderGallery();
                updateStats();
                showNotification(`${images.length} imagen(es) cargada(s) desde almacenamiento`, 'info');
            }
        }
    } catch (e) {
        console.error('Error al cargar desde localStorage:', e);
    }
}

// Inicializar la aplicación cuando se cargue el DOM
document.addEventListener('DOMContentLoaded', init);

console.log('🎨 Galería Pro - Lista para usar');
