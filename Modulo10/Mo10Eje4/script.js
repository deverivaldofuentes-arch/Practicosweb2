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
const refreshBtn = document.getElementById('refreshBtn');
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
 * Generar contraseña segura
 */
function generarPassword(length, options) {
    let charset = '';
    let password = '';
    let requiredChars = [];
    
    // Construir conjunto de caracteres y caracteres requeridos
    if (options.uppercase) {
        charset += UPPERCASE;
        requiredChars.push(UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)]);
    }
    if (options.lowercase) {
        charset += LOWERCASE;
        requiredChars.push(LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)]);
    }
    if (options.numbers) {
        charset += NUMBERS;
        requiredChars.push(NUMBERS[Math.floor(Math.random() * NUMBERS.length)]);
    }
    if (options.symbols) {
        charset += SYMBOLS;
        requiredChars.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
    }
    
    // Validar que haya al menos una opción seleccionada
    if (charset === '') {
        mostrarToast('⚠️ Debes seleccionar al menos una opción', 'warning');
        return null;
    }
    
    // Asegurar que haya suficientes caracteres para la longitud
    if (length < requiredChars.length) {
        length = requiredChars.length;
        lengthInput.value = length;
        lengthValue.textContent = length;
    }
    
    // Añadir caracteres requeridos primero
    for (let char of requiredChars) {
        password += char;
    }
    
    // Completar con caracteres aleatorios
    for (let i = password.length; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
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
    if (password.length >= 4) fuerza += 10;
    if (password.length >= 8) fuerza += 20;
    if (password.length >= 12) fuerza += 20;
    if (password.length >= 16) fuerza += 10;
    
    // Variedad de caracteres
    if (/[a-z]/.test(password)) fuerza += 10;
    if (/[A-Z]/.test(password)) fuerza += 10;
    if (/[0-9]/.test(password)) fuerza += 10;
    if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) fuerza += 10;
    
    // Entropía
    let charsetSize = 0;
    if (/[a-z]/.test(password)) charsetSize += 26;
    if (/[A-Z]/.test(password)) charsetSize += 26;
    if (/[0-9]/.test(password)) charsetSize += 10;
    if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) charsetSize += 10;
    
    // Ajuste por entropía
    fuerza = Math.min(fuerza, 100);
    
    return fuerza;
}

/**
 * Actualizar indicador de fuerza
 */
function actualizarFuerza(password) {
    const fuerza = calcularFuerza(password);
    
    strengthBar.style.width = `${fuerza}%`;
    
    if (fuerza < 40) {
        strengthBar.style.background = 'linear-gradient(90deg, #ff6b6b, #ff8e8e)';
        strengthText.textContent = 'Débil';
        strengthText.style.color = '#ff6b6b';
    } else if (fuerza < 70) {
        strengthBar.style.background = 'linear-gradient(90deg, #ffa502, #ffc44d)';
        strengthText.textContent = 'Media';
        strengthText.style.color = '#ffa502';
    } else {
        strengthBar.style.background = 'linear-gradient(90deg, #4caf50, #66bb6a)';
        strengthText.textContent = 'Fuerte';
        strengthText.style.color = '#4caf50';
    }
}

/**
 * Copiar al portapapeles
 */
async function copiarAlPortapapeles(text) {
    try {
        await navigator.clipboard.writeText(text);
        mostrarToast('✓ Contraseña copiada al portapapeles');
    } catch (err) {
        // Fallback para navegadores antiguos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        mostrarToast('✓ Contraseña copiada al portapapeles');
    }
}

/**
 * Mostrar toast con mensaje
 */
function mostrarToast(mensaje, tipo = 'success') {
    const icon = tipo === 'success' ? '✓' : '⚠️';
    toast.innerHTML = `
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
        <span>${mensaje}</span>
        <div class="toast-progress"></div>
    `;
    toast.className = 'toast';
    toast.classList.add('show', tipo);
    
    // Barra de progreso
    const progress = toast.querySelector('.toast-progress');
    progress.style.width = '100%';
    progress.style.animation = 'progress 2s linear forwards';
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

/**
 * Guardar en historial
 */
function guardarEnHistorial(password) {
    // Evitar duplicados consecutivos
    if (history[0] !== password) {
        history.unshift(password);
        if (history.length > 10) {
            history = history.slice(0, 10);
        }
        localStorage.setItem('passwordHistory', JSON.stringify(history));
        renderizarHistorial();
    }
}

/**
 * Renderizar historial
 */
function renderizarHistorial() {
    if (history.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clock"></i>
                <p>No hay contraseñas generadas aún</p>
            </div>
        `;
        clearHistoryBtn.style.display = 'none';
        return;
    }
    
    clearHistoryBtn.style.display = 'flex';
    
    historyList.innerHTML = history.map(pwd => `
        <div class="history-item">
            <span class="history-password" title="${pwd}">${pwd}</span>
            <button class="history-copy" data-password="${pwd}">
                <i class="far fa-copy"></i> Copiar
            </button>
        </div>
    `).join('');
    
    // Añadir event listeners a los botones de copiar del historial
    document.querySelectorAll('.history-copy').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const password = e.target.closest('.history-copy').dataset.password;
            copiarAlPortapapeles(password);
        });
    });
}

/**
 * Generar nueva contraseña con configuración actual
 */
function generarNuevaPassword() {
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
}

// Event Listeners
lengthInput.addEventListener('input', () => {
    lengthValue.textContent = lengthInput.value;
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    generarNuevaPassword();
});

copyBtn.addEventListener('click', () => {
    if (passwordOutput.value && passwordOutput.value !== 'Tu contraseña aparecerá aquí') {
        copiarAlPortapapeles(passwordOutput.value);
    } else {
        mostrarToast('⚠️ Primero genera una contraseña', 'warning');
    }
});

refreshBtn.addEventListener('click', generarNuevaPassword);

clearHistoryBtn.addEventListener('click', () => {
    if (confirm('¿Estás seguro de que quieres eliminar todo el historial?')) {
        history = [];
        localStorage.removeItem('passwordHistory');
        renderizarHistorial();
        mostrarToast('Historial limpiado correctamente');
    }
});

// Permitir copiar al hacer clic en la contraseña
passwordOutput.addEventListener('click', function() {
    if (this.value && this.value !== 'Tu contraseña aparecerá aquí') {
        this.select();
    }
});

// Generar automáticamente al cargar
window.addEventListener('DOMContentLoaded', () => {
    renderizarHistorial();
    generarNuevaPassword();
    
    // Configurar marcadores de longitud
    const markers = document.querySelectorAll('.length-markers span');
    markers.forEach(marker => {
        marker.addEventListener('click', function() {
            const value = this.textContent.replace('+', '');
            lengthInput.value = value === '20+' ? '32' : value;
            lengthValue.textContent = lengthInput.value;
            
            // Animación de cambio
            lengthValue.style.transform = 'scale(1.2)';
            setTimeout(() => {
                lengthValue.style.transform = 'scale(1)';
            }, 200);
            
            generarNuevaPassword();
        });
    });
    
    // Mejorar la animación al generar nueva contraseña
    const originalGenerate = generarNuevaPassword;
    generarNuevaPassword = function() {
        // Animación de carga
        refreshBtn.style.transform = 'rotate(180deg)';
        setTimeout(() => {
            refreshBtn.style.transform = 'rotate(360deg)';
        }, 300);
        
        originalGenerate();
    };
});

console.log('🔐 SecurePass - Generador de contraseñas inicializado');
