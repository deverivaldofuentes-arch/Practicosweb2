// Al principio del archivo, actualiza la clase ListManager para mejoras

class ListManager {
    constructor() {
        this.init();
    }

    init() {
        // Elementos del DOM
        this.elements = {
            itemInput: document.getElementById('itemInput'),
            addBtn: document.getElementById('addBtn'),
            itemList: document.getElementById('itemList'),
            itemCount: document.getElementById('itemCount'),
            lastAdded: document.getElementById('lastAdded'),
            streak: document.getElementById('streak'),
            clearAllBtn: document.getElementById('clearAllBtn'),
            emptyState: document.getElementById('emptyState'),
            addExampleBtn: document.getElementById('addExampleBtn'),
            searchInput: document.getElementById('searchInput'),
            filterButtons: document.querySelectorAll('.filter-btn'),
            selectAll: document.getElementById('selectAll'),
            completeSelected: document.getElementById('completeSelected'),
            deleteSelected: document.getElementById('deleteSelected'),
            exportBtn: document.getElementById('exportBtn'),
            importBtn: document.getElementById('importBtn'),
            notification: document.getElementById('notification'),
            notificationText: document.getElementById('notificationText'),
            confirmModal: document.getElementById('confirmModal'),
            modalMessage: document.getElementById('modalMessage'),
            modalClose: document.querySelector('.modal-close'),
            cancelBtn: document.querySelector('.btn-cancel'),
            confirmBtn: document.querySelector('.btn-confirm')
        };

        this.state = {
            items: [],
            currentFilter: 'all',
            selectedItems: new Set(),
            editingItem: null,
            modalCallback: null,
            lastActionDate: null,
            streakDays: 0
        };

        // Configurar efectos de sonido (opcional)
        this.sounds = {
            add: new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=='),
            complete: new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=='),
            delete: new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==')
        };

        this.setupEventListeners();
        this.loadFromLocalStorage();
        this.updateUI();
        this.checkDailyStreak();
        
        // Configurar verificación de racha cada 30 minutos
        setInterval(() => this.checkDailyStreak(), 1800000);
        
        // Mostrar notificación de bienvenida
        setTimeout(() => {
            this.showNotification('Sistema de gestión cargado ✓', 'success');
        }, 1000);
    }

    // ... (mantener el resto de métodos como están, pero añadir mejoras) ...

    // Mejorar showNotification para incluir íconos dinámicos
    showNotification(message, type = 'success') {
        const colors = {
            success: '#00ff9d',
            error: '#ff4757',
            warning: '#ffcc00',
            info: '#00a8ff'
        };
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        this.elements.notification.style.background = colors[type];
        this.elements.notificationText.innerHTML = `<i class="${icons[type]}"></i> ${message}`;
        this.elements.notification.classList.add('show');
        
        setTimeout(() => {
            this.elements.notification.classList.remove('show');
        }, 3000);
    }

    // Mejorar addItem con validaciones mejoradas
    addItem() {
        const text = this.elements.itemInput.value.trim();
        
        if (!text) {
            this.showNotification('Por favor ingresa una tarea válida', 'warning');
            this.elements.itemInput.classList.add('shake');
            setTimeout(() => this.elements.itemInput.classList.remove('shake'), 500);
            return;
        }

        if (text.length > 100) {
            this.showNotification('La tarea no puede exceder 100 caracteres', 'warning');
            return;
        }

        // Verificar duplicados recientes
        const duplicate = this.state.items.find(item => 
            item.text.toLowerCase() === text.toLowerCase() && 
            new Date(item.createdAt) > new Date(Date.now() - 86400000) // Últimas 24h
        );
        
        if (duplicate) {
            this.showNotification('Esta tarea ya fue añadida recientemente', 'info');
            return;
        }

        const item = this.createItemObject(text);
        this.state.items.unshift(item);
        
        this.elements.itemInput.value = '';
        this.elements.itemInput.focus();
        
        this.saveToLocalStorage();
        this.updateUI();
        this.updateStreak();
        this.showNotification('Tarea añadida al sistema', 'success');
        
        // Efecto visual mejorado
        const addBtn = this.elements.addBtn;
        addBtn.classList.add('pulse');
        setTimeout(() => addBtn.classList.remove('pulse'), 300);
    }

    // Mejorar renderItem para incluir más información
    renderItem(item) {
        const isSelected = this.state.selectedItems.has(item.id);
        const completedClass = item.completed ? 'completed' : '';
        const checkedClass = item.completed ? 'checked' : '';
        
        const timeAgo = this.getTimeAgo(item.createdAt);
        const priorityClass = this.getPriorityClass(item);
        
        return `
            <li class="list-item ${completedClass} ${priorityClass}" data-id="${item.id}">
                <div class="item-checkbox ${checkedClass}" data-action="toggle"></div>
                <span class="item-text">${this.escapeHtml(item.text)}</span>
                <input type="text" class="edit-input" value="${this.escapeHtml(item.text)}" maxlength="100">
                <div class="item-meta">
                    <span class="item-time">
                        <i class="far fa-clock"></i> ${timeAgo}
                    </span>
                    ${item.completed ? `
                        <span class="item-completed">
                            <i class="fas fa-check"></i> Completado
                        </span>
                    ` : ''}
                </div>
                <div class="item-buttons">
                    ${!item.completed ? `
                        <button class="btn-icon btn-complete" title="Completar tarea" data-action="complete">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                    <button class="btn-icon btn-edit" title="Editar tarea" data-action="edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-save" title="Guardar cambios" data-action="save">
                        <i class="fas fa-save"></i>
                    </button>
                    <button class="btn-icon btn-delete" title="Eliminar tarea" data-action="delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </li>
        `;
    }

    // Nuevo método para determinar prioridad
    getPriorityClass(item) {
        const text = item.text.toLowerCase();
        if (text.includes('urgente') || text.includes('importante') || text.includes('!!!')) {
            return 'priority-high';
        } else if (text.includes('recordar') || text.includes('pendiente')) {
            return 'priority-medium';
        }
        return 'priority-low';
    }

    // Mejorar updateUI para incluir estadísticas actualizadas
    updateUI() {
        const filteredItems = this.getFilteredItems();
        
        if (filteredItems.length === 0) {
            this.elements.emptyState.classList.add('show');
            this.elements.itemList.innerHTML = '';
        } else {
            this.elements.emptyState.classList.remove('show');
            this.elements.itemList.innerHTML = filteredItems
                .map(item => this.renderItem(item))
                .join('');
        }
        
        // Actualizar estadísticas
        const totalCount = this.state.items.length;
        const last24hCount = this.state.items.filter(item => {
            const itemDate = new Date(item.createdAt);
            const now = new Date();
            return (now - itemDate) < 86400000; // 24 horas en milisegundos
        }).length;
        
        this.elements.itemCount.textContent = totalCount;
        this.elements.lastAdded.textContent = last24hCount;
        
        this.updateSelectAllState();
    }

    // Mejorar updateStreak para lógica más robusta
    updateStreak() {
        const today = new Date().toISOString().split('T')[0];
        
        // Si es la primera vez
        if (!this.state.lastActionDate) {
            this.state.streakDays = 1;
            this.state.lastActionDate = today;
            this.saveStreakToLocalStorage();
            this.elements.streak.textContent = this.state.streakDays;
            return;
        }
        
        // Si ya hay acción hoy
        if (this.state.lastActionDate === today) {
            return;
        }
        
        const lastDate = new Date(this.state.lastActionDate);
        const currentDate = new Date(today);
        
        // Calcular diferencia en días
        const timeDiff = currentDate.getTime() - lastDate.getTime();
        const dayDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
        
        if (dayDiff === 1) {
            // Día consecutivo
            this.state.streakDays++;
            this.state.lastActionDate = today;
            if (this.state.streakDays % 7 === 0) {
                this.showNotification(`¡Increíble! ${this.state.streakDays} días de racha`, 'success');
            } else if (this.state.streakDays > 1) {
                this.showNotification(`Racha: ${this.state.streakDays} días`, 'info');
            }
        } else if (dayDiff > 1) {
            // Rompió la racha
            const oldStreak = this.state.streakDays;
            this.state.streakDays = 1;
            this.state.lastActionDate = today;
            if (oldStreak > 3) {
                this.showNotification(`Racha de ${oldStreak} días perdida`, 'warning');
            }
        }
        
        this.saveStreakToLocalStorage();
        this.elements.streak.textContent = this.state.streakDays;
    }

    // Mejorar exportItems con formato mejorado
    exportItems() {
        const exportData = {
            app: 'Lista Futurista Pro',
            version: '2.0',
            exportDate: new Date().toISOString(),
            totalItems: this.state.items.length,
            streakDays: this.state.streakDays,
            items: this.state.items.map(item => ({
                text: item.text,
                completed: item.completed,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
                priority: this.getPriorityClass(item)
            }))
        };
        
        const data = JSON.stringify(exportData, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().split('T')[0];
        a.download = `lista-futurista-${date}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        setTimeout(() => URL.revokeObjectURL(url), 100);
        
        this.showNotification('Datos exportados correctamente', 'success');
    }

    // Mejorar importItems con validaciones mejoradas
    importItems() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            if (file.size > 1024 * 1024) {
                this.showNotification('El archivo es demasiado grande (máximo 1MB)', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    
                    let itemsToImport = [];
                    
                    if (Array.isArray(importedData)) {
                        itemsToImport = importedData;
                    } else if (importedData && typeof importedData === 'object' && importedData.items) {
                        itemsToImport = importedData.items;
                    } else {
                        throw new Error('Formato de archivo no válido');
                    }
                    
                    const validItems = itemsToImport.filter(item => {
                        return item && 
                               typeof item === 'object' && 
                               'text' in item && 
                               typeof item.text === 'string' &&
                               item.text.trim().length > 0 &&
                               item.text.length <= 100;
                    }).map(item => ({
                        id: this.generateId(),
                        text: item.text.trim(),
                        completed: Boolean(item.completed || false),
                        createdAt: item.createdAt || new Date().toISOString(),
                        updatedAt: item.updatedAt || new Date().toISOString()
                    }));
                    
                    if (validItems.length === 0) {
                        this.showNotification('No se encontraron tareas válidas en el archivo', 'error');
                        return;
                    }
                    
                    this.showModal(
                        `¿Importar ${validItems.length} tareas?<br><small>Se añadirán a las ${this.state.items.length} existentes</small>`,
                        () => {
                            // Combinar sin duplicados
                            const existingTexts = new Set(this.state.items.map(item => item.text.toLowerCase()));
                            const newItems = validItems.filter(item => 
                                !existingTexts.has(item.text.toLowerCase())
                            );
                            
                            this.state.items = [...newItems, ...this.state.items];
                            
                            this.saveToLocalStorage();
                            this.updateUI();
                            this.updateStreak();
                            this.showNotification(`${newItems.length} tareas importadas exitosamente`, 'success');
                        }
                    );
                    
                } catch (error) {
                    console.error('Error al importar:', error);
                    this.showNotification('Error: Archivo JSON inválido o corrupto', 'error');
                }
            };
            
            reader.onerror = () => {
                this.showNotification('Error al leer el archivo seleccionado', 'error');
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    // Añadir métodos para manejar atajos de teclado globales
    setupEventListeners() {
        // ... (mantener eventos existentes) ...
        
        // Atajos de teclado globales
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + N: Nueva tarea
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.elements.itemInput.focus();
            }
            
            // Ctrl/Cmd + F: Buscar
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                this.elements.searchInput.focus();
            }
            
            // Escape: Cancelar edición o cerrar modal
            if (e.key === 'Escape') {
                if (this.state.editingItem) {
                    const listItem = document.querySelector(`[data-id="${this.state.editingItem}"]`);
                    if (listItem) {
                        listItem.classList.remove('editing');
                        this.state.editingItem = null;
                    }
                }
                if (this.elements.confirmModal.classList.contains('show')) {
                    this.hideModal();
                }
            }
            
            // Ctrl/Cmd + A: Seleccionar todos (solo cuando no está en input)
            if ((e.ctrlKey || e.metaKey) && e.key === 'a' && 
                !this.elements.itemInput.matches(':focus') && 
                !this.elements.searchInput.matches(':focus')) {
                e.preventDefault();
                this.toggleSelectAll(true);
            }
        });
    }
}

// Agregar CSS adicional dinámicamente para las prioridades
const style = document.createElement('style');
style.textContent = `
    .list-item.priority-high {
        border-left: 4px solid #ff4757;
        background: linear-gradient(135deg, 
            rgba(255, 71, 87, 0.05), 
            rgba(255, 71, 87, 0.02));
    }
    
    .list-item.priority-medium {
        border-left: 4px solid #ffcc00;
        background: linear-gradient(135deg, 
            rgba(255, 204, 0, 0.05), 
            rgba(255, 204, 0, 0.02));
    }
    
    .list-item.priority-low {
        border-left: 4px solid #00a8ff;
        background: linear-gradient(135deg, 
            rgba(0, 168, 255, 0.05), 
            rgba(0, 168, 255, 0.02));
    }
    
    .item-completed {
        background: rgba(0, 255, 157, 0.1);
        color: #00ff9d;
        padding: 0.3rem 0.8rem;
        border-radius: 15px;
        font-size: 0.8rem;
        display: flex;
        align-items: center;
        gap: 0.3rem;
        border: 1px solid rgba(0, 255, 157, 0.3);
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
    
    .pulse {
        animation: pulse 0.3s ease-in-out;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .shake {
        animation: shake 0.5s ease-in-out;
    }
`;
document.head.appendChild(style);

// Función para generar archivo de ejemplo mejorado
function createExampleJSON() {
    const exampleData = {
        app: "Lista Futurista Pro",
        version: "2.0",
        exportDate: new Date().toISOString(),
        totalItems: 5,
        streakDays: 7,
        items: [
            {
                text: "Completar proyecto web URGENTE",
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                text: "Revisar documentación técnica",
                completed: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                text: "Planificar reunión importante",
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                text: "Estudiar nuevas tecnologías",
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                text: "Optimizar rendimiento del sistema",
                completed: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ]
    };
    
    const data = JSON.stringify(exampleData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ejemplo-lista-futurista.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('Archivo de ejemplo descargado: ejemplo-lista-futurista.json');
}

// Función para limpiar caché (solo para desarrollo)
function clearCache() {
    if (confirm('¿Eliminar todos los datos locales? Esto borrará todas las tareas y configuraciones.')) {
        localStorage.clear();
        location.reload();
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const listManager = new ListManager();
    
    // Exponer para debugging
    window.listManager = listManager;
    window.createExampleJSON = createExampleJSON;
    window.clearCache = clearCache;
    
    // Estadísticas iniciales
    console.log('🚀 Lista Futurista Pro v2.0');
    console.log('📊 Tareas cargadas:', listManager.state.items.length);
    console.log('🔥 Racha actual:', listManager.state.streakDays, 'días');
});
