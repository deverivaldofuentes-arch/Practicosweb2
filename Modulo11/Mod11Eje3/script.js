// Elementos principales
const dropzones = document.querySelectorAll('.dropzone');
const resetBtn = document.getElementById('resetBtn');
const addBtn = document.getElementById('addBtn');
const saveBtn = document.getElementById('saveBtn');
const themeToggle = document.getElementById('themeToggle');
const exportBtn = document.getElementById('exportBtn');
const quickAddBtn = document.getElementById('quickAddBtn');
const searchInput = document.getElementById('searchInput');

// Elementos de estadísticas
const todoCount = document.getElementById('todoCount');
const progressCount = document.getElementById('progressCount');
const doneCount = document.getElementById('doneCount');
const totalCount = document.getElementById('totalCount');
const todoBadge = document.getElementById('todoBadge');
const progressBadge = document.getElementById('progressBadge');
const doneBadge = document.getElementById('doneBadge');
const progressPercent = document.getElementById('progressPercent');
const activityFeed = document.getElementById('activityFeed');

// Elementos del modal
const taskModal = document.getElementById('taskModal');
const taskTitle = document.getElementById('taskTitle');
const taskDescription = document.getElementById('taskDescription');
const taskDueDate = document.getElementById('taskDueDate');
const priorityOptions = document.querySelectorAll('.priority-option');
const modalConfirm = document.querySelector('.modal-confirm');
const modalCancel = document.querySelector('.modal-cancel');
const modalClose = document.querySelector('.modal-close');

let draggedItem = null;
let nextId = 1; // Empezar desde 1 cuando no hay tareas
let currentPriority = 'medium';
let activityLog = [];

// Prioridades disponibles
const priorities = [
    { name: 'Alta', class: 'high', color: '#ff6b6b' },
    { name: 'Media', class: 'medium', color: '#ffd166' },
    { name: 'Baja', class: 'low', color: '#a0d2ff' }
];

// Datos iniciales VACÍOS
const initialTasks = {
    todo: [],
    progress: [],
    done: []
};

/**
 * Inicializar aplicación
 */
function initApp() {
    createNotificationStyles();
    loadThemePreference();
    initializePrioritySelector();
    initializeModal();
    loadState();
    initDragEvents(); // Inicializar eventos de drag una vez
    updateCounters();
    updateProgressRing();
    logActivity('Aplicación iniciada', 'info');
    
    console.log('🚀 TaskFlow Pro inicializado correctamente');
}

/**
 * Inicializar selector de prioridad
 */
function initializePrioritySelector() {
    priorityOptions.forEach(option => {
        option.addEventListener('click', () => {
            priorityOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            currentPriority = option.dataset.priority;
        });
    });
}

/**
 * Inicializar modal
 */
function initializeModal() {
    // Mostrar modal para nueva tarea
    addBtn.addEventListener('click', () => showTaskModal());
    quickAddBtn.addEventListener('click', () => addQuickTask());
    
    // Botones de agregar tarea en cada columna
    document.querySelectorAll('.add-task-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const column = e.target.closest('.add-task-btn').dataset.column;
            showTaskModal(column);
        });
    });
    
    // Acciones de columna
    document.querySelectorAll('.column-action-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = e.target.closest('.column-action-btn').dataset.action;
            const column = e.target.closest('.column').querySelector('.dropzone').id;
            
            if (action === 'sort') {
                sortColumnByPriority(column);
            } else if (action === 'clear') {
                clearCompletedTasks();
            }
        });
    });
    
    // Cerrar modal
    modalClose.addEventListener('click', () => hideTaskModal());
    modalCancel.addEventListener('click', () => hideTaskModal());
    
    // Confirmar creación de tarea
    modalConfirm.addEventListener('click', () => createTaskFromModal());
    
    // Cerrar modal con Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && taskModal.classList.contains('active')) {
            hideTaskModal();
        }
    });
    
    // Cerrar modal haciendo clic fuera
    taskModal.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            hideTaskModal();
        }
    });
    
    // Buscador de tareas
    searchInput.addEventListener('input', debounce(searchTasks, 300));
}

/**
 * Mostrar modal de tarea
 */
function showTaskModal(targetColumn = 'todo') {
    taskModal.classList.add('active');
    taskTitle.focus();
    taskModal.dataset.targetColumn = targetColumn;
    
    // Establecer fecha mínima como hoy
    const today = new Date().toISOString().split('T')[0];
    taskDueDate.min = today;
    
    // Restablecer campos
    taskTitle.value = '';
    taskDescription.value = '';
    taskDueDate.value = '';
    
    // Restablecer prioridad a media
    priorityOptions.forEach(opt => opt.classList.remove('active'));
    document.querySelector(`[data-priority="medium"]`).classList.add('active');
    currentPriority = 'medium';
}

/**
 * Ocultar modal de tarea
 */
function hideTaskModal() {
    taskModal.classList.remove('active');
}

/**
 * Crear tarea desde modal
 */
function createTaskFromModal() {
    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();
    const dueDate = taskDueDate.value;
    const targetColumn = taskModal.dataset.targetColumn || 'todo';
    
    if (!title) {
        showNotification('Por favor, ingresa un título para la tarea', 'warning');
        taskTitle.focus();
        return;
    }
    
    const today = new Date();
    let dateText = 'Hoy';
    
    if (dueDate) {
        const due = new Date(dueDate);
        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) dateText = 'Hoy';
        else if (diffDays === 1) dateText = 'Mañana';
        else if (diffDays === -1) dateText = 'Ayer';
        else if (diffDays < 0) dateText = `Hace ${Math.abs(diffDays)} días`;
        else if (diffDays < 7) dateText = `En ${diffDays} días`;
        else dateText = due.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    }
    
    const newItem = createItem(
        nextId++,
        title,
        description,
        `priority-badge ${currentPriority}`,
        dateText,
        targetColumn,
        dueDate
    );
    
    const targetDropzone = document.getElementById(targetColumn);
    targetDropzone.prepend(newItem);
    
    // Inicializar eventos del nuevo item
    initItemEvents(newItem);
    initDragEventsForItem(newItem); // ¡ESTA ES LA LÍNEA CLAVE!
    
    // Animación de entrada
    newItem.style.opacity = '0';
    newItem.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        newItem.style.opacity = '1';
        newItem.style.transform = 'translateY(0)';
    }, 10);
    
    updateCounters();
    saveState();
    hideTaskModal();
    showNotification('Tarea creada exitosamente', 'success');
    logActivity(`Nueva tarea creada: "${title}"`, 'add');
}

/**
 * Agregar tarea rápida
 */
function addQuickTask() {
    const quickTasks = [
        'Revisar correo electrónico',
        'Planificar reunión semanal',
        'Actualizar documentación',
        'Revisar código pendiente',
        'Preparar presentación'
    ];
    
    const randomTask = quickTasks[Math.floor(Math.random() * quickTasks.length)];
    const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
    const today = new Date().toLocaleDateString('es-ES', { weekday: 'short' });
    
    const newItem = createItem(
        nextId++,
        randomTask,
        '',
        `priority-badge ${randomPriority.class}`,
        today,
        'todo'
    );
    
    const todoZone = document.getElementById('todo');
    todoZone.prepend(newItem);
    
    initItemEvents(newItem);
    initDragEventsForItem(newItem); // ¡ESTA ES LA LÍNEA CLAVE!
    
    // Animación
    newItem.style.opacity = '0';
    newItem.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        newItem.style.opacity = '1';
        newItem.style.transform = 'translateY(0)';
    }, 10);
    
    updateCounters();
    saveState();
    showNotification('Tarea rápida agregada', 'info');
    logActivity(`Tarea rápida agregada: "${randomTask}"`, 'add');
}

/**
 * Buscar tareas
 */
function searchTasks() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const allItems = document.querySelectorAll('.item');
    
    if (!searchTerm) {
        allItems.forEach(item => {
            item.style.display = 'flex';
        });
        return;
    }
    
    allItems.forEach(item => {
        const text = item.querySelector('.item-text').textContent.toLowerCase();
        const description = item.querySelector('.item-description')?.textContent.toLowerCase() || '';
        
        if (text.includes(searchTerm) || description.includes(searchTerm)) {
            item.style.display = 'flex';
            item.style.animation = 'slideIn 0.3s ease';
        } else {
            item.style.display = 'none';
        }
    });
}

/**
 * Ordenar columna por prioridad
 */
function sortColumnByPriority(columnId) {
    const column = document.getElementById(columnId);
    const items = Array.from(column.querySelectorAll('.item'));
    
    if (items.length <= 1) return;
    
    const priorityOrder = { high: 0, medium: 1, low: 2, completed: 3 };
    
    items.sort((a, b) => {
        const aPriority = a.querySelector('.priority-badge').className.split(' ')[1];
        const bPriority = b.querySelector('.priority-badge').className.split(' ')[1];
        return priorityOrder[aPriority] - priorityOrder[bPriority];
    });
    
    // Reorganizar items
    items.forEach(item => column.appendChild(item));
    
    showNotification(`Columna "${columnId}" ordenada por prioridad`, 'info');
    saveState();
    logActivity(`Columna ordenada por prioridad`, 'sort');
}

/**
 * Limpiar tareas completadas
 */
function clearCompletedTasks() {
    const doneZone = document.getElementById('done');
    const completedItems = doneZone.querySelectorAll('.item');
    
    if (completedItems.length === 0) {
        showNotification('No hay tareas completadas para limpiar', 'info');
        return;
    }
    
    if (confirm(`¿Eliminar ${completedItems.length} tareas completadas?`)) {
        completedItems.forEach(item => {
            item.classList.add('removing');
            setTimeout(() => item.remove(), 300);
        });
        
        setTimeout(() => {
            updateCounters();
            saveState();
            showNotification('Tareas completadas eliminadas', 'success');
            logActivity(`Se eliminaron ${completedItems.length} tareas completadas`, 'delete');
        }, 350);
    }
}

/**
 * Inicializar eventos de drag para TODOS los items
 */
function initDragEvents() {
    // Inicializar eventos para los dropzones (columnas)
    dropzones.forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('drop', handleDrop);
        zone.addEventListener('dragenter', handleDragEnter);
        zone.addEventListener('dragleave', handleDragLeave);
    });
    
    // Inicializar eventos para todos los items existentes
    const allItems = document.querySelectorAll('.item');
    allItems.forEach(item => {
        initDragEventsForItem(item);
    });
}

/**
 * Inicializar eventos de drag para UN SOLO item
 */
function initDragEventsForItem(item) {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragend', handleDragEnd);
}

/**
 * Inicializar eventos específicos del item
 */
function initItemEvents(item) {
    // Botón de eliminar
    const deleteBtn = item.querySelector('.delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            deleteItem(item);
        });
    }
    
    // Editar título
    const itemText = item.querySelector('.item-text');
    if (itemText) {
        itemText.addEventListener('dblclick', function() {
            enableEditMode(this);
        });
        
        itemText.addEventListener('blur', function() {
            disableEditMode(this);
            saveState();
            logActivity(`Tarea actualizada: "${this.textContent}"`, 'edit');
        });
        
        itemText.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.blur();
            }
        });
    }
    
    // Editar descripción
    const itemDescription = item.querySelector('.item-description');
    if (itemDescription) {
        itemDescription.addEventListener('dblclick', function() {
            enableEditMode(this);
        });
        
        itemDescription.addEventListener('blur', function() {
            disableEditMode(this);
            saveState();
        });
    }
}

// Drag & Drop Handlers
function handleDragStart(e) {
    draggedItem = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    
    setTimeout(() => {
        this.style.opacity = '0.4';
    }, 0);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    this.style.opacity = '1';
    
    dropzones.forEach(zone => {
        zone.classList.remove('drag-over');
    });
    
    updateCounters();
    saveState();
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    if (e.target.classList.contains('dropzone')) {
        e.target.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    if (e.target.classList.contains('dropzone')) {
        e.target.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const dropzone = e.target.closest('.dropzone');
    
    if (dropzone && draggedItem) {
        const oldZone = draggedItem.closest('.dropzone').id;
        const newZone = dropzone.id;
        
        dropzone.appendChild(draggedItem);
        dropzone.classList.remove('drag-over');
        
        updateItemStatus(draggedItem, newZone);
        
        // Log de actividad
        const taskTitle = draggedItem.querySelector('.item-text').textContent;
        logActivity(`Tarea movida: "${taskTitle}" de ${oldZone} a ${newZone}`, 'move');
        
        showNotification('Tarea movida correctamente', 'success');
    }
    
    return false;
}

/**
 * Actualizar estado del item basado en la columna
 */
function updateItemStatus(item, zoneId) {
    const priorityBadge = item.querySelector('.priority-badge');
    
    if (priorityBadge) {
        if (zoneId === 'done') {
            priorityBadge.textContent = 'Hecho';
            priorityBadge.className = 'priority-badge completed';
            item.style.borderLeftColor = '#06d6a0';
        } else if (zoneId === 'progress') {
            priorityBadge.textContent = 'En curso';
            priorityBadge.className = 'priority-badge medium';
            item.style.borderLeftColor = '#ffd166';
        } else {
            const currentClass = priorityBadge.className.split(' ')[1];
            const priority = priorities.find(p => p.class === currentClass) || priorities[1];
            priorityBadge.textContent = priority.name;
            priorityBadge.className = `priority-badge ${priority.class}`;
            item.style.borderLeftColor = priority.color;
        }
    }
}

/**
 * Crear nuevo item de tarea
 */
function createItem(id, title, description, priorityClass, dateText, zoneId = 'todo', dueDate = null) {
    const item = document.createElement('div');
    item.className = 'item';
    item.draggable = true;
    item.dataset.id = id;
    
    if (dueDate) {
        item.dataset.dueDate = dueDate;
    }
    
    // Determinar prioridad
    let priorityText = 'Media';
    if (priorityClass.includes('high')) priorityText = 'Alta';
    if (priorityClass.includes('low')) priorityText = 'Baja';
    if (priorityClass.includes('completed')) priorityText = 'Hecho';
    
    item.innerHTML = `
        <div class="item-header">
            <span class="drag-handle" title="Arrastrar"><i class="fas fa-grip-vertical"></i></span>
            <span class="${priorityClass}">${priorityText}</span>
        </div>
        <span class="item-text" contenteditable="false">${title}</span>
        ${description ? `<span class="item-description" contenteditable="false">${description}</span>` : ''}
        <div class="item-footer">
            <span class="item-date">
                <i class="far fa-calendar"></i> ${dateText}
            </span>
            <div class="item-actions">
                <button class="delete-btn item-action-btn" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    
    // Establecer color del borde izquierdo
    const priorityClassOnly = priorityClass.split(' ')[1];
    const priority = priorities.find(p => p.class === priorityClassOnly);
    if (priority) {
        item.style.borderLeftColor = priority.color;
    } else if (zoneId === 'done') {
        item.style.borderLeftColor = '#06d6a0';
    }
    
    return item;
}

/**
 * Actualizar contadores y estadísticas
 */
function updateCounters() {
    const todoItems = document.querySelectorAll('#todo .item').length;
    const progressItems = document.querySelectorAll('#progress .item').length;
    const doneItems = document.querySelectorAll('#done .item').length;
    const totalItems = todoItems + progressItems + doneItems;
    
    // Actualizar estadísticas
    todoCount.textContent = todoItems;
    progressCount.textContent = progressItems;
    doneCount.textContent = doneItems;
    totalCount.textContent = totalItems;
    
    // Actualizar badges de columnas
    todoBadge.textContent = todoItems;
    progressBadge.textContent = progressItems;
    doneBadge.textContent = doneItems;
    
    // Actualizar anillo de progreso
    updateProgressRing();
    
    // Actualizar mensaje de columnas vacías
    updateEmptyState();
}

/**
 * Actualizar anillo de progreso
 */
function updateProgressRing() {
    const totalItems = parseInt(totalCount.textContent) || 1;
    const doneItems = parseInt(doneCount.textContent) || 0;
    const percentage = totalItems === 0 ? 0 : Math.round((doneItems / totalItems) * 100);
    
    progressPercent.textContent = `${percentage}%`;
    
    // Actualizar círculo SVG
    const circle = document.querySelector('.progress-fill');
    if (circle) {
        const circumference = 2 * Math.PI * 54;
        const offset = circumference - (percentage / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }
}

/**
 * Actualizar mensaje de columnas vacías
 */
function updateEmptyState() {
    dropzones.forEach(zone => {
        const items = zone.querySelectorAll('.item').length;
        
        if (items === 0) {
            if (!zone.querySelector('.empty-message')) {
                const emptyMsg = document.createElement('div');
                emptyMsg.className = 'empty-message';
                emptyMsg.innerHTML = '<i class="fas fa-inbox"></i> No hay tareas aquí';
                zone.appendChild(emptyMsg);
            }
        } else {
            const emptyMsg = zone.querySelector('.empty-message');
            if (emptyMsg) {
                emptyMsg.remove();
            }
        }
    });
}

/**
 * Registrar actividad
 */
function logActivity(message, type = 'info') {
    const now = new Date();
    const time = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    activityLog.unshift({
        message,
        time,
        type,
        timestamp: now.getTime()
    });
    
    // Mantener solo las últimas 10 actividades
    if (activityLog.length > 10) {
        activityLog.pop();
    }
    
    updateActivityFeed();
}

/**
 * Actualizar feed de actividad
 */
function updateActivityFeed() {
    if (!activityFeed) return;
    
    activityFeed.innerHTML = '';
    
    if (activityLog.length === 0) {
        const emptyActivity = document.createElement('div');
        emptyActivity.className = 'activity-item';
        emptyActivity.innerHTML = `
            <div class="activity-icon">
                <i class="fas fa-info-circle"></i>
            </div>
            <div class="activity-content">
                <div class="activity-text">No hay actividad reciente</div>
                <div class="activity-time">Comienza a usar la aplicación</div>
            </div>
        `;
        activityFeed.appendChild(emptyActivity);
        return;
    }
    
    activityLog.forEach(activity => {
        let icon = 'fas fa-info-circle';
        if (activity.type === 'add') icon = 'fas fa-plus-circle text-success';
        if (activity.type === 'edit') icon = 'fas fa-edit text-warning';
        if (activity.type === 'delete') icon = 'fas fa-trash text-danger';
        if (activity.type === 'move') icon = 'fas fa-arrows-alt text-primary';
        if (activity.type === 'sort') icon = 'fas fa-sort-amount-down text-info';
        
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="${icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-text">${activity.message}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `;
        
        activityFeed.appendChild(activityItem);
    });
}

/**
 * Toggle modo nocturno
 */
themeToggle.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Actualizar texto e ícono del botón
    const icon = themeToggle.querySelector('i');
    const text = themeToggle.querySelector('.theme-text');
    
    if (newTheme === 'dark') {
        icon.className = 'fas fa-sun';
        text.textContent = 'Modo Claro';
    } else {
        icon.className = 'fas fa-moon';
        text.textContent = 'Modo Oscuro';
    }
    
    showNotification(`Modo ${newTheme === 'dark' ? 'nocturno' : 'claro'} activado`, 'info');
});

/**
 * Cargar preferencia de tema
 */
function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    
    const icon = themeToggle.querySelector('i');
    const text = themeToggle.querySelector('.theme-text');
    
    if (savedTheme === 'dark') {
        icon.className = 'fas fa-sun';
        text.textContent = 'Modo Claro';
    } else {
        icon.className = 'fas fa-moon';
        text.textContent = 'Modo Oscuro';
    }
}

/**
 * Exportar datos
 */
exportBtn.addEventListener('click', () => {
    const state = getCurrentState();
    if (Object.keys(state.items).every(zone => state.items[zone].length === 0)) {
        showNotification('No hay tareas para exportar', 'warning');
        return;
    }
    
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `taskflow-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Datos exportados exitosamente', 'success');
});

/**
 * Obtener estado actual
 */
function getCurrentState() {
    const state = {
        items: {},
        nextId: nextId,
        activityLog: activityLog,
        timestamp: new Date().toISOString()
    };
    
    dropzones.forEach(zone => {
        const zoneId = zone.id;
        const itemsInZone = Array.from(zone.querySelectorAll('.item')).map(item => ({
            id: parseInt(item.dataset.id),
            title: item.querySelector('.item-text').textContent,
            description: item.querySelector('.item-description')?.textContent || '',
            priority: item.querySelector('.priority-badge').className,
            date: item.querySelector('.item-date').textContent.replace('<i class="far fa-calendar"></i> ', ''),
            zone: zoneId,
            dueDate: item.dataset.dueDate || null
        }));
        
        state.items[zoneId] = itemsInZone;
    });
    
    return state;
}

/**
 * Guardar estado en localStorage
 */
function saveState() {
    const state = getCurrentState();
    localStorage.setItem('taskflowState', JSON.stringify(state));
    
    // Solo mostrar notificación si no es un guardado automático
    if (!saveState.debouncing) {
        saveState.debouncing = true;
        setTimeout(() => {
            saveState.debouncing = false;
        }, 2000);
    }
}

/**
 * Cargar estado desde localStorage
 */
function loadState() {
    const savedState = localStorage.getItem('taskflowState');
    
    if (savedState) {
        try {
            const state = JSON.parse(savedState);
            nextId = state.nextId || 1;
            activityLog = state.activityLog || [];
            
            // Limpiar zonas
            dropzones.forEach(zone => {
                zone.innerHTML = '';
            });
            
            // Restaurar items
            Object.keys(state.items || {}).forEach(zoneId => {
                const zone = document.getElementById(zoneId);
                if (zone) {
                    state.items[zoneId].forEach(itemData => {
                        const item = createItem(
                            parseInt(itemData.id),
                            itemData.title,
                            itemData.description,
                            itemData.priority,
                            itemData.date,
                            zoneId,
                            itemData.dueDate
                        );
                        zone.appendChild(item);
                        initItemEvents(item);
                        initDragEventsForItem(item);
                    });
                }
            });
            
            console.log('Estado cargado desde localStorage');
            
            // Si no hay items, cargar datos vacíos
            const hasItems = Object.values(state.items || {}).some(items => items.length > 0);
            if (!hasItems) {
                console.log('No hay datos guardados, comenzando con columnas vacías');
            }
            
            showNotification('Estado cargado correctamente', 'success');
        } catch (error) {
            console.error('Error al cargar estado:', error);
            showNotification('Error al cargar datos guardados', 'error');
            // Comenzar con columnas vacías
            nextId = 1;
            activityLog = [];
        }
    } else {
        console.log('No hay datos guardados, comenzando con columnas vacías');
        // Comenzar con columnas vacías
        nextId = 1;
        activityLog = [];
    }
    
    updateCounters();
    updateActivityFeed();
}

/**
 * Resetear a estado inicial (vaciar todo)
 */
function resetOrder() {
    if (confirm('¿Estás seguro de que quieres restablecer todo? Se eliminarán todas las tareas y se perderán todos los cambios.')) {
        // Limpiar todas las columnas
        dropzones.forEach(zone => {
            zone.innerHTML = '';
        });
        
        // Restablecer contadores
        nextId = 1;
        activityLog = [];
        
        // Eliminar el estado guardado
        localStorage.removeItem('taskflowState');
        
        // Actualizar contadores y UI
        updateCounters();
        updateActivityFeed();
        updateEmptyState();
        
        showNotification('Todas las tareas han sido restablecidas', 'success');
        logActivity('Aplicación restablecida a estado inicial', 'info');
    }
}

// Resto de funciones auxiliares
function enableEditMode(element) {
    element.setAttribute('contenteditable', 'true');
    element.focus();
    
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

function disableEditMode(element) {
    element.setAttribute('contenteditable', 'false');
    
    if (!element.textContent.trim()) {
        if (element.classList.contains('item-text')) {
            element.textContent = 'Nueva tarea';
        } else if (element.classList.contains('item-description')) {
            element.textContent = 'Sin descripción';
        }
    }
}

function deleteItem(item) {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
        const taskTitle = item.querySelector('.item-text').textContent;
        item.classList.add('removing');
        
        setTimeout(() => {
            item.remove();
            updateCounters();
            saveState();
            showNotification('Tarea eliminada correctamente', 'success');
            logActivity(`Tarea eliminada: "${taskTitle}"`, 'delete');
        }, 300);
    }
}

function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    });
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }
    }, 4000);
}

function createNotificationStyles() {
    if (document.querySelector('#notification-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        .notification-success { border-left: 4px solid #06d6a0; }
        .notification-info { border-left: 4px solid #118ab2; }
        .notification-warning { border-left: 4px solid #ffd166; }
        .notification-error { border-left: 4px solid #ef476f; }
    `;
    document.head.appendChild(style);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Event Listeners
resetBtn.addEventListener('click', resetOrder);
saveBtn.addEventListener('click', () => {
    saveState();
    showNotification('Cambios guardados manualmente', 'success');
});

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Guardar estado antes de cerrar
window.addEventListener('beforeunload', () => {
    saveState();
});
