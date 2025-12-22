/**
 * PAINT PRO ULTRA - EDITOR PROFESIONAL DE IMÁGENES
 */

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });

// Variables de estado
let isDrawing = false;
let startX, startY;
let currentTool = 'brush';
let snapshot;
let needsSnapshot = true;
let zoomLevel = 1;
let isGridVisible = false;

// Referencias a elementos DOM
const colorPicker = document.getElementById('colorPicker');
const colorValue = document.getElementById('colorValue');
const lineWidth = document.getElementById('lineWidth');
const wLabel = document.getElementById('wLabel');
const currentToolDisplay = document.getElementById('currentTool');
const cursorPos = document.getElementById('cursorPos');
const zoomLevelDisplay = document.getElementById('zoomLevel');
const canvasGrid = document.getElementById('canvasGrid');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');

/**
 * 1. CONFIGURACIÓN INICIAL
 */
function init() {
    // Configurar tamaño del lienzo
    canvas.width = 1000;
    canvas.height = 700;
    
    // Fondo blanco inicial
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Configurar estilo por defecto
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 5;
    
    // Inicializar valores de UI
    colorValue.textContent = colorPicker.value.toUpperCase();
    wLabel.textContent = `${lineWidth.value}px`;
    
    // Actualizar estado de herramienta
    updateToolInfo();
    
    // Configurar eventos adicionales
    setupAdditionalEvents();
    
    showNotification('Paint Pro Ultra - Editor listo');
}

/**
 * 2. EVENTOS ADICIONALES
 */
function setupAdditionalEvents() {
    // Actualizar color al cambiar el selector
    colorPicker.addEventListener('input', (e) => {
        colorValue.textContent = e.target.value.toUpperCase();
        ctx.strokeStyle = e.target.value;
        ctx.fillStyle = e.target.value;
    });
    
    // Actualizar grosor
    lineWidth.addEventListener('input', (e) => {
        wLabel.textContent = `${e.target.value}px`;
        ctx.lineWidth = parseInt(e.target.value);
    });
    
    // Control de zoom
    document.getElementById('zoomIn').addEventListener('click', () => {
        zoomLevel = Math.min(zoomLevel + 0.1, 2);
        updateZoom();
    });
    
    document.getElementById('zoomOut').addEventListener('click', () => {
        zoomLevel = Math.max(zoomLevel - 0.1, 0.5);
        updateZoom();
    });
    
    // Mostrar/ocultar cuadrícula
    document.getElementById('toggleGrid').addEventListener('click', () => {
        isGridVisible = !isGridVisible;
        canvasGrid.classList.toggle('active', isGridVisible);
        showNotification(`Cuadrícula ${isGridVisible ? 'activada' : 'desactivada'}`);
    });
    
    // Seguimiento de cursor
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = Math.round((e.clientX - rect.left) / zoomLevel);
        const y = Math.round((e.clientY - rect.top) / zoomLevel);
        cursorPos.textContent = `X: ${x}, Y: ${y}`;
    });
    
    // Atajo de teclado Ctrl+Z para deshacer
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            showNotification('Función de deshacer en desarrollo');
        }
        
        // Atajo Ctrl+S para guardar
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            downloadCanvas();
        }
    });
}

/**
 * 3. CARGA DE IMÁGENES EXTERNAS
 */
document.getElementById('imageLoader').addEventListener('change', function(e) {
    if (!e.target.files[0]) return;
    
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const img = new Image();
        img.onload = function() {
            // Limpiar lienzo
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Calcular dimensiones para mantener relación de aspecto
            const scale = Math.min(
                canvas.width / img.width,
                canvas.height / img.height
            );
            const x = (canvas.width - img.width * scale) / 2;
            const y = (canvas.height - img.height * scale) / 2;
            
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
            showNotification('Imagen cargada correctamente');
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
});

/**
 * 4. SISTEMA DE FILTROS PROFESIONAL
 */
function applyFilter(type) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (type === 'gray') {
            // Fórmula de luminosidad para grises
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            data[i] = data[i + 1] = data[i + 2] = gray;
        } else if (type === 'invert') {
            // Inversión de colores
            data[i] = 255 - r;
            data[i + 1] = 255 - g;
            data[i + 2] = 255 - b;
        } else if (type === 'sepia') {
            // Filtro sepia profesional
            const tr = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
            const tg = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
            const tb = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
            data[i] = tr;
            data[i + 1] = tg;
            data[i + 2] = tb;
        }
    }
    
    ctx.putImageData(imageData, 0, 0);
    showNotification(`Filtro ${getFilterName(type)} aplicado`);
}

function getFilterName(type) {
    const names = {
        'gray': 'Escala de grises',
        'invert': 'Invertido',
        'sepia': 'Sepia'
    };
    return names[type] || type;
}

/**
 * 5. LÓGICA DE DIBUJO MEJORADA
 */
const startDraw = (e) => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    startX = (e.clientX - rect.left) / zoomLevel;
    startY = (e.clientY - rect.top) / zoomLevel;
    
    // Configurar estilo
    ctx.strokeStyle = colorPicker.value;
    ctx.fillStyle = colorPicker.value;
    ctx.lineWidth = parseInt(lineWidth.value);
    
    if (currentTool === 'brush' || currentTool === 'eraser') {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        needsSnapshot = false;
    } else {
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
        needsSnapshot = true;
    }
};

const drawing = (e) => {
    if (!isDrawing) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel;
    const y = (e.clientY - rect.top) / zoomLevel;

    if (currentTool === 'brush') {
        ctx.lineTo(x, y);
        ctx.stroke();
    } else if (currentTool === 'rectangle') {
        ctx.putImageData(snapshot, 0, 0);
        ctx.beginPath();
        const width = x - startX;
        const height = y - startY;
        ctx.rect(startX, startY, width, height);
        ctx.stroke();
    } else if (currentTool === 'circle') {
        ctx.putImageData(snapshot, 0, 0);
        const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
        ctx.beginPath();
        ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
        ctx.stroke();
    } else if (currentTool === 'eraser') {
        const originalComposite = ctx.globalCompositeOperation;
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = parseInt(lineWidth.value) * 2;
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.globalCompositeOperation = originalComposite;
    }
};

const stopDraw = () => {
    if (!isDrawing) return;
    isDrawing = false;
    
    if (currentTool === 'brush' || currentTool === 'eraser') {
        ctx.closePath();
    }
    
    // Guardar snapshot para la próxima operación
    if (needsSnapshot) {
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
};

/**
 * 6. FUNCIONES DE UTILIDAD
 */
function updateToolInfo() {
    const toolNames = {
        'brush': 'Pincel',
        'rectangle': 'Rectángulo',
        'circle': 'Círculo',
        'eraser': 'Borrador'
    };
    currentToolDisplay.textContent = toolNames[currentTool];
}

function updateZoom() {
    canvas.style.transform = `scale(${zoomLevel})`;
    zoomLevelDisplay.textContent = `${Math.round(zoomLevel * 100)}%`;
}

function showNotification(message) {
    notificationText.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function downloadCanvas() {
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    link.download = `paint-pro-ultra-${timestamp}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    showNotification('Imagen descargada correctamente');
}

/**
 * 7. CONFIGURACIÓN DE EVENTOS
 */
canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', drawing);
canvas.addEventListener('mouseup', stopDraw);
canvas.addEventListener('mouseout', stopDraw);

// Herramientas
document.querySelectorAll('.tool').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.tool.active').classList.remove('active');
        btn.classList.add('active');
        currentTool = btn.dataset.tool;
        updateToolInfo();
        showNotification(`Herramienta cambiada a: ${btn.querySelector('.tool-label').textContent}`);
    });
});

// Filtros
document.getElementById('filterGray').addEventListener('click', () => applyFilter('gray'));
document.getElementById('filterInvert').addEventListener('click', () => applyFilter('invert'));
document.getElementById('filterSepia').addEventListener('click', () => applyFilter('sepia'));

// Guardar
document.getElementById('downloadBtn').addEventListener('click', downloadCanvas);

// Limpiar lienzo
document.getElementById('clearBtn').addEventListener('click', () => {
    if (confirm('¿Estás seguro de que quieres limpiar el lienzo? Se perderá todo el trabajo actual.')) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        showNotification('Lienzo limpiado');
    }
});

// Inicializar aplicación
window.onload = init;
