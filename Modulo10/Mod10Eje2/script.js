// Elementos del DOM
const form = document.getElementById('imcForm');
const pesoInput = document.getElementById('peso');
const alturaInput = document.getElementById('altura');
const edadInput = document.getElementById('edad');
const resultSection = document.getElementById('resultSection');
const imcValue = document.getElementById('imcValue');
const imcCategory = document.getElementById('imcCategory');
const imcIndicator = document.getElementById('imcIndicator');
const recommendationText = document.getElementById('recommendationText');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

// Historial de cálculos
let history = JSON.parse(localStorage.getItem('imcHistory')) || [];

/**
 * Calcular IMC
 */
function calcularIMC(peso, alturaCm) {
    const alturaM = alturaCm / 100;
    return peso / (alturaM * alturaM);
}

/**
 * Obtener categoría del IMC
 */
function obtenerCategoria(imc) {
    if (imc < 18.5) return 'Bajo peso';
    if (imc < 25) return 'Normal';
    if (imc < 30) return 'Sobrepeso';
    return 'Obesidad';
}

/**
 * Obtener color de la categoría
 */
function obtenerColor(imc) {
    if (imc < 18.5) return '#3498db';
    if (imc < 25) return '#2ecc71';
    if (imc < 30) return '#f39c12';
    return '#e74c3c';
}

/**
 * Obtener recomendaciones
 */
function obtenerRecomendaciones(imc, categoria) {
    const recomendaciones = {
        'Bajo peso': 'Tu IMC está por  debajo del rango saludable. Considera consultar con un nutricionista para desarrollar un plan de alimentación que te ayude a alcanzar un peso saludable de manera segura.',
        'Normal': '¡Felicidades! Tu IMC está en el rango saludable. Continúa con una dieta balanceada y ejercicio regular para mantener tu salud.',
        'Sobrepeso': 'Tu IMC indica sobrepeso. Considera adoptar hábitos más saludables como una dieta equilibrada y actividad física regular. Consulta con un profesional de la salud.',
        'Obesidad': 'Tu IMC indica obesidad. Es importante consultar con un médico o nutricionista para desarrollar un plan personalizado de salud y bienestar.'
    };
    
    return recomendaciones[categoria] || '';
}

/**
 * Posicionar indicador en la barra
 */
function posicionarIndicador(imc) {
    // Calcular posición en la barra (0-100%)
    let porcentaje;
    
    if (imc < 18.5) {
        porcentaje = (imc / 18.5) * 25;
    } else if (imc < 25) {
        porcentaje = 25 + ((imc - 18.5) / (25 - 18.5)) * 25;
    } else if (imc < 30) {
        porcentaje = 50 + ((imc - 25) / (30 - 25)) * 25;
    } else {
        porcentaje = 75 + Math.min(((imc - 30) / 10) * 25, 25);
    }
    
    imcIndicator.style.left = `${porcentaje}%`;
}

/**
 * Mostrar resultado
 */
function mostrarResultado(imc, categoria) {
    // Mostrar valores
    imcValue.textContent = imc.toFixed(1);
    imcCategory.textContent = categoria;
    imcCategory.style.color = obtenerColor(imc);
    
    // Posicionar indicador
    posicionarIndicador(imc);
    
    // Mostrar recomendaciones
    recommendationText.textContent = obtenerRecomendaciones(imc, categoria);
    
    // Mostrar sección de resultados
    resultSection.style.display = 'block';
    
    // Scroll suave al resultado
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Guardar en historial
 */
function guardarEnHistorial(peso, altura, imc, categoria) {
    const calculo = {
        peso,
        altura,
        imc: imc.toFixed(1),
        categoria,
        fecha: new Date().toLocaleString('es-ES')
    };
    
    history.unshift(calculo);
    
    // Limitar a 10 registros
    if (history.length > 10) {
        history = history.slice(0, 10);
    }
    
    localStorage.setItem('imcHistory', JSON.stringify(history));
    renderizarHistorial();
}

/**
 * Renderizar historial
 */
function renderizarHistorial() {
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-history">No hay cálculos previos</p>';
        clearHistoryBtn.style.display = 'none';
        return;
    }
    
    clearHistoryBtn.style.display = 'block';
    
    historyList.innerHTML = history.map(item => `
        <div class="history-item">
            <div class="history-info">
                <div>Peso: ${item.peso}kg | Altura: ${item.altura}cm</div>
                <div class="history-date">${item.fecha}</div>
            </div>
            <div>
                <div class="history-imc">${item.imc}</div>
                <div style="color: ${obtenerColor(parseFloat(item.imc))}">${item.categoria}</div>
            </div>
        </div>
    `).join('');
}

/**
 * Validar campo
 */
function validarCampo(input) {
    const value = parseFloat(input.value);
    const min = parseFloat(input.min);
    const max = parseFloat(input.max);
    const errorSpan = input.parentElement.querySelector('.error-message');
    
    if (!input.value) {
        errorSpan.textContent = 'Este campo es obligatorio';
        input.classList.add('invalid');
        input.classList.remove('valid');
        return false;
    }
    
    if (isNaN(value) || value < min || value > max) {
        errorSpan.textContent = `Debe estar entre ${min} y ${max}`;
        input.classList.add('invalid');
        input.classList.remove('valid');
        return false;
    }
    
    errorSpan.textContent = '';
    input.classList.remove('invalid');
    input.classList.add('valid');
    return true;
}

// Validación en tiempo real
pesoInput.addEventListener('input', () => validarCampo(pesoInput));
alturaInput.addEventListener('input', () => validarCampo(alturaInput));
edadInput.addEventListener('input', () => validarCampo(edadInput));

// Manejo del formulario
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Validar todos los campos
    const pesoValido = validarCampo(pesoInput);
    const alturaValida = validarCampo(alturaInput);
    const edadValida = validarCampo(edadInput);
    
    if (!pesoValido || !alturaValida || !edadValida) {
        alert('Por favor, completa todos los campos correctamente');
        return;
    }
    
    // Obtener valores
    const peso = parseFloat(pesoInput.value);
    const altura = parseFloat(alturaInput.value);
    
    // Calcular IMC
    const imc = calcularIMC(peso, altura);
    const categoria = obtenerCategoria(imc);
    
    // Mostrar resultado
    mostrarResultado(imc, categoria);
    
    // Guardar en historial
    guardarEnHistorial(peso, altura, imc, categoria);
});

// Limpiar historial
clearHistoryBtn.addEventListener('click', () => {
    if (confirm('¿Estás seguro de eliminar todo el historial?')) {
        history = [];
        localStorage.removeItem('imcHistory');
        renderizarHistorial();
    }
});

// Inicializar
renderizarHistorial();

console.log('✅ Calculadora de IMC inicializada');
