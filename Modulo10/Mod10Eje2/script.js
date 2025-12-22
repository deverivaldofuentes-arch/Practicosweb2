// Elementos del DOM
const form = document.getElementById('imcForm');
const pesoInput = document.getElementById('peso');
const alturaInput = document.getElementById('altura');
const edadInput = document.getElementById('edad');
const pesoRange = document.getElementById('pesoRange');
const alturaRange = document.getElementById('alturaRange');
const pesoValue = document.getElementById('pesoValue');
const alturaValue = document.getElementById('alturaValue');
const resetBtn = document.getElementById('resetBtn');
const resultSection = document.getElementById('resultSection');
const imcValue = document.getElementById('imcValue');
const imcCategory = document.getElementById('imcCategory');
const categoryBadge = document.getElementById('categoryBadge');
const categoryText = document.getElementById('categoryText');
const currentMarker = document.getElementById('currentMarker');
const healthStatus = document.getElementById('healthStatus');
const idealWeight = document.getElementById('idealWeight');
const dailyCalories = document.getElementById('dailyCalories');
const recommendationText = document.getElementById('recommendationText');
const dietBtn = document.getElementById('dietBtn');
const exerciseBtn = document.getElementById('exerciseBtn');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const exportBtn = document.getElementById('exportBtn');
const totalCalculations = document.getElementById('totalCalculations');
const averageIMC = document.getElementById('averageIMC');
const dietModal = document.getElementById('dietModal');
const exerciseModal = document.getElementById('exerciseModal');
const closeDietModal = document.getElementById('closeDietModal');
const closeExerciseModal = document.getElementById('closeExerciseModal');
const dietContent = document.getElementById('dietContent');
const exerciseContent = document.getElementById('exerciseContent');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('i');

// Historial de cálculos
let history = JSON.parse(localStorage.getItem('imcHistory')) || [];

// Configuración del tema
let currentTheme = localStorage.getItem('theme') || 'dark';

// Sincronización de inputs y ranges
function syncInputs() {
    // Peso
    pesoInput.addEventListener('input', (e) => {
        pesoRange.value = e.target.value;
        pesoValue.textContent = `${e.target.value}kg`;
    });

    pesoRange.addEventListener('input', (e) => {
        pesoInput.value = e.target.value;
        pesoValue.textContent = `${e.target.value}kg`;
    });

    // Altura
    alturaInput.addEventListener('input', (e) => {
        alturaRange.value = e.target.value;
        alturaValue.textContent = `${e.target.value}cm`;
    });

    alturaRange.addEventListener('input', (e) => {
        alturaInput.value = e.target.value;
        alturaValue.textContent = `${e.target.value}cm`;
    });
}

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
function obtenerColor(categoria) {
    const colors = {
        'Bajo peso': '#3498db',
        'Normal': '#2ecc71',
        'Sobrepeso': '#f39c12',
        'Obesidad': '#e74c3c'
    };
    return colors[categoria] || '#666';
}

/**
 * Obtener estado de salud
 */
function obtenerEstadoSalud(categoria, imc) {
    const estados = {
        'Bajo peso': { emoji: '⚠️', text: 'Por debajo del peso ideal' },
        'Normal': { emoji: '✅', text: 'Saludable' },
        'Sobrepeso': { emoji: '⚠️', text: 'Sobrepeso' },
        'Obesidad': { emoji: '❗', text: 'Riesgo elevado' }
    };
    
    const estado = estados[categoria] || { emoji: '❓', text: 'No determinado' };
    return `${estado.emoji} ${estado.text}`;
}

/**
 * Calcular peso ideal
 */
function calcularPesoIdeal(alturaCm, sexo) {
    const alturaM = alturaCm / 100;
    // Fórmula de Devine
    if (sexo === 'masculino') {
        const pesoMin = 50 + 0.9 * (alturaCm - 152.4);
        const pesoMax = pesoMin + 4.5;
        return `${pesoMin.toFixed(1)} - ${pesoMax.toFixed(1)} kg`;
    } else {
        const pesoMin = 45.5 + 0.9 * (alturaCm - 152.4);
        const pesoMax = pesoMin + 4.5;
        return `${pesoMin.toFixed(1)} - ${pesoMax.toFixed(1)} kg`;
    }
}

/**
 * Calcular calorías diarias
 */
function calcularCaloriasDiarias(peso, alturaCm, edad, sexo, categoria) {
    // Fórmula de Harris-Benedict revisada
    let bmr;
    if (sexo === 'masculino') {
        bmr = 88.362 + (13.397 * peso) + (4.799 * alturaCm) - (5.677 * edad);
    } else {
        bmr = 447.593 + (9.247 * peso) + (3.098 * alturaCm) - (4.330 * edad);
    }
    
    // Validar valores extremos
    if (bmr < 800) bmr = 800; // Mínimo razonable
    if (bmr > 4000) bmr = 4000; // Máximo razonable
    
    // Ajustar según actividad (sedentario)
    let calorias = bmr * 1.2;
    
    // Ajustar según objetivo con límites
    let ajuste;
    switch(categoria) {
        case 'Bajo peso': ajuste = 1.15; break; // Ganar peso moderadamente
        case 'Normal': ajuste = 1.0; break;
        case 'Sobrepeso': ajuste = 0.85; break; // Perder peso moderadamente
        case 'Obesidad': ajuste = 0.75; break; // Perder peso
        default: ajuste = 1.0;
    }
    
    calorias = calorias * ajuste;
    
    // Límites de seguridad
    if (calorias < 1200) calorias = 1200; // Mínimo para salud
    if (calorias > 3500) calorias = 3500; // Máximo razonable
    
    return Math.round(calorias);
}

/**
 * Obtener recomendaciones
 */
function obtenerRecomendaciones(imc, categoria) {
    const recomendaciones = {
        'Bajo peso': [
            'Consulta con un nutricionista para un plan de ganancia de peso saludable.',
            'Incluye alimentos ricos en nutrientes como aguacate, frutos secos y proteínas magras.',
            'Realiza ejercicio de fuerza para ganar masa muscular.',
            'Come 5-6 comidas pequeñas al día en lugar de 3 grandes.'
        ],
        'Normal': [
            '¡Excelente! Mantén tus hábitos saludables.',
            'Continúa con una dieta balanceada y ejercicio regular.',
            'Realiza al menos 150 minutos de actividad física moderada por semana.',
            'Mantén una hidratación adecuada (2-3 litros de agua diarios).'
        ],
        'Sobrepeso': [
            'Consulta con un profesional de la salud para un plan personalizado.',
            'Reduce el consumo de azúcares refinados y alimentos procesados.',
            'Incrementa tu actividad física gradualmente.',
            'Incorpora más frutas, verduras y alimentos integrales en tu dieta.'
        ],
        'Obesidad': [
            'Es importante consultar con un médico para evaluación completa.',
            'Considera un programa supervisado de pérdida de peso.',
            'Comienza con ejercicio de bajo impacto como caminar o nadar.',
            'Lleva un diario de alimentación para identificar patrones.'
        ]
    };
    
    return recomendaciones[categoria] || [];
}

/**
 * Obtener plan alimenticio
 */
function obtenerPlanAlimenticio(categoria) {
    const planes = {
        'Bajo peso': {
            titulo: 'Plan para Ganar Peso Saludable',
            desayuno: 'Batido de proteínas con frutas y avena',
            almuerzo: 'Pechuga de pollo con arroz integral y aguacate',
            merienda: 'Yogur griego con frutos secos',
            cena: 'Salmón con quinoa y vegetales al vapor',
            recomendaciones: [
                'Aumenta las calorías con alimentos nutritivos, no comida chatarra',
                'Incluye grasas saludables como aceite de oliva y nueces',
                'Come cada 3-4 horas para mantener un flujo constante de nutrientes'
            ]
        },
        'Normal': {
            titulo: 'Plan de Mantenimiento Saludable',
            desayuno: 'Huevos revueltos con espinacas y tostadas integrales',
            almuerzo: 'Ensalada de quinoa con pollo a la parrilla',
            merienda: 'Manzana con mantequilla de almendras',
            cena: 'Pescado al horno con brócoli y batata',
            recomendaciones: [
                'Mantén una dieta variada y colorida',
                'Controla las porciones para mantener tu peso actual',
                'Incluye todos los grupos alimenticios diariamente'
            ]
        },
        'Sobrepeso': {
            titulo: 'Plan para Pérdida de Peso Saludable',
            desayuno: 'Avena con frutas del bosque y semillas de chía',
            almuerzo: 'Ensalada grande con proteína magra y aderezo ligero',
            merienda: 'Yogur natural con pepino y hierbas',
            cena: 'Sopa de verduras con proteína magra',
            recomendaciones: [
                'Reduce el consumo de carbohidratos refinados',
                'Aumenta la ingesta de fibra con vegetales',
                'Controla las calorías pero sin pasar hambre'
            ]
        },
        'Obesidad': {
            titulo: 'Plan Supervisado para Pérdida de Peso',
            desayuno: 'Claras de huevo con espinacas y champiñones',
            almuerzo: 'Pechuga de pollo a la plancha con ensalada verde',
            merienda: 'Palitos de zanahoria y apio con hummus',
            cena: 'Sopa de lentejas con verduras',
            recomendaciones: [
                'Consulta siempre con un profesional de la salud',
                'Comienza con cambios pequeños y sostenibles',
                'Enfócate en la calidad nutricional de los alimentos'
            ]
        }
    };
    
    return planes[categoria] || planes['Normal'];
}

/**
 * Obtener rutina de ejercicio
 */
function obtenerRutinaEjercicio(categoria) {
    const rutinas = {
        'Bajo peso': {
            titulo: 'Rutina para Ganar Masa Muscular',
            frecuencia: '4-5 días por semana',
            cardio: '20 minutos, 2-3 veces por semana',
            fuerza: '3-4 series de 8-12 repeticiones por ejercicio',
            ejercicios: ['Press de banca', 'Sentadillas', 'Peso muerto', 'Dominadas', 'Press militar'],
            recomendaciones: [
                'Enfócate en ejercicios compuestos',
                'Progresivamente aumenta el peso',
                'Descansa 48-72 horas entre grupos musculares'
            ]
        },
        'Normal': {
            titulo: 'Rutina de Mantenimiento y Salud',
            frecuencia: '3-4 días por semana',
            cardio: '30 minutos, 3-4 veces por semana',
            fuerza: '2-3 series de 10-15 repeticiones',
            ejercicios: ['Flexiones', 'Sentadillas', 'Planchas', 'Remo', 'Zancadas'],
            recomendaciones: [
                'Combina cardio y fuerza',
                'Varía tus entrenamientos para evitar la monotonía',
                'Incluye días de descanso activo como caminar o yoga'
            ]
        },
        'Sobrepeso': {
            titulo: 'Rutina para Iniciar la Actividad Física',
            frecuencia: '3-4 días por semana',
            cardio: '30-40 minutos, 3-4 veces por semana',
            fuerza: '2 series de 12-15 repeticiones con peso corporal',
            ejercicios: ['Caminata rápida', 'Sentadillas con silla', 'Flexiones en pared', 'Puente de glúteos'],
            recomendaciones: [
                'Comienza con ejercicios de bajo impacto',
                'Prioriza la constancia sobre la intensidad',
                'Escucha a tu cuerpo y progresa gradualmente'
            ]
        },
        'Obesidad': {
            titulo: 'Rutina Supervisada de Bajo Impacto',
            frecuencia: '3 días por semana',
            cardio: '20-30 minutos, 3 veces por semana',
            fuerza: '1-2 series de 10-12 repeticiones con peso corporal',
            ejercicios: ['Caminata', 'Ejercicios en silla', 'Estiramientos suaves', 'Natación'],
            recomendaciones: [
                'Consulta con un médico antes de comenzar',
                'Empieza con sesiones cortas de 10-15 minutos',
                'Enfócate en la movilidad y flexibilidad'
            ]
        }
    };
    
    return rutinas[categoria] || rutinas['Normal'];
}

/**
 * Posicionar indicador en la barra
 */
function posicionarIndicador(imc) {
    let porcentaje;
    
    if (imc < 16) {
        porcentaje = (imc / 16) * 20;
    } else if (imc < 18.5) {
        porcentaje = 20 + ((imc - 16) / 2.5) * 5;
    } else if (imc < 25) {
        porcentaje = 25 + ((imc - 18.5) / 6.5) * 25;
    } else if (imc < 30) {
        porcentaje = 50 + ((imc - 25) / 5) * 25;
    } else if (imc < 35) {
        porcentaje = 75 + ((imc - 30) / 5) * 15;
    } else if (imc < 40) {
        porcentaje = 90 + ((imc - 35) / 5) * 7;
    } else {
        porcentaje = 97 + Math.min(((imc - 40) / 20) * 3, 3);
    }
    
    currentMarker.style.left = `${Math.min(Math.max(porcentaje, 0), 100)}%`;
}

/**
 * Mostrar resultado
 */
function mostrarResultado(imc, categoria, peso, altura, edad, sexo) {
    // Mostrar valores
    imcValue.textContent = imc.toFixed(1);
    imcCategory.textContent = categoria;
    
    // Actualizar badge de categoría
    const color = obtenerColor(categoria);
    categoryBadge.textContent = categoria;
    categoryBadge.style.backgroundColor = color;
    categoryBadge.style.color = 'white';
    
    categoryText.textContent = `(${obtenerCategoriaDescripcion(categoria)})`;
    
    // Posicionar indicador
    posicionarIndicador(imc);
    
    // Actualizar detalles de salud
    healthStatus.textContent = obtenerEstadoSalud(categoria, imc);
    idealWeight.textContent = calcularPesoIdeal(altura, sexo);
    dailyCalories.textContent = `${calcularCaloriasDiarias(peso, altura, edad, sexo, categoria)} kcal`;
    
    // Mostrar recomendaciones
    const recomendaciones = obtenerRecomendaciones(imc, categoria);
    recommendationText.innerHTML = recomendaciones.map(rec => `<li>${rec}</li>`).join('');
    recommendationText.innerHTML = `<ul>${recommendationText.innerHTML}</ul>`;
    
    // Mostrar sección de resultados
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Obtener descripción de categoría
 */
function obtenerCategoriaDescripcion(categoria) {
    const descripciones = {
        'Bajo peso': 'IMC menor a 18.5',
        'Normal': 'IMC entre 18.5 y 24.9',
        'Sobrepeso': 'IMC entre 25 y 29.9',
        'Obesidad': 'IMC de 30 o mayor'
    };
    return descripciones[categoria] || '';
}

/**
 * Mostrar notificación
 */
function mostrarNotificacion(mensaje, tipo = 'info') {
    notificationText.textContent = mensaje;
    
    // Cambiar color según tipo y tema
    if (currentTheme === 'light') {
        if (tipo === 'error') {
            notification.style.background = 'linear-gradient(135deg, var(--danger), #ff6b6b)';
        } else if (tipo === 'success') {
            notification.style.background = 'linear-gradient(135deg, var(--success), #00cec9)';
        } else if (tipo === 'warning') {
            notification.style.background = 'linear-gradient(135deg, var(--warning), #ff9f43)';
        } else {
            notification.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';
        }
    } else {
        if (tipo === 'error') {
            notification.style.background = 'linear-gradient(135deg, var(--danger), #ff4757)';
        } else if (tipo === 'success') {
            notification.style.background = 'linear-gradient(135deg, var(--success), #0099ff)';
        } else if (tipo === 'warning') {
            notification.style.background = 'linear-gradient(135deg, var(--warning), #fdcb6e)';
        } else {
            notification.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';
        }
    }
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

/**
 * Guardar en historial
 */
function guardarEnHistorial(peso, altura, edad, sexo, imc, categoria) {
    const calculo = {
        id: Date.now(),
        peso,
        altura,
        edad,
        sexo,
        imc: imc.toFixed(1),
        categoria,
        fecha: new Date().toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };
    
    history.unshift(calculo);
    
    // Limitar a 20 registros
    if (history.length > 20) {
        history = history.slice(0, 20);
    }
    
    localStorage.setItem('imcHistory', JSON.stringify(history));
    renderizarHistorial();
    mostrarNotificacion('Cálculo guardado en el historial', 'success');
}

/**
 * Renderizar historial
 */
function renderizarHistorial() {
    if (history.length === 0) {
        historyList.innerHTML = `
            <div class="empty-history">
                <i class="fas fa-history"></i>
                <p>No hay cálculos previos</p>
                <small>Realiza tu primer cálculo para ver el historial</small>
            </div>
        `;
        clearHistoryBtn.style.display = 'none';
        exportBtn.style.display = 'none';
        return;
    }
    
    clearHistoryBtn.style.display = 'block';
    exportBtn.style.display = 'block';
    
    // Calcular estadísticas
    const total = history.length;
    const promedio = history.reduce((sum, item) => sum + parseFloat(item.imc), 0) / total;
    
    totalCalculations.textContent = total;
    averageIMC.textContent = promedio.toFixed(1);
    
    // Renderizar lista
    historyList.innerHTML = history.map(item => {
        const color = obtenerColor(item.categoria);
        return `
            <div class="history-item">
                <div class="history-info">
                    <div class="history-imc">${item.imc}</div>
                    <div class="history-category" style="background-color: ${color}20; color: ${color}">
                        ${item.categoria}
                    </div>
                    <div class="history-date">
                        ${item.peso}kg × ${item.altura}cm | ${item.edad} años | ${item.fecha}
                    </div>
                </div>
                <button class="btn-icon" onclick="eliminarDelHistorial(${item.id})" title="Eliminar">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }).join('');
}

/**
 * Eliminar del historial
 */
function eliminarDelHistorial(id) {
    if (confirm('¿Eliminar este cálculo del historial?')) {
        history = history.filter(item => item.id !== id);
        localStorage.setItem('imcHistory', JSON.stringify(history));
        renderizarHistorial();
        mostrarNotificacion('Cálculo eliminado', 'info');
    }
}

/**
 * Limpiar historial
 */
function limpiarHistorial() {
    if (history.length === 0) return;
    
    if (confirm(`¿Estás seguro de eliminar todo el historial (${history.length} cálculos)?`)) {
        history = [];
        localStorage.removeItem('imcHistory');
        renderizarHistorial();
        mostrarNotificacion('Historial limpiado', 'info');
    }
}

/**
 * Exportar historial
 */
function exportarHistorial() {
    if (history.length === 0) {
        mostrarNotificacion('No hay datos para exportar', 'error');
        return;
    }
    
    const csv = [
        ['Fecha', 'Peso (kg)', 'Altura (cm)', 'Edad', 'Sexo', 'IMC', 'Categoría'],
        ...history.map(item => [
            item.fecha,
            item.peso,
            item.altura,
            item.edad,
            item.sexo,
            item.imc,
            item.categoria
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `historial-imc-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    mostrarNotificacion('Historial exportado como CSV', 'success');
}

/**
 * Validar campo
 */
function validarCampo(input) {
    const value = parseFloat(input.value);
    const min = parseFloat(input.min);
    const max = parseFloat(input.max);
    const errorSpan = input.parentElement.querySelector('.error-message') || 
                     document.getElementById(`${input.id}Error`);
    
    if (!input.value || input.value.trim() === '') {
        if (errorSpan) {
            errorSpan.textContent = 'Este campo es obligatorio';
            errorSpan.style.color = 'var(--danger)';
        }
        input.classList.add('invalid');
        input.classList.remove('valid');
        return false;
    }
    
    if (isNaN(value)) {
        if (errorSpan) {
            errorSpan.textContent = 'Debe ingresar un número válido';
            errorSpan.style.color = 'var(--danger)';
        }
        input.classList.add('invalid');
        input.classList.remove('valid');
        return false;
    }
    
    if (value < min || value > max) {
        if (errorSpan) {
            errorSpan.textContent = `Debe estar entre ${min} y ${max}`;
            errorSpan.style.color = 'var(--warning)';
        }
        input.classList.add('invalid');
        input.classList.remove('valid');
        return false;
    }
    
    // Validaciones específicas
    if (input.id === 'edad' && value > 100) {
        if (errorSpan) {
            errorSpan.textContent = 'Edad muy alta. Verifique los datos.';
            errorSpan.style.color = 'var(--warning)';
        }
        input.classList.add('warning');
        input.classList.remove('valid');
    }
    
    if (errorSpan) errorSpan.textContent = '';
    input.classList.remove('invalid', 'warning');
    input.classList.add('valid');
    return true;
}

/**
 * Resetear formulario
 */
function resetearFormulario() {
    form.reset();
    pesoRange.value = 70;
    alturaRange.value = 170;
    pesoValue.textContent = '70kg';
    alturaValue.textContent = '170cm';
    
    // Limpiar validaciones
    document.querySelectorAll('.error-message').forEach(span => span.textContent = '');
    document.querySelectorAll('input').forEach(input => {
        input.classList.remove('invalid', 'valid', 'warning');
    });
    
    // Ocultar resultados
    resultSection.style.display = 'none';
    
    mostrarNotificacion('Formulario reiniciado', 'info');
}

/**
 * Función para inicializar el tema
 */
function inicializarTema() {
    if (currentTheme === 'light') {
        document.body.classList.add('light-mode');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    } else {
        document.body.classList.remove('light-mode');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
}

/**
 * Función para alternar tema
 */
function alternarTema() {
    if (currentTheme === 'dark') {
        currentTheme = 'light';
        document.body.classList.add('light-mode');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        mostrarNotificacion('Modo claro activado', 'info');
    } else {
        currentTheme = 'dark';
        document.body.classList.remove('light-mode');
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        mostrarNotificacion('Modo oscuro activado', 'info');
    }
    localStorage.setItem('theme', currentTheme);
}

// Event Listeners
function inicializarEventos() {
    // Validación en tiempo real
    pesoInput.addEventListener('input', () => validarCampo(pesoInput));
    alturaInput.addEventListener('input', () => validarCampo(alturaInput));
    edadInput.addEventListener('input', () => validarCampo(edadInput));
    
    // Evento para cambiar tema
    themeToggle.addEventListener('click', alternarTema);
    
    // Manejo del formulario
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Validar todos los campos
        const pesoValido = validarCampo(pesoInput);
        const alturaValida = validarCampo(alturaInput);
        const edadValida = validarCampo(edadInput);
        
        if (!pesoValido || !alturaValida || !edadValida) {
            mostrarNotificacion('Por favor, completa todos los campos correctamente', 'error');
            
            // Hacer scroll al primer error
            const primerError = document.querySelector('.invalid');
            if (primerError) {
                primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                primerError.focus();
            }
            return;
        }
        
        // Obtener valores
        const peso = parseFloat(pesoInput.value);
        const altura = parseFloat(alturaInput.value);
        const edad = parseInt(edadInput.value);
        const sexo = document.querySelector('input[name="sexo"]:checked').value;
        
        // Validación adicional para valores extremos
        if (peso < 30 || peso > 200) {
            mostrarNotificacion('Peso fuera de rango común. Verifica los datos.', 'warning');
        }
        
        if (altura < 100 || altura > 220) {
            mostrarNotificacion('Altura fuera de rango común. Verifica los datos.', 'warning');
        }
        
        if (edad < 10 || edad > 100) {
            mostrarNotificacion('Edad fuera de rango común. Verifica los datos.', 'warning');
        }
        
        // Calcular IMC
        const imc = calcularIMC(peso, altura);
        const categoria = obtenerCategoria(imc);
        
        // Mostrar resultado
        mostrarResultado(imc, categoria, peso, altura, edad, sexo);
        
        // Guardar en historial
        guardarEnHistorial(peso, altura, edad, sexo, imc, categoria);
        
        // Feedback táctil para móviles
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    });
    
    // Botón reset
    resetBtn.addEventListener('click', resetearFormulario);
    
    // Botones del historial
    clearHistoryBtn.addEventListener('click', limpiarHistorial);
    exportBtn.addEventListener('click', exportarHistorial);
    
    // Botones de recomendaciones
    dietBtn.addEventListener('click', () => {
        if (history.length === 0) {
            mostrarNotificacion('Primero calcula tu IMC para obtener recomendaciones', 'error');
            return;
        }
        
        const ultimoCalculo = history[0];
        const plan = obtenerPlanAlimenticio(ultimoCalculo.categoria);
        
        dietContent.innerHTML = `
            <h4>${plan.titulo}</h4>
            <div class="meal-plan">
                <div class="meal-item">
                    <strong>Desayuno:</strong>
                    <p>${plan.desayuno}</p>
                </div>
                <div class="meal-item">
                    <strong>Almuerzo:</strong>
                    <p>${plan.almuerzo}</p>
                </div>
                <div class="meal-item">
                    <strong>Merienda:</strong>
                    <p>${plan.merienda}</p>
                </div>
                <div class="meal-item">
                    <strong>Cena:</strong>
                    <p>${plan.cena}</p>
                </div>
            </div>
            <div class="recommendations-list">
                <h5>Recomendaciones:</h5>
                <ul>
                    ${plan.recomendaciones.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
            <p class="disclaimer"><strong>Nota:</strong> Este es un plan sugerido. Consulta con un nutricionista para un plan personalizado.</p>
        `;
        
        dietModal.classList.add('active');
    });
    
    exerciseBtn.addEventListener('click', () => {
        if (history.length === 0) {
            mostrarNotificacion('Primero calcula tu IMC para obtener recomendaciones', 'error');
            return;
        }
        
        const ultimoCalculo = history[0];
        const rutina = obtenerRutinaEjercicio(ultimoCalculo.categoria);
        
        exerciseContent.innerHTML = `
            <h4>${rutina.titulo}</h4>
            <div class="exercise-details">
                <div class="detail-row">
                    <strong>Frecuencia:</strong>
                    <span>${rutina.frecuencia}</span>
                </div>
                <div class="detail-row">
                    <strong>Cardio:</strong>
                    <span>${rutina.cardio}</span>
                </div>
                <div class="detail-row">
                    <strong>Entrenamiento de fuerza:</strong>
                    <span>${rutina.fuerza}</span>
                </div>
            </div>
            <div class="exercise-list">
                <h5>Ejercicios recomendados:</h5>
                <ul>
                    ${rutina.ejercicios.map(ej => `<li>${ej}</li>`).join('')}
                </ul>
            </div>
            <div class="recommendations-list">
                <h5>Recomendaciones:</h5>
                <ul>
                    ${rutina.recomendaciones.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
            <p class="disclaimer"><strong>Nota:</strong> Consulta con un médico antes de comenzar cualquier rutina de ejercicio.</p>
        `;
        
        exerciseModal.classList.add('active');
    });
    
    // Cerrar modales
    closeDietModal.addEventListener('click', () => {
        dietModal.classList.remove('active');
    });
    
    closeExerciseModal.addEventListener('click', () => {
        exerciseModal.classList.remove('active');
    });
    
    // Cerrar modales al hacer clic fuera
    dietModal.querySelector('.modal-overlay').addEventListener('click', () => {
        dietModal.classList.remove('active');
    });
    
    exerciseModal.querySelector('.modal-overlay').addEventListener('click', () => {
        exerciseModal.classList.remove('active');
    });
    
    // ESC para cerrar modales
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            dietModal.classList.remove('active');
            exerciseModal.classList.remove('active');
        }
    });
}

// Inicializar aplicación
function inicializar() {
    syncInputs();
    inicializarTema(); // Inicializar tema primero
    inicializarEventos();
    renderizarHistorial();
    
    // Detectar tema del sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches && !localStorage.getItem('theme')) {
        currentTheme = 'light';
        inicializarTema();
    }
    
    mostrarNotificacion('IMC Pro - Calculadora lista para usar', 'info');
}

// Iniciar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', inicializar);

// Detectar cambios en el tema del sistema
if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
    mediaQuery.addEventListener('change', e => {
        if (!localStorage.getItem('theme')) { // Solo si no hay preferencia guardada
            currentTheme = e.matches ? 'light' : 'dark';
            inicializarTema();
            mostrarNotificacion(`Tema del sistema detectado: ${currentTheme === 'light' ? 'claro' : 'oscuro'}`, 'info');
        }
    });
}

// Hacer las funciones accesibles globalmente para eventos en línea
window.eliminarDelHistorial = eliminarDelHistorial;
