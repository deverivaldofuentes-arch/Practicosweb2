// Base de datos de productos
const products = [
    {
        id: 1,
        name: 'Laptop Pro',
        price: 12999,
        description: 'Laptop de alto rendimiento con pantalla 4K',
        emoji: '💻',
        stock: 5,
        icon: 'fas fa-laptop'
    },
    {
        id: 2,
        name: 'Smartphone X',
        price: 8999,
        description: 'Teléfono inteligente de última generación',
        emoji: '📱',
        stock: 10,
        icon: 'fas fa-mobile-alt'
    },
    {
        id: 3,
        name: 'Auriculares Pro',
        price: 2499,
        description: 'Auriculares inalámbricos con cancelación de ruido',
        emoji: '🎧',
        stock: 15,
        icon: 'fas fa-headphones'
    },
    {
        id: 4,
        name: 'Tablet Elite',
        price: 6999,
        description: 'Tablet de 10 pulgadas con lápiz digital',
        emoji: '📱',
        stock: 8,
        icon: 'fas fa-tablet-alt'
    },
    {
        id: 5,
        name: 'Smartwatch Pro',
        price: 4999,
        description: 'Reloj inteligente con GPS y monitoreo de salud',
        emoji: '⌚',
        stock: 12,
        icon: 'fas fa-clock'
    },
    {
        id: 6,
        name: 'Cámara Pro',
        price: 15999,
        description: 'Cámara profesional 4K con lentes intercambiables',
        emoji: '📷',
        stock: 3,
        icon: 'fas fa-camera'
    },
    {
        id: 7,
        name: 'Consola Gaming',
        price: 10999,
        description: 'Consola de última generación con 1TB de almacenamiento',
        emoji: '🎮',
        stock: 7,
        icon: 'fas fa-gamepad'
    },
    {
        id: 8,
        name: 'Altavoz Bluetooth',
        price: 1999,
        description: 'Altavoz portátil con sonido 360° y resistencia al agua',
        emoji: '🔊',
        stock: 20,
        icon: 'fas fa-volume-up'
    }
];

// Carrito de compras
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Elementos del DOM
const productsGrid = document.getElementById('productsGrid');
const cartItems = document.getElementById('cartItems');
const cartCount = document.getElementById('cartCount');
const cartSummary = document.getElementById('cartSummary');
const subtotal = document.getElementById('subtotal');
const tax = document.getElementById('tax');
const shipping = document.getElementById('shipping');
const total = document.getElementById('total');
const checkoutBtn = document.getElementById('checkoutBtn');
const clearCartBtn = document.getElementById('clearCartBtn');
const confirmModal = document.getElementById('confirmModal');
const orderTotal = document.getElementById('orderTotal');
const notification = document.getElementById('notification');
const notificationTitle = document.getElementById('notificationTitle');
const notificationText = document.getElementById('notificationText');

const SHIPPING_COST = 50;
const TAX_RATE = 0.16;

/**
 * Crear estrellas de fondo
 */
function createStars() {
    const starsContainer = document.getElementById('stars');
    for (let i = 0; i < 100; i++) {
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
function showNotification(title, message, type = 'success') {
    notificationTitle.textContent = title;
    notificationText.textContent = message;
    
    // Cambiar color según tipo
    const borderColor = type === 'error' ? 'var(--secondary)' : 
                       type === 'warning' ? 'var(--warning)' : 'var(--accent)';
    
    notification.style.borderLeftColor = borderColor;
    
    // Cambiar ícono
    const icon = notification.querySelector('i');
    icon.className = type === 'error' ? 'fas fa-exclamation-circle' :
                    type === 'warning' ? 'fas fa-exclamation-triangle' :
                    'fas fa-check-circle';
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

/**
 * Renderizar productos en el catálogo
 */
function renderProducts() {
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        // Determinar estado del stock
        let stockClass, stockText;
        if (product.stock === 0) {
            stockClass = 'out';
            stockText = 'Agotado';
        } else if (product.stock < 5) {
            stockClass = 'low';
            stockText = `¡Solo ${product.stock} disponibles!`;
        } else {
            stockClass = 'high';
            stockText = `${product.stock} disponibles`;
        }
        
        productCard.innerHTML = `
            <div class="product-image">
                <i class="${product.icon}" style="font-size: 4rem; color: var(--primary);"></i>
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <p class="product-price">$${product.price.toLocaleString('es-MX')}</p>
                <span class="product-stock ${stockClass}">${stockText}</span>
                <button class="btn-add-cart" onclick="addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
                    <i class="fas fa-cart-plus"></i>
                    ${product.stock === 0 ? 'Agotado' : 'Añadir al Carrito'}
                </button>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
}

/**
 * Añadir producto al carrito
 */
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    
    if (!product || product.stock === 0) {
        showNotification('No disponible', 'Este producto está agotado', 'error');
        return;
    }
    
    // Buscar si el producto ya está en el carrito
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        // Verificar stock
        if (existingItem.quantity >= product.stock) {
            showNotification('Stock limitado', `No hay más stock disponible de ${product.name}`, 'warning');
            return;
        }
        existingItem.quantity++;
        showNotification('Actualizado', `Cantidad de ${product.name} actualizada`, 'success');
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            emoji: product.emoji,
            icon: product.icon,
            quantity: 1
        });
        showNotification('¡Agregado!', `${product.name} añadido al carrito`, 'success');
    }
    
    saveCart();
    renderCart();
    updateCartCount();
    
    // Animación del contador del carrito
    cartCount.style.transform = 'scale(1.5)';
    setTimeout(() => {
        cartCount.style.transform = 'scale(1)';
    }, 300);
}

/**
 * Renderizar carrito
 */
function renderCart() {
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <h3>Tu carrito está vacío</h3>
                <p>¡Agrega algunos productos!</p>
            </div>
        `;
        cartSummary.style.display = 'none';
        checkoutBtn.disabled = true;
        return;
    }
    
    cartItems.innerHTML = '';
    cartSummary.style.display = 'block';
    checkoutBtn.disabled = false;
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        const product = products.find(p => p.id === item.id);
        const itemTotal = item.price * item.quantity;
        
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <i class="${item.icon}" style="font-size: 2rem; color: var(--primary);"></i>
            </div>
            <div class="cart-item-info">
                <div class="cart-item-header">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">$${itemTotal.toLocaleString('es-MX')}</div>
                </div>
                <div class="cart-item-details">
                    <span style="color: var(--text-muted); font-size: 0.9rem;">
                        Precio unitario: $${item.price.toLocaleString('es-MX')}
                    </span>
                </div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="decreaseQuantity(${item.id})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="qty-display">${item.quantity}</span>
                    <button class="qty-btn" onclick="increaseQuantity(${item.id})">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="btn-remove" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;
        
        cartItems.appendChild(cartItem);
    });
    
    updateTotals();
}

/**
 * Aumentar cantidad
 */
function increaseQuantity(productId) {
    const product = products.find(p => p.id === productId);
    const cartItem = cart.find(item => item.id === productId);
    
    if (cartItem.quantity >= product.stock) {
        showNotification('Stock limitado', `No hay más stock disponible de ${product.name}`, 'warning');
        return;
    }
    
    cartItem.quantity++;
    saveCart();
    renderCart();
    updateCartCount();
    showNotification('Actualizado', `Cantidad de ${product.name} aumentada`, 'success');
}

/**
 * Disminuir cantidad
 */
function decreaseQuantity(productId) {
    const cartItem = cart.find(item => item.id === productId);
    const product = products.find(p => p.id === productId);
    
    if (cartItem.quantity > 1) {
        cartItem.quantity--;
        showNotification('Actualizado', `Cantidad de ${product.name} disminuida`, 'success');
    } else {
        removeFromCart(productId);
        return;
    }
    
    saveCart();
    renderCart();
    updateCartCount();
}

/**
 * Eliminar producto del carrito
 */
function removeFromCart(productId) {
    const product = products.find(p => p.id === productId);
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
    updateCartCount();
    showNotification('Eliminado', `${product.name} eliminado del carrito`, 'warning');
}

/**
 * Actualizar totales
 */
function updateTotals() {
    const subtotalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = subtotalAmount * TAX_RATE;
    const shippingAmount = cart.length > 0 ? SHIPPING_COST : 0;
    const totalAmount = subtotalAmount + taxAmount + shippingAmount;
    
    subtotal.textContent = `$${subtotalAmount.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
    tax.textContent = `$${taxAmount.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
    shipping.textContent = `$${shippingAmount.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
    total.textContent = `$${totalAmount.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
}

/**
 * Actualizar contador del carrito
 */
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = count;
    
    // Actualizar título de la página
    document.title = count > 0 ? 
        `(${count}) Carrito de Compras Futurista` : 
        'Carrito de Compras Futurista';
}

/**
 * Guardar carrito en localStorage
 */
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

/**
 * Vaciar carrito
 */
function clearCart() {
    if (cart.length === 0) {
        showNotification('Carrito vacío', 'No hay productos en el carrito', 'warning');
        return;
    }
    
    if (confirm('¿Estás seguro de vaciar el carrito?\nEsta acción no se puede deshacer.')) {
        cart = [];
        saveCart();
        renderCart();
        updateCartCount();
        showNotification('Carrito vaciado', 'Todos los productos han sido eliminados', 'warning');
    }
}

/**
 * Realizar checkout
 */
function checkout() {
    if (cart.length === 0) {
        showNotification('Carrito vacío', 'Agrega productos antes de pagar', 'error');
        return;
    }
    
    const subtotalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = subtotalAmount * TAX_RATE;
    const finalTotal = subtotalAmount + taxAmount + SHIPPING_COST;
    
    // Mostrar modal de confirmación
    orderTotal.textContent = `$${finalTotal.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
    confirmModal.classList.add('active');
    
    // Generar resumen del pedido
    const orderSummary = cart.map(item => 
        `${item.quantity}x ${item.name} - $${(item.price * item.quantity).toLocaleString('es-MX')}`
    ).join('\n');
    
    console.log('📦 Pedido realizado:');
    console.log(orderSummary);
    console.log(`💰 Total: $${finalTotal.toLocaleString('es-MX')}`);
    
    // Actualizar stock de productos (simulación)
    cart.forEach(cartItem => {
        const product = products.find(p => p.id === cartItem.id);
        if (product) {
            product.stock -= cartItem.quantity;
        }
    });
    
    // Limpiar carrito después del pedido
    setTimeout(() => {
        cart = [];
        saveCart();
        renderCart();
        updateCartCount();
        renderProducts(); // Actualizar disponibilidad de productos
    }, 500);
}

/**
 * Cerrar modal
 */
function closeModal() {
    confirmModal.classList.remove('active');
}

/**
 * Inicializar eventos
 */
function initEventListeners() {
    // Checkout
    checkoutBtn.addEventListener('click', checkout);
    
    // Vaciar carrito
    clearCartBtn.addEventListener('click', clearCart);
    
    // Cerrar modal con overlay y tecla Escape
    confirmModal.querySelector('.modal-overlay').addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && confirmModal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Animación del icono del carrito
    const cartIcon = document.getElementById('cartIcon');
    cartIcon.addEventListener('click', () => {
        cartIcon.style.transform = 'scale(0.9)';
        setTimeout(() => {
            cartIcon.style.transform = 'scale(1)';
        }, 200);
    });
}

/**
 * Inicializar la aplicación
 */
function initApp() {
    createStars();
    initEventListeners();
    renderProducts();
    renderCart();
    updateCartCount();
    
    // Mostrar mensaje de bienvenida
    setTimeout(() => {
        showNotification('¡Bienvenido!', 'Explora nuestros productos futuristas', 'success');
    }, 1000);
    
    console.log('🛒 Carrito de compras futurista inicializado');
    console.log(`📱 Productos disponibles: ${products.length}`);
    console.log(`🛍️ Items en carrito: ${cart.length}`);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initApp);
