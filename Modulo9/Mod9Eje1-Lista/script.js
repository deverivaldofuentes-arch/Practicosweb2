// Elementos del DOM
const itemInput = document.getElementById('itemInput');
const addBtn = document.getElementById('addBtn');
const itemList = document.getElementById('itemList');
const itemCount = document.getElementById('itemCount');
const clearAllBtn = document.getElementById('clearAllBtn');

// Contador de items
let count = 0;

/**
 * Actualizar contador
 */
function updateCount() {
    count = itemList.children.length;
    itemCount.textContent = count;
}

/**
 * Crear un nuevo item de lista
 */
function createListItem(text) {
    // Crear elemento <li>
    const li = document.createElement('li');
    li.className = 'list-item';
    
    // Crear estructura HTML del item
    li.innerHTML = `
        <span class="item-text">${text}</span>
        <input type="text" class="edit-input" value="${text}">
        <div class="item-buttons">
            <button class="btn-icon btn-edit" title="Editar">✏️</button>
            <button class="btn-icon btn-save" title="Guardar">✓</button>
            <button class="btn-icon btn-delete" title="Eliminar">🗑️</button>
        </div>
    `;
    
    return li;
}

/**
 * Añadir nuevo item
 */
function addItem() {
    const text = itemInput.value.trim();
    
    // Validar que no esté vacío
    if (text === '') {
        alert('Por favor escribe algo antes de añadir');
        itemInput.focus();
        return;
    }
    
    // Crear y añadir el item
    const listItem = createListItem(text);
    itemList.appendChild(listItem);
    
    // Limpiar input y enfocar
    itemInput.value = '';
    itemInput.focus();
    
    // Actualizar contador
    updateCount();
}

/**
 * Eliminar item
 */
function deleteItem(listItem) {
    // Confirmar eliminación
    if (confirm('¿Estás seguro de eliminar este item?')) {
        listItem.remove();
        updateCount();
    }
}

/**
 * Activar modo edición
 */
function enableEditMode(listItem) {
    listItem.classList.add('editing');
    const editInput = listItem.querySelector('.edit-input');
    editInput.focus();
    editInput.select();
}

/**
 * Guardar edición
 */
function saveEdit(listItem) {
    const editInput = listItem.querySelector('.edit-input');
    const itemText = listItem.querySelector('.item-text');
    const newText = editInput.value.trim();
    
    if (newText === '') {
        alert('El texto no puede estar vacío');
        return;
    }
    
    // Actualizar texto
    itemText.textContent = newText;
    
    // Desactivar modo edición
    listItem.classList.remove('editing');
}

/**
 * Limpiar toda la lista
 */
function clearAll() {
    if (count === 0) {
        alert('La lista ya está vacía');
        return;
    }
    
    if (confirm(`¿Estás seguro de eliminar todos los ${count} items?`)) {
        itemList.innerHTML = '';
        updateCount();
    }
}

// Event Listeners

// Añadir item con botón
addBtn.addEventListener('click', addItem);

// Añadir item con Enter
itemInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addItem();
    }
});

// Event delegation para botones de items
itemList.addEventListener('click', (e) => {
    const listItem = e.target.closest('.list-item');
    
    if (!listItem) return;
    
    // Botón eliminar
    if (e.target.classList.contains('btn-delete')) {
        deleteItem(listItem);
    }
    
    // Botón editar
    if (e.target.classList.contains('btn-edit')) {
        enableEditMode(listItem);
    }
    
    // Botón guardar
    if (e.target.classList.contains('btn-save')) {
        saveEdit(listItem);
    }
});

// Guardar edición con Enter
itemList.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.classList.contains('edit-input')) {
        const listItem = e.target.closest('.list-item');
        saveEdit(listItem);
    }
});

// Cancelar edición con Escape
itemList.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && e.target.classList.contains('edit-input')) {
        const listItem = e.target.closest('.list-item');
        listItem.classList.remove('editing');
    }
});

// Limpiar todo
clearAllBtn.addEventListener('click', clearAll);

// Inicializar contador
updateCount();

// Añadir algunos items de ejemplo (opcional, puedes eliminar esto)
// addExampleItems();
function addExampleItems() {
    const examples = ['Aprender DOM', 'Practicar JavaScript', 'Crear proyectos'];
    examples.forEach(text => {
        const listItem = createListItem(text);
        itemList.appendChild(listItem);
    });
    updateCount();
}
