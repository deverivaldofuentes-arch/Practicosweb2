// ===============================================
//  ANIMACIONES AL HACER SCROLL (Intersection Observer)
// ===============================================

// Configuración del observer: activa la animación cuando el elemento está al 20% visible
// y un poco antes de llegar al final de la pantalla (-100px de margen inferior)
const observerOptions = {
    threshold: 0.2,           // 20% del elemento visible → se activa
    rootMargin: '0px 0px -100px 0px'  // Anticipa un poco la activación
};

// Crea el observer que se ejecuta cada vez que un elemento entra/sale del viewport
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        // Si el elemento ya es visible en pantalla
        if (entry.isIntersecting) {
            entry.target.classList.add('visible'); // Añade la clase que dispara la animación CSS
            // Opcional: podrías hacer observer.unobserve(entry.target) aquí si solo quieres que se anime una vez
        }
    });
}, observerOptions);

// Selecciona todos los elementos que tienen animación al hacer scroll y los pone bajo vigilancia
document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
});


// ===============================================
//  EFECTO RIPPLE EN BOTONES (al hacer click)
// ===============================================

document.querySelectorAll('.btn-ripple').forEach(button => {
    button.addEventListener('click', function(e) {
        
        // Intenta reutilizar un span existente o crea uno nuevo para el efecto ripple
        let ripple = this.querySelector('span.ripple');
        if (!ripple) {
            ripple = document.createElement('span');
            ripple.classList.add('ripple');
            this.appendChild(ripple);
        }

        // Elimina la clase de animación anterior para poder volver a animar
        ripple.classList = this.querySelectorAll('span.ripple');
        if (rippleList.length > 1) {
            rippleList[0].remove();
        }

        // Calcula el tamaño del ripple (el diámetro más grande del botón)
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2; // Un poco más grande para que cubra todo

        // Posición del clic respecto al botón
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Aplica estilos al ripple
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (x - size / 2) + 'px';
        ripple.style.top  = (y - size / 2) + 'px';

        // Forza reflujo para reiniciar la animación
        ripple.offsetWidth;

        // Añade la clase que activa la animación CSS (debes tenerla en tu CSS)
        ripple.classList.add('active');
    });
});
