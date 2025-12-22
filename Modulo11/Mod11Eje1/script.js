// ================================
// INICIALIZACIÓN Y VARIABLES
// ================================
document.addEventListener('DOMContentLoaded', () => {
    // Cargar datos de LocalStorage al inicio
    const saved = localStorage.getItem('userInput');
    if (saved) {
        document.getElementById('storageInput').value = saved;
        updateStorageDisplay();
    }
});

// ================================
// GEOLOCATION API
// ================================
document.getElementById('getLocation').addEventListener('click', () => {
    const result = document.getElementById('locationResult');
    result.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Obteniendo ubicación...</p>';
    
    if ('geolocation' in navigator) {
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const accuracy = position.coords.accuracy;
                
                result.className = 'result success';
                result.innerHTML = `
                    <p><strong><i class="fas fa-map-pin"></i> Ubicación Obtenida:</strong></p>
                    <p><i class="fas fa-latitude"></i> <strong>Latitud:</strong> ${lat.toFixed(6)}°</p>
                    <p><i class="fas fa-longitude"></i> <strong>Longitud:</strong> ${lon.toFixed(6)}°</p>
                    <p><i class="fas fa-crosshairs"></i> <strong>Precisión:</strong> ${accuracy.toFixed(0)} metros</p>
                    <p><i class="fas fa-history"></i> <strong>Hora:</strong> ${new Date(position.timestamp).toLocaleTimeString()}</p>
                    <a href="https://www.google.com/maps?q=${lat},${lon}" target="_blank" class="map-link">
                        <i class="fas fa-external-link-alt"></i> Ver en Google Maps
                    </a>
                `;
            },
            (error) => {
                result.className = 'result error';
                let message = 'Error desconocido';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Permiso denegado por el usuario';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Información de ubicación no disponible';
                        break;
                    case error.TIMEOUT:
                        message = 'Tiempo de espera agotado';
                        break;
                }
                result.innerHTML = `<p><i class="fas fa-exclamation-triangle"></i> ${message}</p>`;
            },
            options
        );
    } else {
        result.className = 'result error';
        result.innerHTML = '<p><i class="fas fa-times-circle"></i> Geolocalización no está soportada en este navegador</p>';
    }
});

// ================================
// LOCALSTORAGE API
// ================================
const storageInput = document.getElementById('storageInput');
const storageResult = document.getElementById('storageResult');

function updateStorageDisplay() {
    const saved = localStorage.getItem('userInput');
    const timestamp = localStorage.getItem('timestamp');
    
    if (saved) {
        storageResult.className = 'result success';
        storageResult.innerHTML = `
            <p><strong><i class="fas fa-check-circle"></i> Datos guardados:</strong></p>
            <p>"${saved}"</p>
            <p><i class="fas fa-clock"></i> <small>Guardado el: ${timestamp || 'Desconocido'}</small></p>
        `;
    } else {
        storageResult.className = 'result';
        storageResult.innerHTML = '<p><i class="fas fa-info-circle"></i> No hay datos guardados</p>';
    }
}

document.getElementById('saveStorage').addEventListener('click', () => {
    const value = storageInput.value.trim();
    if (value) {
        localStorage.setItem('userInput', value);
        localStorage.setItem('timestamp', new Date().toLocaleString());
        updateStorageDisplay();
        
        // Mostrar notificación de éxito
        showToast('Datos guardados exitosamente', 'success');
    } else {
        storageResult.className = 'result error';
        storageResult.innerHTML = '<p><i class="fas fa-exclamation-triangle"></i> Por favor, escribe algo para guardar</p>';
    }
});

document.getElementById('loadStorage').addEventListener('click', () => {
    updateStorageDisplay();
});

document.getElementById('clearStorage').addEventListener('click', () => {
    if (confirm('¿Estás seguro de que quieres limpiar todos los datos guardados?')) {
        localStorage.removeItem('userInput');
        localStorage.removeItem('timestamp');
        storageInput.value = '';
        updateStorageDisplay();
        showToast('Datos eliminados', 'warning');
    }
});

// ================================
// FETCH API
// ================================
document.getElementById('fetchData').addEventListener('click', async () => {
    const result = document.getElementById('fetchResult');
    result.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Cargando datos...</p>';
    
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users/1');
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        result.className = 'result success';
        result.innerHTML = `
            <p><strong><i class="fas fa-user"></i> Información del Usuario:</strong></p>
            <p><i class="fas fa-id-card"></i> <strong>Nombre:</strong> ${data.name}</p>
            <p><i class="fas fa-envelope"></i> <strong>Email:</strong> ${data.email}</p>
            <p><i class="fas fa-city"></i> <strong>Ciudad:</strong> ${data.address.city}</p>
            <p><i class="fas fa-building"></i> <strong>Empresa:</strong> ${data.company.name}</p>
            <p><i class="fas fa-phone"></i> <strong>Teléfono:</strong> ${data.phone}</p>
            <p><i class="fas fa-globe"></i> <strong>Sitio Web:</strong> ${data.website}</p>
        `;
    } catch (error) {
        result.className = 'result error';
        result.innerHTML = `
            <p><i class="fas fa-exclamation-triangle"></i> Error al cargar los datos</p>
            <p><small>${error.message}</small></p>
            <p><small>Intenta verificar tu conexión a internet</small></p>
        `;
    }
});

// ================================
// CANVAS API
// ================================
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Dibujar borde inicial
ctx.strokeStyle = '#e0e0e0';
ctx.lineWidth = 2;
ctx.strokeRect(0, 0, canvas.width, canvas.height);

document.getElementById('drawRect').addEventListener('click', () => {
    const x = Math.random() * (canvas.width - 100);
    const y = Math.random() * (canvas.height - 100);
    const width = 50 + Math.random() * 100;
    const height = 50 + Math.random() * 100;
    
    ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 60%)`;
    ctx.fillRect(x, y, width, height);
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    showToast('Rectángulo dibujado', 'info');
});

document.getElementById('drawCircle').addEventListener('click', () => {
    const x = 30 + Math.random() * (canvas.width - 60);
    const y = 30 + Math.random() * (canvas.height - 60);
    const radius = 20 + Math.random() * 50;
    
    ctx.fillStyle = `hsl(${Math.random() * 360}, 70%, 60%)`;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    showToast('Círculo dibujado', 'info');
});

document.getElementById('clearCanvas').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Redibujar borde
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    showToast('Canvas limpiado', 'warning');
});

// ================================
// DRAG AND DROP API
// ================================
const draggables = document.querySelectorAll('.draggable');
const zones = document.querySelectorAll('.zone');
const dragResult = document.getElementById('dragResult');

let draggedItem = null;

draggables.forEach(draggable => {
    draggable.addEventListener('dragstart', (e) => {
        draggedItem = draggable;
        draggable.classList.add('dragging');
        e.dataTransfer.setData('text/plain', draggable.dataset.id);
        e.dataTransfer.effectAllowed = 'move';
    });
    
    draggable.addEventListener('dragend', () => {
        draggable.classList.remove('dragging');
        draggedItem = null;
    });
});

zones.forEach(zone => {
    zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('dragover');
        e.dataTransfer.dropEffect = 'move';
    });
    
    zone.addEventListener('dragleave', () => {
        zone.classList.remove('dragover');
    });
    
    zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        
        if (draggedItem) {
            const itemName = draggedItem.textContent.trim();
            const fromZone = draggedItem.parentElement.id;
            const toZone = zone.id;
            
            // Evitar soltar en la misma zona
            if (fromZone !== toZone) {
                zone.appendChild(draggedItem);
                dragResult.className = 'result success';
                dragResult.innerHTML = `
                    <p><i class="fas fa-check-circle"></i> Elemento movido</p>
                    <p><strong>${itemName}</strong> movido de <em>${getZoneName(fromZone)}</em> a <em>${getZoneName(toZone)}</em></p>
                `;
                
                // Reordenar elementos
                const draggableElements = zone.querySelectorAll('.draggable');
                draggableElements.forEach((el, index) => {
                    el.style.order = index;
                });
            }
        }
    });
});

function getZoneName(zoneId) {
    const zones = {
        'zone1': 'Zona Origen',
        'zone2': 'Zona Destino'
    };
    return zones[zoneId] || zoneId;
}

// ================================
// NOTIFICATION API
// ================================
const requestBtn = document.getElementById('requestNotification');
const showBtn = document.getElementById('showNotification');
const notifResult = document.getElementById('notificationResult');

// Verificar estado actual de permisos
if ('Notification' in window) {
    if (Notification.permission === 'granted') {
        showBtn.disabled = false;
        notifResult.innerHTML = '<p><i class="fas fa-check-circle"></i> Permiso ya concedido</p>';
    } else if (Notification.permission === 'denied') {
        notifResult.innerHTML = '<p><i class="fas fa-exclamation-triangle"></i> Permiso denegado previamente</p>';
    }
}

requestBtn.addEventListener('click', async () => {
    if ('Notification' in window) {
        try {
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                showBtn.disabled = false;
                notifResult.className = 'result success';
                notifResult.innerHTML = '<p><i class="fas fa-check-circle"></i> Permiso concedido. Puedes mostrar notificaciones.</p>';
                showToast('Permiso para notificaciones concedido', 'success');
            } else if (permission === 'denied') {
                notifResult.className = 'result error';
                notifResult.innerHTML = '<p><i class="fas fa-times-circle"></i> Permiso denegado. No se pueden mostrar notificaciones.</p>';
            } else {
                notifResult.className = 'result';
                notifResult.innerHTML = '<p><i class="fas fa-info-circle"></i> Permiso no decidido.</p>';
            }
        } catch (error) {
            notifResult.className = 'result error';
            notifResult.innerHTML = `<p><i class="fas fa-exclamation-triangle"></i> Error: ${error.message}</p>`;
        }
    } else {
        notifResult.className = 'result error';
        notifResult.innerHTML = '<p><i class="fas fa-times-circle"></i> API de Notificaciones no soportada en este navegador</p>';
    }
});

showBtn.addEventListener('click', () => {
    if (Notification.permission === 'granted') {
        const notification = new Notification('¡Hola desde HTML5!', {
            body: 'Esta es una notificación de demostración del Explorador de APIs',
            icon: 'https://cdn-icons-png.flaticon.com/512/561/561127.png',
            tag: 'demo-notification',
            requireInteraction: false
        });
        
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
        
        // Cerrar automáticamente después de 5 segundos
        setTimeout(() => {
            notification.close();
        }, 5000);
        
        showToast('Notificación mostrada', 'success');
    }
});

// ================================
// FUNCIONES UTILITARIAS
// ================================
function showToast(message, type = 'info') {
    // Crear toast si no existe
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${getToastIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Mostrar toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Ocultar y eliminar después de 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function getToastIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-triangle',
        'warning': 'exclamation-circle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Agregar estilos para toast
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .toast-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .toast {
        background: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 10px;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease;
        min-width: 250px;
    }
    
    .toast.show {
        transform: translateX(0);
        opacity: 1;
    }
    
    .toast-success {
        border-left: 4px solid #4caf50;
    }
    
    .toast-error {
        border-left: 4px solid #f44336;
    }
    
    .toast-warning {
        border-left: 4px solid #ff9800;
    }
    
    .toast-info {
        border-left: 4px solid #2196f3;
    }
    
    .toast i {
        font-size: 1.2rem;
    }
    
    .toast-success i {
        color: #4caf50;
    }
    
    .toast-error i {
        color: #f44336;
    }
    
    .toast-warning i {
        color: #ff9800;
    }
    
    .toast-info i {
        color: #2196f3;
    }
    
    .map-link {
        display: inline-block;
        margin-top: 10px;
        padding: 5px 10px;
        background: #667eea;
        color: white;
        border-radius: 4px;
        text-decoration: none;
        font-size: 0.9rem;
    }
    
    .map-link:hover {
        background: #5a6fd8;
    }
`;
document.head.appendChild(toastStyles);
