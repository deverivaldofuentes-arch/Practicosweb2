
/* Objetivo: Asignar clases de tamaño a las tarjetas de manera inteligente
   para crear un efecto Masonry balanceado y visualmente atractivo.
*/

// 1. Seleccionamos todas las tarjetas
const cards = document.querySelectorAll('.card');

// 2. Definimos las posibles variaciones de tamaño
const sizes = ['card-normal', 'card-tall', 'card-wide', 'card-big'];

// 3. Contador para balancear los tamaños
let tallCount = 0;
let wideCount = 0;
let bigCount = 0;

// 4. Iteramos sobre cada tarjeta
cards.forEach(card => {
    // Si la tarjeta ya tiene una clase de tamaño, la respetamos
    const hasSizeClass = card.classList.contains('card-tall') || 
                         card.classList.contains('card-wide') || 
                         card.classList.contains('card-big');
    
    if (!hasSizeClass) {
        // Generamos un número aleatorio con pesos para balancear
        let randomSize;
        const rand = Math.random();
        
        // Ajustamos probabilidades para un mejor equilibrio visual
        if (rand < 0.4) {
            randomSize = 0; // Normal (40% de probabilidad)
        } else if (rand < 0.65) {
            randomSize = 1; // Tall (25% de probabilidad)
        } else if (rand < 0.85) {
            randomSize = 2; // Wide (20% de probabilidad)
        } else {
            randomSize = 3; // Big (15% de probabilidad)
        }
        
        // Añadimos la clase correspondiente
        if (sizes[randomSize] !== 'card-normal') {
            card.classList.add(sizes[randomSize]);
            
            // Contamos los tipos de tarjetas
            if (sizes[randomSize] === 'card-tall') tallCount++;
            if (sizes[randomSize] === 'card-wide') wideCount++;
            if (sizes[randomSize] === 'card-big') bigCount++;
        }
    } else {
        // Contamos las tarjetas que ya tenían clases
        if (card.classList.contains('card-tall')) tallCount++;
        if (card.classList.contains('card-wide')) wideCount++;
        if (card.classList.contains('card-big')) bigCount++;
    }
});

// 5. Información de depuración (opcional)
console.log(`Distribución final:
- Tarjetas normales: ${cards.length - tallCount - wideCount - bigCount}
- Tarjetas altas: ${tallCount}
- Tarjetas anchas: ${wideCount}
- Tarjetas grandes: ${bigCount}`);

