// Estado de la aplicación
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';
let isDarkMode = true;

// Elementos del DOM
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clearCompleted');
const themeToggle = document.getElementById('themeToggle');
const helpToggle = document.getElementById('helpToggle');
const helpModal = document.getElementById('helpModal');
const modalClose = document.querySelector('.modal-close');
const prioritySelect = document.getElementById('prioritySelect');
const categorySelect = document.getElementById('categorySelect');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importInput = document.getElementById('importInput');
const resetDataBtn = document.getElementById('resetData');
const charCount = document.getElementById('charCount');

// Inicialización
function init() {
    // Cargar preferencia de tema
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        toggleTheme();
    }
    
    // Crear partículas de fondo
    createParticles();
    
    // Configurar contador de caracteres
    setupCharCounter();
    
    setupEventListeners();
    renderTodos();
}

// Contador de caracteres
function setupCharCounter() {
    todoInput.addEventListener('input', () => {
        charCount.textContent = todoInput.value.length;
        if (todoInput.value.length > 180) {
            charCount.style.color = 'var(--warning)';
        } else if (todoInput.value.length > 190) {
            charCount.style.color = 'var(--error)';
        } else {
            charCount.style.color = 'var(--text-muted)';
        }
    });
}

// Crear partículas de fondo
function createParticles() {
    const particlesContainer = document.querySelector('.particles');
    if (!particlesContainer) return;
    
    // Limpiar partículas existentes
    particlesContainer.innerHTML = '';
    
    for (let i = 0; i < 30; i++) { // Reducido para mejor rendimiento
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 15) + 's'; // Más lento
        particle.style.opacity = Math.random() * 0.3 + 0.1; // Más transparente
        particle.style.width = Math.random() * 2 + 1 + 'px';
        particle.style.height = particle.style.width;
        particlesContainer.appendChild(particle);
    }
}

// Funciones principales mejoradas
function addTodo() {
    const text = todoInput.value.trim();
    if (text === '') {
        showNotification('Por favor, escribe una tarea', 'error');
        todoInput.classList.add('shake');
        setTimeout(() => todoInput.classList.remove('shake'), 500);
        return;
    }
    
    if (text.length > 200) {
        showNotification('La tarea es demasiado larga (máx. 200 caracteres)', 'error');
        return;
    }
    
    const todo = {
        id: Date.now() + Math.random(), // ID más único
        text: text,
        completed: false,
        createdAt: new Date().toISOString(),
        priority: prioritySelect.value,
        category: categorySelect.value
    };
    
    todos.unshift(todo);
    todoInput.value = '';
    charCount.textContent = '0';
    charCount.style.color = 'var(--text-muted)';
    saveTodos();
    renderTodos();
    
    showNotification('Tarea agregada correctamente', 'success');
    addBtn.classList.add('pulse');
    setTimeout(() => addBtn.classList.remove('pulse'), 300);
    
    todoInput.focus();
}

function deleteTodo(id) {
    const todoItem = document.querySelector(`[data-id="${id}"]`);
    if (todoItem) {
        todoItem.style.opacity = '0.5';
        todoItem.style.transform = 'translateX(-100px)';
        setTimeout(() => {
            todos = todos.filter(todo => todo.id !== id);
            saveTodos();
            renderTodos();
            showNotification('Tarea eliminada', 'warning');
        }, 300);
    }
}

function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        todo.completedAt = todo.completed ? new Date().toISOString() : null;
        
        // Efecto visual
        const todoItem = document.querySelector(`[data-id="${id}"]`);
        if (todoItem) {
            todoItem.classList.add('pulse');
            setTimeout(() => todoItem.classList.remove('pulse'), 300);
        }
        
        saveTodos();
        renderTodos();
        
        const message = todo.completed ? 'Tarea completada ✓' : 'Tarea reactivada';
        showNotification(message, 'success');
    }
}

function clearCompleted() {
    const completedTodos = todos.filter(t => t.completed);
    if (completedTodos.length === 0) {
        showNotification('No hay tareas completadas para limpiar', 'info');
        clearCompletedBtn.classList.add('shake');
        setTimeout(() => clearCompletedBtn.classList.remove('shake'), 500);
        return;
    }
    
    // Confirmación
    if (confirm(`¿Eliminar ${completedTodos.length} tarea(s) completada(s)?`)) {
        clearCompletedBtn.classList.add('pulse');
        setTimeout(() => {
            todos = todos.filter(todo => !todo.completed);
            saveTodos();
            renderTodos();
            clearCompletedBtn.classList.remove('pulse');
            showNotification(`Se eliminaron ${completedTodos.length} tarea(s)`, 'warning');
        }, 300);
    }
}

function editTodo(id, newText) {
    const todo = todos.find(t => t.id === id);
    if (todo && newText.trim() !== '') {
        if (newText.trim().length > 200) {
            showNotification('La tarea es demasiado larga (máx. 200 caracteres)', 'error');
            return;
        }
        
        const oldText = todo.text;
        todo.text = newText.trim();
        saveTodos();
        renderTodos();
        showNotification('Tarea actualizada', 'success');
    }
}

// Notificaciones mejoradas
function showNotification(message, type = 'info') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    notification.innerHTML = `
        <i class="${icons[type]}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(notification);
    
    // Auto-eliminar después de 4 segundos
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Renderizado mejorado
function renderTodos() {
    // Filtrar todos según el filtro actual
    let filteredTodos = todos;
    if (currentFilter === 'active') {
        filteredTodos = todos.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTodos = todos.filter(t => t.completed);
    } else if (currentFilter === 'today') {
        const today = new Date().toDateString();
        filteredTodos = todos.filter(t => {
            const todoDate = new Date(t.createdAt).toDateString();
            return todoDate === today;
        });
    }
    
    // Actualizar contador de filtro "hoy"
    const todayCount = todos.filter(t => {
        const todoDate = new Date(t.createdAt).toDateString();
        const today = new Date().toDateString();
        return todoDate === today;
    }).length;
    document.getElementById('todayFilterCount').textContent = todayCount;
    document.getElementById('todayCount').textContent = todayCount;
    
    // Limpiar lista
    todoList.innerHTML = '';
    
    // Mostrar estado vacío si no hay tareas
    if (filteredTodos.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        
        let message, icon, description;
        if (currentFilter === 'all' && todos.length === 0) {
            message = 'Sin tareas';
            icon = '📝';
            description = 'Comienza agregando tu primera tarea usando el campo de arriba';
        } else if (currentFilter === 'active') {
            message = '¡Todo completado!';
            icon = '🎉';
            description = 'No hay tareas pendientes - ¡Buen trabajo!';
        } else if (currentFilter === 'completed') {
            message = 'Sin completadas';
            icon = '📋';
            description = 'Completa algunas tareas para verlas aquí';
        } else if (currentFilter === 'today') {
            message = 'Sin tareas hoy';
            icon = '📅';
            description = 'No hay tareas creadas para hoy';
        } else {
            message = 'Sin resultados';
            icon = '🔍';
            description = 'Prueba con otro filtro';
        }
        
        emptyState.innerHTML = `
            <div class="empty-state-icon">${icon}</div>
            <h3>${message}</h3>
            <p>${description}</p>
        `;
        
        todoList.appendChild(emptyState);
    } else {
        // Renderizar cada todo
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.dataset.id = todo.id;
            li.draggable = true;
            
            // Formatear fecha
            const date = new Date(todo.createdAt);
            const dateStr = date.toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'short',
                year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
            }).replace(/ de /g, '/');
            
            // Prioridad
            const priorityLabels = {
                low: 'Baja',
                medium: 'Media',
                high: 'Alta'
            };
            
            // Categoría
            const categoryLabels = {
                personal: 'Personal',
                work: 'Trabajo',
                study: 'Estudio',
                health: 'Salud'
            };
            
            li.innerHTML = `
                <div class="todo-checkbox-wrapper">
                    <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                </div>
                <div class="todo-item-content">
                    <span class="todo-text">${escapeHtml(todo.text)}</span>
                    <div class="todo-meta">
                        <span class="priority-badge priority-${todo.priority}">
                            <i class="fas fa-flag"></i> ${priorityLabels[todo.priority]}
                        </span>
                        <span class="category-badge">
                            <i class="fas fa-tag"></i> ${categoryLabels[todo.category]}
                        </span>
                        <span class="todo-date">
                            <i class="far fa-calendar"></i> ${dateStr}
                        </span>
                    </div>
                </div>
                <button class="delete-btn">
                    <i class="fas fa-trash"></i>
                    <span class="btn-text">Eliminar</span>
                </button>
            `;
            
            // Event listeners
            const checkbox = li.querySelector('.todo-checkbox');
            checkbox.addEventListener('change', () => toggleTodo(todo.id));
            
            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteTodo(todo.id);
            });
            
            // Doble click para editar
            const todoText = li.querySelector('.todo-text');
            todoText.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                const currentText = todo.text;
                const input = document.createElement('input');
                input.type = 'text';
                input.value = currentText;
                input.className = 'edit-input';
                input.style.cssText = `
                    width: 100%;
                    padding: 0.8rem;
                    font-size: 1.1rem;
                    background: rgba(255, 255, 255, 0.1);
                    border: 2px solid var(--primary);
                    border-radius: var(--border-radius-sm);
                    color: var(--text-light);
                    outline: none;
                `;
                
                todoText.replaceWith(input);
                input.focus();
                input.select();
                
                const finishEdit = () => {
                    if (input.value.trim() !== '') {
                        editTodo(todo.id, input.value);
                    } else {
                        renderTodos();
                    }
                };
                
                input.addEventListener('blur', finishEdit);
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') finishEdit();
                });
            });
            
            todoList.appendChild(li);
        });
    }
    
    updateCounts();
    updateClearButton();
    updateStats();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateCounts() {
    const totalCount = todos.length;
    const activeCount = todos.filter(t => !t.completed).length;
    const completedCount = todos.filter(t => t.completed).length;
    const priorityCount = todos.filter(t => t.priority === 'high' && !t.completed).length;
    
    document.getElementById('allCount').textContent = totalCount;
    document.getElementById('activeCount').textContent = activeCount;
    document.getElementById('completedCount').textContent = completedCount;
    document.getElementById('priorityCount').textContent = priorityCount;
    
    const itemsLeftText = activeCount === 1 ? '1 tarea pendiente' : `${activeCount} tareas pendientes`;
    document.getElementById('itemsCount').textContent = activeCount;
    document.getElementById('itemsLeft').innerHTML = `<i class="fas fa-inbox"></i> <span id="itemsCount">${activeCount}</span> ${activeCount === 1 ? 'tarea pendiente' : 'tareas pendientes'}`;
}

function updateClearButton() {
    const completedCount = todos.filter(t => t.completed).length;
    clearCompletedBtn.disabled = completedCount === 0;
    clearCompletedBtn.title = completedCount === 0 
        ? 'No hay tareas completadas para limpiar' 
        : `Limpiar ${completedCount} tarea(s) completada(s)`;
}

function updateStats() {
    const statsContainer = document.getElementById('statsContainer');
    if (!statsContainer) return;
    
    const totalCount = todos.length;
    const completedCount = todos.filter(t => t.completed).length;
    const activeCount = todos.filter(t => !t.completed).length;
    const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    const todayCount = todos.filter(t => {
        const todoDate = new Date(t.createdAt).toDateString();
        const today = new Date().toDateString();
        return todoDate === today;
    }).length;
    
    statsContainer.innerHTML = `
        <h3><i class="fas fa-chart-line"></i> Estadísticas</h3>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${totalCount}</div>
                <div class="stat-label">Total Tareas</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${completionRate}%</div>
                <div class="stat-label">Tasa de Completado</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${activeCount}</div>
                <div class="stat-label">Pendientes</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${completedCount}</div>
                <div class="stat-label">Completadas</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${todayCount}</div>
                <div class="stat-label">Creadas Hoy</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${Math.round(todos.reduce((acc, t) => acc + t.text.length, 0) / 100)}</div>
                <div class="stat-label">Palabras Totales</div>
            </div>
        </div>
    `;
}

function saveTodos() {
    try {
        localStorage.setItem('todos', JSON.stringify(todos));
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            showNotification('¡Almacenamiento lleno! Algunos datos pueden perderse', 'error');
        }
    }
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('light-mode', !isDarkMode);
    const icon = themeToggle.querySelector('i');
    if (isDarkMode) {
        icon.className = 'fas fa-moon';
    } else {
        icon.className = 'fas fa-sun';
    }
    themeToggle.title = isDarkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    
    // Recrear partículas con colores del tema
    createParticles();
}

// Exportar/Importar
function exportTodos() {
    const dataStr = JSON.stringify(todos, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `todo_list_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showNotification('Tareas exportadas correctamente', 'success');
}

function importTodos(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/json') {
        showNotification('Por favor, selecciona un archivo JSON válido', 'error');
        return;
    }
    
    if (file.size > 1024 * 1024) { // 1MB max
        showNotification('El archivo es demasiado grande (máx. 1MB)', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedTodos = JSON.parse(e.target.result);
            
            // Validar estructura
            if (!Array.isArray(importedTodos)) {
                throw new Error('Formato inválido');
            }
            
            if (confirm(`¿Importar ${importedTodos.length} tarea(s)? Esto reemplazará tus tareas actuales.`)) {
                todos = importedTodos;
                saveTodos();
                renderTodos();
                showNotification(`${importedTodos.length} tareas importadas correctamente`, 'success');
            }
        } catch (error) {
            console.error('❌ Error al importar tareas:', error);
            showNotification('Error al importar: Archivo JSON inválido', 'error');
        }
    };
    reader.readAsText(file);
    
    // Reset input
    importInput.value = '';
}

function setupEventListeners() {
    // Agregar tarea
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });
    
    // Filtros
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTodos();
        });
    });
    
    // Limpiar completadas
    clearCompletedBtn.addEventListener('click', clearCompleted);
    
    // Tema
    themeToggle.addEventListener('click', toggleTheme);
    
    // Modal de ayuda
    helpToggle.addEventListener('click', () => {
        helpModal.classList.add('active');
    });
    
    modalClose.addEventListener('click', () => {
        helpModal.classList.remove('active');
    });
    
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            helpModal.classList.remove('active');
        }
    });
    
    // Exportar/Importar
    exportBtn.addEventListener('click', exportTodos);
    importBtn.addEventListener('click', () => {
        importInput.click();
    });
    importInput.addEventListener('change', importTodos);
    
    // Reset datos
    resetDataBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro de que quieres eliminar todas las tareas? Esto no se puede deshacer.')) {
            todos = [];
            saveTodos();
            renderTodos();
            showNotification('Todos los datos han sido eliminados', 'warning');
        }
    });
    
    // Atajos de teclado
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter para agregar tarea
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            addTodo();
        }
        
        // Ctrl/Cmd + D para borrar campo
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            todoInput.value = '';
            charCount.textContent = '0';
            charCount.style.color = 'var(--text-muted)';
            todoInput.focus();
        }
        
        // Ctrl/Cmd + L para limpiar completadas
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
            e.preventDefault();
            clearCompleted();
        }
        
        // Ctrl/Cmd + H para ayuda
        if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
            e.preventDefault();
            helpModal.classList.toggle('active');
        }
        
        // Escape para cerrar modal o limpiar filtros
        if (e.key === 'Escape') {
            if (helpModal.classList.contains('active')) {
                helpModal.classList.remove('active');
            } else {
                const activeFilter = document.querySelector('.filter-btn.active');
                if (activeFilter && activeFilter.dataset.filter !== 'all') {
                    document.querySelector('[data-filter="all"]').click();
                }
            }
        }
    });
    
    // Drag and drop para reordenar
    setupDragAndDrop();
}

function setupDragAndDrop() {
    let draggedItem = null;
    
    todoList.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('todo-item')) {
            draggedItem = e.target;
            setTimeout(() => {
                e.target.classList.add('dragging');
            }, 0);
        }
    });
    
    todoList.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(todoList, e.clientY);
        const draggable = document.querySelector('.todo-item.dragging');
        if (draggable) {
            if (afterElement == null) {
                todoList.appendChild(draggable);
            } else {
                todoList.insertBefore(draggable, afterElement);
            }
        }
    });
    
    todoList.addEventListener('dragend', (e) => {
        if (draggedItem) {
            draggedItem.classList.remove('dragging');
            draggedItem = null;
            
            // Actualizar orden en el array
            const newOrder = Array.from(todoList.children)
                .map(child => {
                    const id = child.dataset.id;
                    return id ? parseFloat(id) : null;
                })
                .filter(id => id !== null);
            
            if (newOrder.length === todos.length) {
                todos.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
                saveTodos();
                showNotification('Tareas reordenadas', 'info');
            }
        }
    });
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.todo-item:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', init);

// Funciones de utilidad globales
window.debugTodos = () => {
    console.log('📊 Estado actual:');
    console.log('Total tareas:', todos.length);
    console.log('Filtro actual:', currentFilter);
    console.log('Modo:', isDarkMode ? '🌙 Oscuro' : '☀️ Claro');
    console.log('Almacenamiento usado:', JSON.stringify(todos).length, 'bytes');
    console.log('Tareas:', todos);
};

window.showWelcomeMessage = () => {
    showNotification('¡Bienvenido a ToDo List Pro! Usa Ctrl+H para ver atajos', 'info');
};
