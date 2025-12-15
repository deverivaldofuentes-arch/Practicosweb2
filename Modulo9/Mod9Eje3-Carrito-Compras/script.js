// Base de datos de productos
const products = [
    {
        id: 1,
        name: 'Laptop Pro',
        price: 12999,
        description: 'Laptop de alto rendimiento',
        emoji: '💻',
        stock: 5
    },
    {
        id: 2,
        name: 'Smartphone',
        price: 8999,
        description: 'Teléfono inteligente de última generación',
        emoji: '📱',
        stock: 10
    },
    {
        id: 3,
        name: 'Auriculares',
        price: 2499,
        description: 'Auriculares inalámbricos con cancelación de ruido',
        emoji: '🎧',
        stock: 15
    },
    {
        id: 4,
        name: 'Tablet',
        price: 6999,
        description: 'Tablet de 10 pulgadas',
        emoji: '📱',
        stock: 8
    },
    {
        id: 5,
        name: 'Smartwatch',
        price: 4999,
        description: 'Reloj inteligente con GPS',
        emoji: '⌚',
        stock: 12
    },
    {
        id: 6,
        name: 'Cámara',
        price: 15999,
        description: 'Cámara profesional 4K',
        emoji: '📷',
        stock: 3
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

const SHIPPING_COST = 50;
const TAX_RATE = 0.16;

/**
 * Renderizar productos en el catálogo
 */
function renderProducts() {
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        const stockClass = product.stock < 5 ? 'low' : '';
        const stockText = product.stock < 5 ? `¡Solo ${product.stock} disponibles!` : `${product.stock} disponibles`;
        
        productCard.innerHTML = `
            <div class="product-image">${product.emoji}</div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <p class="product-price">$${product.price.toLocaleString()}</p>
                <p class="product-stock ${stockClass}">${stockText}</p>
                <button class="btn-add-cart" onclick="addToCart(${product.id})" ${product.stock === 0 ? 'disabled' : ''}>
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
        alert('Producto no disponible');
        return;
    }
    
    // Buscar si el producto ya está en el carrito
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        // Verificar stock
        if (existingItem.quantity >= product.stock) {
            alert(`No hay más stock disponible de ${product.name}`);
            return;
        }
        existingItem.quantity++;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            emoji: product.emoji,
            quantity: 1
        });
    }
    
    saveCart();
    renderCart();
    updateCartCount();
    
    // Animación del icono del carrito
    cartCount.style.transform = 'scale(1.3)';
    setTimeout(() => {
        cartCount.style.transform = 'scale(1)';
    }, 300);
}

/**
 * Renderizar carrito
 */
function renderCart() {
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
        cartSummary.style.display = 'none';
        return;
    }
    
    cartItems.innerHTML = '';
    cartSummary.style.display = 'block';
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        cartItem.innerHTML = `
            <div class="cart-item-image">${item.emoji}</div>
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toLocaleString()}</div>
                <div class="cart-item-controls">
                    <button class="qty-btn" onclick="decreaseQuantity(${item.id})">-</button>
                    <span class="qty-display">${item.quantity}</span>
                    <button class="qty-btn" onclick="increaseQuantity(${item.id})">+</button>
                    <button class="btn-remove" onclick="removeFromCart(${item.id})">Eliminar</button>
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
        alert(`No hay más stock disponible de ${product.name}`);
        return;
    }
    
    cartItem.quantity++;
    saveCart();
    renderCart();
}

/**
 * Disminuir cantidad
 */
function decreaseQuantity(productId) {
    const cartItem = cart.find(item => item.id === productId);
    
    if (cartItem.quantity > 1) {
        cartItem.quantity--;
    } else {
        removeFromCart(productId);
        return;
    }
    
    saveCart();
    renderCart();
}

/**
 * Eliminar producto del carrito
 */
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
    updateCartCount();
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
        alert('El carrito ya está vacío');
        return;
    }
    
    if (confirm('¿Estás seguro de vaciar el carrito?')) {
        cart = [];
        saveCart();
        renderCart();
        updateCartCount();
    }
}

/**
 * Realizar checkout
 */
function checkout() {
    if (cart.length === 0) {
        alert('El carrito está vacío');
        return;
    }
    
    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = totalAmount * TAX_RATE;
    const finalTotal = totalAmount + taxAmount + SHIPPING_COST;
    
    // Mostrar modal de confirmación
    orderTotal.textContent = `$${finalTotal.toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
    confirmModal.classList.add('active');
    
    // Limpiar carrito después del pedido
    setTimeout(() => {
        cart = [];
        saveCart();
        renderCart();
        updateCartCount();
    }, 500);
}

/**
 * Cerrar modal
 */
function closeModal() {
    confirmModal.classList.remove('active');
}

// Event Listeners
checkoutBtn.addEventListener('click', checkout);
clearCartBtn.addEventListener('click', clearCart);

// Cerrar modal con clic en overlay
confirmModal.querySelector('.modal-overlay').addEventListener('click', closeModal);

// Inicializar
renderProducts();
renderCart();
updateCartCount();

console.log('🛒 Carrito de compras inicializado');
console.log(`Productos disponibles: ${products.length}`);
console.log(`Items en carrito: ${cart.length}`);
