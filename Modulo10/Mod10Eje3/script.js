/**
 * 1. BASE DE DATOS FICTICIA
 * En una app real, estos datos vendrían de un 'fetch' a una API.
 */
const products = [
    { id: 1, name: "MacBook Air M2", category: "electronics", price: 999, rating: 5 },
    { id: 2, name: "Sudadera Oversize", category: "clothing", price: 45, rating: 4 },
    { id: 3, name: "Cafetera Espresso", category: "home", price: 120, rating: 4 },
    { id: 4, name: "Teclado Mecánico", category: "electronics", price: 85, rating: 5 },
    { id: 5, name: "Pantalón Denim", category: "clothing", price: 60, rating: 3 },
    { id: 6, name: "Lámpara de Pie", category: "home", price: 35, rating: 2 },
    { id: 7, name: "iPhone 15", category: "electronics", price: 800, rating: 5 },
    { id: 8, name: "Zapatillas Running", category: "clothing", price: 110, rating: 4 },
    { id: 9, name: "Set de Cuchillos", category: "home", price: 75, rating: 3 },
    { id: 10, name: "Monitor 4K", category: "electronics", price: 400, rating: 4 }
];

// Configuración de visualización
const ITEMS_PER_PAGE = 3;

// Referencias al DOM para evitar buscarlos múltiples veces (mejora rendimiento)
const form = document.getElementById('filterForm');
const resultsGrid = document.getElementById('resultsGrid');
const resultsCount = document.getElementById('resultsCount');
const pageInfo = document.getElementById('pageInfo');
const priceLabel = document.getElementById('priceLabel');

/**
 * 2. FUNCIÓN DEBOUNCE
 * Evita que se ejecute la búsqueda con cada letra escrita. 
 * Espera a que el usuario deje de teclear por 400ms.
 */
function debounce(func, delay = 400) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

/**
 * 3. ACTUALIZAR URL Y ESTADO
 * Esta función lee el formulario y "escribe" los filtros en la barra de direcciones.
 */
function syncFiltersToURL() {
    const formData = new FormData(form);
    const params = new URLSearchParams();

    // Recorremos el formulario y agregamos valores a la URL si no están vacíos
    formData.forEach((value, key) => {
        if (value && value !== "0") {
            params.set(key, value);
        }
    });

    // Al cambiar cualquier filtro, reseteamos siempre a la página 1
    params.set('page', '1');

    // Actualizamos la URL sin recargar la página
    const newRelativePathQuery = window.location.pathname + '?' + params.toString();
    window.history.pushState(null, '', newRelativePathQuery);

    render();
}

/**
 * 4. FUNCIÓN PRINCIPAL DE RENDERIZADO
 * Es el motor de la aplicación. Filtra, pagina y dibuja.
 */
function render() {
    // A) Leer filtros actuales desde la URL (Fuente de verdad)
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q')?.toLowerCase() || "";
    const category = params.get('category') || "";
    const maxPrice = parseInt(params.get('maxPrice')) || 1000;
    const rating = parseInt(params.get('rating')) || 0;
    let page = parseInt(params.get('page')) || 1;

    // B) Filtrar el Array de productos
    const filtered = products.filter(item => {
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesCategory = category === "" || item.category === category;
        const matchesPrice = item.price <= maxPrice;
        const matchesRating = item.rating >= rating;
        return matchesName && matchesCategory && matchesPrice && matchesRating;
    });

    // C) Lógica de Paginación
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
    if (page > totalPages) page = totalPages; // Corrección por si la página queda huérfana
    
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const itemsToShow = filtered.slice(start, end);

    // D) Inyectar HTML de las tarjetas
    resultsGrid.innerHTML = itemsToShow.length > 0 
        ? itemsToShow.map(p => `
            <article class="card">
                <h4>${p.name}</h4>
                <p><strong>Precio:</strong> $${p.price}</p>
                <p><small>Categoría: ${p.category}</small></p>
                <p>⭐ ${p.rating} / 5</p>
            </article>
        `).join('')
        : `<p>No se encontraron productos con esos filtros.</p>`;

    // E) Actualizar textos de la interfaz
    resultsCount.innerText = `${filtered.length} productos encontrados`;
    pageInfo.innerText = `Página ${page} de ${totalPages}`;
    
    // F) Controlar estado de botones de paginación
    document.getElementById('prevBtn').disabled = (page <= 1);
    document.getElementById('nextBtn').disabled = (page >= totalPages);

    // Actualizar el label del precio manualmente para feedback visual
    priceLabel.innerText = `$${maxPrice}`;
}

/**
 * 5. GESTIÓN DE EVENTOS
 */

// Evento para el campo de texto con Debounce
const handleSearchInput = debounce(() => syncFiltersToURL());
document.getElementById('search').addEventListener('input', handleSearchInput);

// Evento para cambios en Selects, Ranges y Radios (Cambio inmediato)
form.addEventListener('change', (e) => {
    // Si el cambio no fue en el buscador (porque ya tiene debounce)
    if (e.target.id !== 'search') {
        syncFiltersToURL();
    }
});

// Eventos de Paginación
function changePage(offset) {
    const params = new URLSearchParams(window.location.search);
    let currentPage = parseInt(params.get('page')) || 1;
    params.set('page', currentPage + offset);
    
    window.history.pushState(null, '', `?${params.toString()}`);
    render();
}

document.getElementById('prevBtn').addEventListener('click', () => changePage(-1));
document.getElementById('nextBtn').addEventListener('click', () => changePage(1));

// Botón Limpiar
document.getElementById('clearBtn').addEventListener('click', () => {
    form.reset(); // Resetea visualmente el form
    window.history.pushState(null, '', window.location.pathname); // Limpia la URL
    render();
});

/**
 * 6. INICIALIZACIÓN (Al cargar la página o usar botones Atrás/Adelante del navegador)
 */
window.addEventListener('popstate', render); // Maneja navegación histórica del navegador

window.addEventListener('DOMContentLoaded', () => {
    // Sincronizar el formulario visual con lo que haya en la URL al cargar
    const params = new URLSearchParams(window.location.search);
    params.forEach((value, key) => {
        const input = form.elements[key];
        if (input) {
            if (input.type === 'radio') {
                if (input.value === value) input.checked = true;
            } else {
                input.value = value;
            }
        }
    });
    render();
});