// Estado del formulario
let currentStep = 1;
const totalSteps = 4;
const formData = {};
const visitedSteps = new Set([1]);

// Elementos del DOM
const form = document.getElementById('wizardForm');
const steps = document.querySelectorAll('.form-step');
const progressSteps = document.querySelectorAll('.progress-step');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const skipBtn = document.getElementById('skipBtn');
const successModal = document.getElementById('successModal');
const loader = document.getElementById('loader');
const progressFill = document.getElementById('progressFill');
const progressFillFooter = document.getElementById('progressFillFooter');
const progressPercentage = document.getElementById('progressPercentage');
const completedSteps = document.getElementById('completedSteps');
const totalStepsDisplay = document.getElementById('totalSteps');
const currentStepDisplay = document.getElementById('currentStepDisplay');
const charCount = document.getElementById('charCount');
const userEmail = document.getElementById('userEmail');
const modalSummary = document.getElementById('modalSummary');

// Inicializar
totalStepsDisplay.textContent = totalSteps;
completedSteps.textContent = visitedSteps.size;

/**
 * Mostrar paso específico
 */
function showStep(step) {
    // Actualizar paso actual
    currentStep = step;
    visitedSteps.add(step);
    
    // Actualizar indicadores de paso
    currentStepDisplay.textContent = step;
    completedSteps.textContent = visitedSteps.size;
    
    // Ocultar todos los pasos
    steps.forEach((s, index) => {
        s.classList.remove('active');
        if (index + 1 === step) {
            s.classList.add('active');
        }
    });
    
    // Actualizar barra de progreso
    progressSteps.forEach((s, index) => {
        s.classList.remove('active');
        if (index + 1 === step) {
            s.classList.add('active');
        }
        if (visitedSteps.has(index + 1)) {
            s.classList.add('completed');
        } else {
            s.classList.remove('completed');
        }
    });
    
    // Actualizar barras de progreso
    const progress = ((step - 1) / (totalSteps - 1)) * 100;
    progressFill.style.width = `${progress}%`;
    progressFillFooter.style.width = `${progress}%`;
    progressPercentage.textContent = `${Math.round(progress)}%`;
    
    // Mostrar/ocultar botones
    prevBtn.style.display = step === 1 ? 'none' : 'inline-flex';
    nextBtn.style.display = step === totalSteps ? 'none' : 'inline-flex';
    submitBtn.style.display = step === totalSteps ? 'inline-flex' : 'none';
    skipBtn.style.display = step === 3 ? 'inline-flex' : 'none';
    
    // Actualizar título de la página
    const stepTitles = [
        'Datos Personales',
        'Dirección',
        'Preferencias',
        'Confirmación'
    ];
    document.title = `Paso ${step}: ${stepTitles[step-1]} - Formulario Multi-paso`;
    
    // Si estamos en el último paso, mostrar resumen
    if (step === totalSteps) {
        showSummary();
    }
}

/**
 * Validar paso actual
 */
function validateCurrentStep() {
    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const inputs = currentStepElement.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]), select, textarea');
    let isValid = true;
    
    inputs.forEach(input => {
        const formGroup = input.closest('.form-group');
        const errorMessage = formGroup?.querySelector('.error-message');
        
        if (errorMessage) {
            errorMessage.textContent = '';
            formGroup.classList.remove('error');
        }
        
        input.classList.remove('valid', 'invalid');
        
        if (input.hasAttribute('required') && !input.value.trim()) {
            if (errorMessage) {
                errorMessage.textContent = 'Este campo es obligatorio';
                formGroup.classList.add('error');
            }
            input.classList.add('invalid');
            isValid = false;
        } else if (input.type === 'email' && input.value && !isValidEmail(input.value)) {
            if (errorMessage) {
                errorMessage.textContent = 'Email inválido';
                formGroup.classList.add('error');
            }
            input.classList.add('invalid');
            isValid = false;
        } else if (input.pattern && input.value && !new RegExp(input.pattern).test(input.value)) {
            if (errorMessage) {
                errorMessage.textContent = input.id === 'phone' ? 'Teléfono inválido (10 dígitos)' : 'Formato inválido';
                formGroup.classList.add('error');
            }
            input.classList.add('invalid');
            isValid = false;
        } else if (input.value) {
            input.classList.add('valid');
        }
    });
    
    // Validar checkboxes de intereses en paso 3
    if (currentStep === 3) {
        const interests = currentStepElement.querySelectorAll('input[name="interests"]:checked');
        const interestsGroup = currentStepElement.querySelector('.checkbox-group').closest('.form-group');
        const errorMessage = interestsGroup.querySelector('.error-message');
        
        if (interests.length === 0) {
            errorMessage.textContent = 'Selecciona al menos un interés';
            interestsGroup.classList.add('error');
            isValid = false;
        } else {
            errorMessage.textContent = '';
            interestsGroup.classList.remove('error');
        }
    }
    
    // Validar términos en paso 4  
    if (currentStep === 4) {
        const terms = document.getElementById('terms');
        const formGroup = terms.closest('.form-group');
        const errorMessage = formGroup.querySelector('.error-message');
        
        if (!terms.checked) {
            errorMessage.textContent = 'Debes aceptar los términos y condiciones';
            formGroup.classList.add('error');
            isValid = false;
        } else {
            errorMessage.textContent = '';
            formGroup.classList.remove('error');
        }
    }
    
    return isValid;
}

/**
 * Validar campo individual en tiempo real
 */
function validateField(field) {
    const formGroup = field.closest('.form-group');
    const errorMessage = formGroup?.querySelector('.error-message');
    
    if (errorMessage) {
        errorMessage.textContent = '';
        formGroup.classList.remove('error');
    }
    
    field.classList.remove('valid', 'invalid');
    
    if (field.hasAttribute('required') && !field.value.trim()) {
        if (errorMessage) {
            errorMessage.textContent = 'Este campo es obligatorio';
            formGroup.classList.add('error');
        }
        field.classList.add('invalid');
        return false;
    } else if (field.type === 'email' && field.value && !isValidEmail(field.value)) {
        if (errorMessage) {
            errorMessage.textContent = 'Email inválido';
            formGroup.classList.add('error');
        }
        field.classList.add('invalid');
        return false;
    } else if (field.pattern && field.value && !new RegExp(field.pattern).test(field.value)) {
        if (errorMessage) {
            errorMessage.textContent = field.id === 'phone' ? 'Teléfono inválido (10 dígitos)' : 
                                     field.id === 'zipCode' ? 'Código postal inválido (5 dígitos)' : 
                                     'Formato inválido';
            formGroup.classList.add('error');
        }
        field.classList.add('invalid');
        return false;
    } else if (field.value) {
        field.classList.add('valid');
        return true;
    }
    
    return true;
}

/**
 * Guardar datos del paso actual
 */
function saveStepData() {
    const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
    const inputs = currentStepElement.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (input.type === 'checkbox' && input.name === 'interests') {
            if (!formData.interests) formData.interests = [];
            if (input.checked && !formData.interests.includes(input.value)) {
                formData.interests.push(input.value);
            } else if (!input.checked) {
                const index = formData.interests.indexOf(input.value);
                if (index > -1) {
                    formData.interests.splice(index, 1);
                }
            }
        } else if (input.type === 'checkbox' && input.name !== 'interests') {
            formData[input.name] = input.checked;
        } else if (input.value) {
            formData[input.name] = input.value;
        } else if (input.hasAttribute('required')) {
            // Mantener valores vacíos para campos requeridos
            formData[input.name] = '';
        }
    });
    
    // Guardar en localStorage
    localStorage.setItem('wizardFormData', JSON.stringify(formData));
}

/**
 * Mostrar resumen
 */
function showSummary() {
    // Datos personales
    const personalHTML = `
        <div class="summary-item">
            <div class="summary-label">Nombre:</div>
            <div class="summary-value">${formData.firstName || ''} ${formData.lastName || ''}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">Email:</div>
            <div class="summary-value">${formData.email || ''}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">Teléfono:</div>
            <div class="summary-value">${formData.phone || ''}</div>
        </div>
    `;
    
    // Dirección
    const addressHTML = `
        <div class="summary-item">
            <div class="summary-label">Dirección:</div>
            <div class="summary-value">${formData.street || ''}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">Ciudad:</div>
            <div class="summary-value">${formData.city || ''}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">Código Postal:</div>
            <div class="summary-value">${formData.zipCode || ''}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">País:</div>
            <div class="summary-value">${getCountryName(formData.country) || ''}</div>
        </div>
    `;
    
    // Preferencias
    const interestsMap = {
        'tecnologia': 'Tecnología',
        'deportes': 'Deportes',
        'musica': 'Música',
        'viajes': 'Viajes'
    };
    
    const interestsDisplay = formData.interests ? 
        formData.interests.map(interest => interestsMap[interest] || interest).join(', ') : 
        'Ninguno seleccionado';
    
    const preferencesHTML = `
        <div class="summary-item">
            <div class="summary-label">Intereses:</div>
            <div class="summary-value">${interestsDisplay}</div>
        </div>
        <div class="summary-item">
            <div class="summary-label">Newsletter:</div>
            <div class="summary-value">${formData.newsletter ? 'Sí' : 'No'}</div>
        </div>
        ${formData.comments ? `
        <div class="summary-item">
            <div class="summary-label">Comentarios:</div>
            <div class="summary-value">${formData.comments.substring(0, 100)}${formData.comments.length > 100 ? '...' : ''}</div>
        </div>` : ''}
    `;
    
    document.getElementById('summaryPersonal').innerHTML = personalHTML;
    document.getElementById('summaryAddress').innerHTML = addressHTML;
    document.getElementById('summaryPreferences').innerHTML = preferencesHTML;
}

/**
 * Mostrar resumen en modal
 */
function showModalSummary() {
    const interestsMap = {
        'tecnologia': 'Tecnología',
        'deportes': 'Deportes',
        'musica': 'Música',
        'viajes': 'Viajes'
    };
    
    const interestsDisplay = formData.interests ? 
        formData.interests.map(interest => interestsMap[interest] || interest).join(', ') : 
        'Ninguno';
    
    const modalHTML = `
        <div class="summary-item">
            <strong>Nombre completo:</strong> ${formData.firstName || ''} ${formData.lastName || ''}
        </div>
        <div class="summary-item">
            <strong>Email:</strong> ${formData.email || ''}
        </div>
        <div class="summary-item">
            <strong>Teléfono:</strong> ${formData.phone || ''}
        </div>
        <div class="summary-item">
            <strong>Dirección:</strong> ${formData.street || ''}, ${formData.city || ''}
        </div>
        <div class="summary-item">
            <strong>Intereses:</strong> ${interestsDisplay}
        </div>
    `;
    
    modalSummary.innerHTML = modalHTML;
    userEmail.textContent = formData.email || '';
}

/**
 * Obtener nombre del país
 */
function getCountryName(code) {
    const countries = {
        'mx': 'México',
        'es': 'España',
        'ar': 'Argentina',
        'co': 'Colombia',
        'us': 'Estados Unidos',
        'otro': 'Otro'
    };
    return countries[code] || code;
}

/**
 * Validar email
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Cargar datos guardados
 */
function loadSavedData() {
    const saved = localStorage.getItem('wizardFormData');
    if (saved) {
        const data = JSON.parse(saved);
        Object.assign(formData, data);
        
        // Rellenar campos
        Object.keys(data).forEach(key => {
            const input = document.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox' && key !== 'interests') {
                    input.checked = data[key];
                } else if (key === 'interests') {
                    data[key].forEach(value => {
                        const checkbox = document.querySelector(`input[name="interests"][value="${value}"]`);
                        if (checkbox) checkbox.checked = true;
                    });
                } else {
                    input.value = data[key];
                    // Validar campos cargados
                    validateField(input);
                }
            }
        });
        
        // Actualizar contador de caracteres
        const comments = document.getElementById('comments');
        if (comments && comments.value) {
            charCount.textContent = comments.value.length;
        }
        
        // Marcar pasos visitados basados en datos cargados
        if (data.firstName || data.lastName || data.email || data.phone) {
            visitedSteps.add(1);
        }
        if (data.street || data.city || data.zipCode || data.country) {
            visitedSteps.add(2);
        }
        if (data.interests || data.newsletter || data.comments) {
            visitedSteps.add(3);
        }
        
        completedSteps.textContent = visitedSteps.size;
    }
}

/**
 * Cerrar modal
 */
function closeModal() {
    successModal.style.display = 'none';
}

/**
 * Mostrar loader
 */
function showLoader() {
    loader.style.display = 'flex';
}

/**
 * Ocultar loader
 */
function hideLoader() {
    loader.style.display = 'none';
}

// Event listeners
nextBtn.addEventListener('click', () => {
    if (validateCurrentStep()) {
        saveStepData();
        currentStep++;
        showStep(currentStep);
    }
});

prevBtn.addEventListener('click', () => {
    currentStep--;
    showStep(currentStep);
});

skipBtn.addEventListener('click', () => {
    // No validamos, solo avanzamos
    saveStepData();
    currentStep++;
    showStep(currentStep);
});

// Navegación por clic en los pasos de progreso
progressSteps.forEach(step => {
    step.addEventListener('click', () => {
        const stepNumber = parseInt(step.getAttribute('data-step'));
        if (visitedSteps.has(stepNumber)) {
            currentStep = stepNumber;
            showStep(currentStep);
        }
    });
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (validateCurrentStep()) {
        saveStepData();
        
        // Mostrar loader
        showLoader();
        
        // Simular envío al servidor
        setTimeout(() => {
            hideLoader();
            
            // Mostrar resumen en modal
            showModalSummary();
            
            // Mostrar modal de éxito
            successModal.style.display = 'flex';
            
            // Limpiar localStorage
            localStorage.removeItem('wizardFormData');
            
            // Registrar datos en consola
            console.log('Datos del formulario enviados:', formData);
        }, 1500);
    }
});

// Validación en tiempo real
document.querySelectorAll('input, select, textarea').forEach(field => {
    if (field.type !== 'checkbox' && field.type !== 'radio') {
        field.addEventListener('blur', () => {
            validateField(field);
            saveStepData();
        });
        
        field.addEventListener('input', () => {
            // Validación inmediata para campos con patrón
            if (field.pattern) {
                validateField(field);
            }
            
            // Contador de caracteres para textarea
            if (field.id === 'comments') {
                charCount.textContent = field.value.length;
            }
            
            saveStepData();
        });
    }
});

// Checkboxes - guardar datos al cambiar
document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        saveStepData();
    });
});

// Inicializar
loadSavedData();
showStep(currentStep);

// Añadir efecto de "shake" a los campos con error
const originalAddError = DOMTokenList.prototype.add;
DOMTokenList.prototype.add = function(...tokens) {
    originalAddError.apply(this, tokens);
    
    if (this.contains('error') && this._element) {
        this._element.style.animation = 'none';
        setTimeout(() => {
            this._element.style.animation = 'shake 0.5s ease';
        }, 10);
        
        setTimeout(() => {
            this._element.style.animation = '';
        }, 500);
    }
};

// Aplicar elemento a los grupos de formulario
document.querySelectorAll('.form-group').forEach(group => {
    group.classList._element = group;
});

// Añadir animación shake
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);
