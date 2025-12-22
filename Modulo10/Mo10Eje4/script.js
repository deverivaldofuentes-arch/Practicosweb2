// Elementos del DOM
const form = document.getElementById('generatorForm');
const lengthInput = document.getElementById('length');
const lengthValue = document.getElementById('lengthValue');
const uppercaseCheck = document.getElementById('uppercase');
const lowercaseCheck = document.getElementById('lowercase');
const numbersCheck = document.getElementById('numbers');
const symbolsCheck = document.getElementById('symbols');
const passwordOutput = document.getElementById('passwordOutput');
const copyBtn = document.getElementById('copyBtn');
const strengthBar = document.getElementById('strengthBar');
const strengthText = document.getElementById('strengthText');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const toast = document.getElementById('toast');

// Caracteres disponibles
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// Historial
let history = JSON.parse(localStorage.getItem('passwordHistory')) || [];

/**
 * Generar contraseña
 */
function generarPassword(length, options) {
    let charset = '';
    let password = '';
    
    // Construir conjunto de caracteres
    if (options.uppercase) charset += UPPERCASE;
    if (options.lowercase) charset += LOWERCASE;
    if (options.numbers) charset += NUMBERS;
    if (options.symbols) charset += SYMBOLS;
    
    // Validar que haya al menos una opción seleccionada
    if (charset === '') {
        alert('Debes seleccionar al menos una opción');
        return null;
    }
    
    // Generar contraseña
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    
    // Asegurar que tenga al menos un carácter de cada tipo seleccionado
    if (options.uppercase && !/[A-Z]/.test(password)) {
        password = password.slice(0, -1) + UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)];
    }
    if (options.lowercase && !/[a-z]/.test(password)) {
        password = password.slice(0, -1) + LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)];
    }
    if (options.numbers && !/[0-9]/.test(password)) {
        password = password.slice(0, -1) + NUMBERS[Math.floor(Math.random() * NUMBERS.length)];
    }
    if (options.symbols && !/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
        password = password.slice(0, -1) + SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    }
    
    // Mezclar caracteres (shuffle)
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    return password;
}

/**
 * Calcular fuerza de contraseña
 */
function calcularFuerza(password) {
    let fuerza = 0;
    
    // Longitud
    if (password.length >= 8) fuerza += 25;
    if (password.length >= 12) fuerza += 15;
    if (password.length >= 16) fuerza += 10;
    
    // Variedad de caracteres
    if (/[a-z]/.test(password)) fuerza += 15;
    if (/[A-Z]/.test(password)) fuerza += 15;
    if (/[0-9]/.test(password)) fuerza += 10;
    if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) fuerza += 10;
    
    return Math.min(fuerza, 100);
}

/**
 * Actualizar indicador de fuerza
 */
function actualizarFuerza(password) {
    const fuerza = calcularFuerza(password);
    
    strengthBar.style.width = `${fuerza}%`;
    
    if (fuerza < 40) {
        strengthBar.style.background = '#ff6b6b';
        strengthText.textContent = 'Fuerza: Débil';
        strengthText.style.color = '#ff6b6b';
    } else if (fuerza < 70) {
        strengthBar.style.background = '#ffa502';
        strengthText.textContent = 'Fuerza: Media';
        strengthText.style.color = '#ffa502';
    } else {
        strengthBar.style.background = '#4caf50';
        strengthText.textContent = 'Fuerza: Fuerte';
        strengthText.style.color = '#4caf50';
    }
}

/**
 * Copiar al portapapeles
 */
async function copiarAlPortapapeles(text) {
    try {
        await navigator.clipboard.writeText(text);
        mostrarToast('✓ Contraseña copiada');
    } catch (err) {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        mostrarToast('✓ Contraseña copiada');
    }
}

/**
 * Mostrar toast
 */
function mostrarToast(mensaje) {
    toast.textContent = mensaje;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

/**
 * Guardar en historial
 */
function guardarEnHistorial(password) {
    history.unshift(password);
    if (history.length > 10) {
        history = history.slice(0, 10);
    }
    localStorage.setItem('passwordHistory', JSON.stringify(history));
    renderizarHistorial();
}

/**
 * Renderizar historial
 */
function renderizarHistorial() {
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty">No hay contraseñas generadas aún</p>';
        clearHistoryBtn.style.display = 'none';
        return;
    }
    
    clearHistoryBtn.style.display = 'block';
    
    historyList.innerHTML = history.map(pwd => `
        <div class="history-item">
            <span class="history-password">${pwd}</span>
            <button class="history-copy" onclick="copiarAlPortapapeles('${pwd}')">Copiar</button>
        </div>
    `).join('');
}

// Actualizar valor del slider
lengthInput.addEventListener('input', () => {
    lengthValue.textContent = lengthInput.value;
});

// Generar contraseña
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const length = parseInt(lengthInput.value);
    const options = {
        uppercase: uppercaseCheck.checked,
        lowercase: lowercaseCheck.checked,
        numbers: numbersCheck.checked,
        symbols: symbolsCheck.checked
    };
    
    const password = generarPassword(length, options);
    
    if (password) {
        passwordOutput.value = password;
        actualizarFuerza(password);
        guardarEnHistorial(password);
        
        // Animación
        passwordOutput.style.transform = 'scale(1.05)';
        setTimeout(() => {
            passwordOutput.style.transform = 'scale(1)';
        }, 200);
    }
});

// Copiar contraseña principal
copyBtn.addEventListener('click', () => {
    if (passwordOutput.value && passwordOutput.value !== 'Genera una contraseña') {
        copiarAlPortapapeles(passwordOutput.value);
    } else {
        alert('Primero genera una contraseña');
    }
});

// Limpiar historial
clearHistoryBtn.addEventListener('click', () => {
    if (confirm('¿Eliminar todo el historial?')) {
        history = [];
        localStorage.removeItem('passwordHistory');
        renderizarHistorial();
    }
});

// Generar automáticamente al cargar
window.addEventListener('DOMContentLoaded', () => {
    renderizarHistorial();
    form.dispatchEvent(new Event('submit'));
});

console.log('🔐 Generador de contraseñas inicializado');
