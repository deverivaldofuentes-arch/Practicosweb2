const form = document.getElementById('registrationForm');
const inputs = form.querySelectorAll('input');
const togglePasswordBtn = document.getElementById('togglePassword');
const toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');
const notification = document.getElementById('notification');
const notificationText = notification.querySelector('.notification-text');
const notificationClose = notification.querySelector('.notification-close');

// Mensajes de error personalizados
const errorMessages = {
    username: {
        valueMissing: 'El nombre de usuario es obligatorio',
        tooShort: 'El nombre debe tener al menos 3 caracteres'
    },
    email: {
        valueMissing: 'El correo electrónico es obligatorio',
        typeMismatch: 'Ingresa un correo electrónico válido (ejemplo@correo.com)'
    },
    password: {
        valueMissing: 'La contraseña es obligatoria',
        tooShort: 'La contraseña debe tener al menos 8 caracteres'
    },
    confirmPassword: {
        valueMissing: 'Confirma tu contraseña',
        mismatch: 'Las contraseñas no coinciden'
    },
    phone: {
        patternMismatch: 'Ingresa un número de 10 dígitos (opcional)'
    },
    terms: {
        valueMissing: 'Debes aceptar los términos y condiciones'
    }
};

// Mostrar notificación
function showNotification(message, isError = false) {
    notificationText.textContent = message;
    notification.classList.remove('error');
    
    if (isError) {
        notification.classList.add('error');
    }
    
    notification.classList.add('show');
    
    // Ocultar automáticamente después de 5 segundos
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// Cerrar notificación
notificationClose.addEventListener('click', () => {
    notification.classList.remove('show');
});

// Alternar visibilidad de contraseña
function togglePasswordVisibility(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

togglePasswordBtn.addEventListener('click', () => togglePasswordVisibility('password', togglePasswordBtn));
toggleConfirmPasswordBtn.addEventListener('click', () => togglePasswordVisibility('confirmPassword', toggleConfirmPasswordBtn));

// Validación en tiempo real
inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
        if (input.classList.contains('invalid')) {
            validateField(input);
        }
        if (input.id === 'password') {
            checkPasswordStrength(input.value);
        }
        // Validar confirmación de contraseña cuando se escribe en password
        if (input.id === 'password') {
            const confirmPassword = document.getElementById('confirmPassword');
            if (confirmPassword.value) {
                validateField(confirmPassword);
            }
        }
    });
});

function validateField(input) {
    const formGroup = input.closest('.form-group');
    const errorElement = formGroup.querySelector('.error-message');
    
    // Casos especiales
    if (input.id === 'confirmPassword') {
        const password = document.getElementById('password').value;
        if (input.value !== password) {
            showError(formGroup, errorElement, errorMessages.confirmPassword.mismatch);
            return false;
        }
    }
    
    // Para el checkbox de términos
    if (input.id === 'terms') {
        if (!input.checked) {
            showError(formGroup, errorElement, errorMessages.terms.valueMissing);
            return false;
        } else {
            showSuccess(formGroup, errorElement);
            return true;
        }
    }
    
    // Validación estándar HTML5 (excepto para campos opcionales vacíos)
    if (input.hasAttribute('required') || (input.value && !input.checkValidity())) {
        if (!input.checkValidity()) {
            const errorType = getErrorType(input.validity);
            const message = errorMessages[input.name]?.[errorType] || 'Campo inválido';
            showError(formGroup, errorElement, message);
            return false;
        }
    }
    
    showSuccess(formGroup, errorElement);
    return true;
}

function getErrorType(validity) {
    if (validity.valueMissing) return 'valueMissing';
    if (validity.typeMismatch) return 'typeMismatch';
    if (validity.tooShort) return 'tooShort';
    if (validity.patternMismatch) return 'patternMismatch';
    if (validity.tooLong) return 'tooLong';
    return 'invalid';
}

function showError(formGroup, errorElement, message) {
    formGroup.classList.add('error');
    formGroup.classList.remove('valid');
    
    const input = formGroup.querySelector('input');
    if (input) {
        input.classList.add('invalid');
        input.classList.remove('valid');
    }
    
    errorElement.textContent = message;
    
    // Enfocar el primer campo con error
    if (!form.querySelector('.error:first-child')) {
        formGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function showSuccess(formGroup, errorElement) {
    formGroup.classList.remove('error');
    formGroup.classList.add('valid');
    
    const input = formGroup.querySelector('input');
    if (input) {
        input.classList.remove('invalid');
        input.classList.add('valid');
    }
    
    errorElement.textContent = '';
}

function checkPasswordStrength(password) {
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text');
    
    if (!password) {
        strengthBar.className = 'strength-bar';
        strengthText.textContent = 'Seguridad de la contraseña';
        return;
    }
    
    let strength = 0;
    const feedback = [];
    
    // Criterios de fortaleza
    if (password.length >= 8) {
        strength++;
    } else {
        feedback.push('Mínimo 8 caracteres');
    }
    
    if (password.match(/[a-z]/)) strength++;
    else feedback.push('una minúscula');
    
    if (password.match(/[A-Z]/)) strength++;
    else feedback.push('una mayúscula');
    
    if (password.match(/[0-9]/)) strength++;
    else feedback.push('un número');
    
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    else feedback.push('un carácter especial');
    
    // Actualizar visualización
    strengthBar.className = 'strength-bar';
    
    let strengthMessage = '';
    if (strength <= 2) {
        strengthBar.classList.add('weak');
        strengthMessage = 'Débil';
    } else if (strength <= 4) {
        strengthBar.classList.add('medium');
        strengthMessage = 'Media';
    } else {
        strengthBar.classList.add('strong');
        strengthMessage = 'Fuerte';
    }
    
    // Mostrar retroalimentación
    if (feedback.length > 0 && strength < 5) {
        strengthText.textContent = `${strengthMessage} - Agrega: ${feedback.slice(0, 2).join(', ')}`;
    } else {
        strengthText.textContent = `${strengthMessage} - ¡Excelente contraseña!`;
    }
}

// Manejo del submit
form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    let isValid = true;
    let firstErrorField = null;
    
    // Validar todos los campos
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
            if (!firstErrorField) {
                firstErrorField = input;
            }
        }
    });
    
    if (isValid) {
        // Obtener datos del formulario
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // No incluir confirmPassword en los datos enviados
        delete data.confirmPassword;
        
        console.log('Formulario válido:', data);
        showNotification('¡Registro exitoso! Tu cuenta ha sido creada.', false);
        
        // Simular envío al servidor
        setTimeout(() => {
            // Aquí normalmente enviarías los datos al servidor
            // fetch('/api/register', { method: 'POST', body: JSON.stringify(data) })
            
            // Resetear formulario después de éxito
            form.reset();
            
            // Remover clases de validación
            document.querySelectorAll('.form-group').forEach(group => {
                group.classList.remove('valid', 'error');
                const input = group.querySelector('input');
                if (input) {
                    input.classList.remove('valid', 'invalid');
                }
            });
            
            // Resetear barra de fortaleza
            const strengthBar = document.querySelector('.strength-bar');
            const strengthText = document.querySelector('.strength-text');
            strengthBar.className = 'strength-bar';
            strengthText.textContent = 'Seguridad de la contraseña';
        }, 1500);
    } else {
        showNotification('Por favor, corrige los errores en el formulario', true);
        
        // Enfocar el primer campo con error
        if (firstErrorField) {
            firstErrorField.focus();
            firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
});

// Botones de redes sociales (solo visual)
document.querySelectorAll('.social-btn').forEach(button => {
    button.addEventListener('click', () => {
        showNotification(`Función de registro con ${button.textContent.trim()} en desarrollo`, false);
    });
});

// Enlace de términos
document.querySelector('.terms-link').addEventListener('click', (e) => {
    e.preventDefault();
    showNotification('Los términos y condiciones se mostrarían aquí', false);
});

// Enlace de inicio de sesión
document.querySelector('.login-link-a').addEventListener('click', (e) => {
    e.preventDefault();
    showNotification('Redirigiendo a la página de inicio de sesión', false);
});

// Validación inicial al cargar (para mostrar estados)
window.addEventListener('DOMContentLoaded', () => {
    // Inicializar barra de fortaleza
    checkPasswordStrength('');
});
