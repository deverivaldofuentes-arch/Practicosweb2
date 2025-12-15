// script.js - Versión Mejorada 2025
let contador = parseInt(localStorage.getItem("contador")) || 0;
let operaciones = parseInt(localStorage.getItem("operaciones")) || 0;

const contadorElement = document.getElementById("contador");
const mensajeElement = document.getElementById("mensaje");
const operacionesElement = document.getElementById("operaciones");
const display = document.getElementById("display");
const btnCopiar = document.getElementById("btnCopiar");

function actualizarDisplay() {
    contadorElement.textContent = contador.toLocaleString('es-ES');

    // Remover clases anteriores
    contadorElement.className = "numero";
    display.className = "contador-display";

    // Aplicar estado visual
    if (contador > 0) {
        contadorElement.classList.add("positivo");
        display.classList.add("positivo");
        actualizarMensaje("positivo");
    } else if (contador < 0) {
        contadorElement.classList.add("negativo");
        display.classList.add("negativo");
        actualizarMensaje("negativo");
    } else {
        contadorElement.classList.add("neutro");
        display.classList.add("neutro");
        actualizarMensaje("neutro");
    }

    // Animación de pulso
    contadorElement.style.animation = 'none';
    requestAnimationFrame(() => {
        contadorElement.style.animation = 'pulso 0.4s ease';
    });

    // Guardar
    localStorage.setItem("contador", contador);
    operacionesElement.textContent = operaciones;
}

function actualizarMensaje(estado) {
    let texto = "";
    const valorAbs = Math.abs(contador).toLocaleString('es-ES');
    
    switch (estado) {
        case "positivo":
            texto = `¡Genial! El contador está en <strong>positivo (+${valorAbs})</strong>`;
            break;
        case "negativo":
            texto = `Cuidado, el contador está en <strong>negativo (${contador.toLocaleString('es-ES')})</strong>`;
            break;
        case "neutro":
            texto = "El contador está en <strong>cero</strong> - ¡Listo para empezar!";
            break;
    }
    mensajeElement.innerHTML = texto;
}

function modificar(valor) {
    contador += valor;
    operaciones++;
    localStorage.setItem("operaciones", operaciones);
    actualizarDisplay();
}

function resetear() {
    if (contador === 0) return;
    contador = 0;
    actualizarDisplay();
}

// Event Listeners
document.querySelectorAll('[data-value]').forEach(btn => {
    btn.addEventListener('click', () => {
        const valor = parseInt(btn.getAttribute('data-value'));
        modificar(valor);
    });
});

document.querySelector('.btn-resetear').addEventListener('click', resetear);

btnCopiar.addEventListener('click', () => {
    navigator.clipboard.writeText(contador);
    btnCopiar.textContent = '¡Copiado!';
    btnCopiar.style.background = '#10b981';
    setTimeout(() => {
        btnCopiar.textContent = 'Copiar valor actual';
        btnCopiar.style.background = '';
    }, 2000);
});

// Atajos de teclado mejorados
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case "ArrowUp": case "w": case "W": modificar(1); break;
        case "ArrowDown": case "s": case "S": modificar(-1); break;
        case "+": modificar(10); break;
        case "-": modificar(-10); break;
        case " ": e.preventDefault(); resetear(); break;
        case "c": case "C": btnCopiar.click(); break;
    }
});

// Inicializar
actualizarDisplay();
console.log("Contador Pro cargado | Atajos: ↑↓ (+/-1) | + - (+/-10) | Espacio (reset) | C (copiar)");
