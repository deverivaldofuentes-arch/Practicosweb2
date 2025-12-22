// Estado del formulario
let currentStep = 1;
const totalSteps = 4;
const formData = {};

// Elementos del DOM
const form = document.getElementById('wizardForm');
const steps = document.querySelectorAll('.form-step');
const progressSteps = document.querySelectorAll('.progress-step');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const successModal = document.getElementById('successModal');

/**
 * Mostrar paso específico
 */
function showStep(step) {
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
        if (index + 1 < step) {
            s.classList.add('completed');
        } else {
            s.classList.remove('completed');
        }
    });
    
    // Mostrar/ocultar botones
    prevBtn.style.display = step === 1 ? 'none' : 'inline-block';
    nextBtn.style.display = step === totalSteps ? 'none' : 'inline-block';
    submitBtn.style.display = step === totalSteps ? 'inline-block' : 'none';
    
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
    const inputs = currentStepElement.querySelectorAll('input:not([type="checkbox"]), select, textarea');
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
                errorMessage.textContent = 'Formato inválido';
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
            errorMessage.textContent = 'Debes aceptar los términos';
            formGroup.classList.add('error');
            isValid = false;
        }
    }
    
    return isValid;
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
            }
        } else if (input.type === 'checkbox') {
            formData[input.name] = input.checked;
        } else if (input.value) {
            formData[input.name] = input.value;
        }
    });
    
    // Guardar en localStorage
    localStorage.setItem('wizardFormData', JSON.stringify(formData));
}

/**
 * Mostrar resumen
 */
function showSummary() {
    const personalHTML = `
        <p><strong>Nombre:</strong> ${formData.firstName} ${formData.lastName}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Teléfono:</strong> ${formData.phone}</p>
    `;
    
    const addressHTML = `
        <p><strong>Dirección:</strong> ${formData.street}</p>
        <p><strong>Ciudad:</strong> ${formData.city}</p>
        <p><strong>Código Postal:</strong> ${formData.zipCode}</p>
        <p><strong>País:</strong> ${formData.country}</p>
    `;
    
    const preferencesHTML = `
        <p><strong>Intereses:</strong> ${formData.interests?.join(', ') || 'Ninguno'}</p>
        <p><strong>Newsletter:</strong> ${formData.newsletter ? 'Sí' : 'No'}</p>
        ${formData.comments ? `<p><strong>Comentarios:</strong> ${formData.comments}</p>` : ''}
    `;
    
    document.getElementById('summaryPersonal').innerHTML = personalHTML;
    document.getElementById('summaryAddress').innerHTML = addressHTML;
    document.getElementById('summaryPreferences').innerHTML = preferencesHTML;
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
                }
            }
        });
    }
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

form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (validateCurrentStep()) {
        saveStepData();
        console.log('Datos finales:', formData);
        successModal.classList.add('active');
        localStorage.removeItem('wizardFormData');
    }
});

// Inicializar
loadSavedData();
showStep(currentStep);
