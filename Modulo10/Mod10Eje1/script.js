class FormValidator {
    constructor() {
        this.form = document.getElementById('registrationForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.notification = document.getElementById('notification');
        this.notificationText = this.notification.querySelector('.notification-text');
        this.notificationClose = this.notification.querySelector('.notification-close');
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupPasswordToggle();
        this.setupNotification();
    }
    
    setupEventListeners() {
        // Real-time validation on blur
        this.form.querySelectorAll('input').forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.handleInput(input));
        });
        
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Terms links
        document.querySelectorAll('.terms-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showNotification('Términos y condiciones se abrirán en una nueva ventana', 'info');
            });
        });
        
        // Login link
        document.querySelector('.login-link-a').addEventListener('click', (e) => {
            e.preventDefault();
            this.showNotification('Redirigiendo a la página de inicio de sesión', 'info');
        });
    }
    
    setupPasswordToggle() {
        const togglePassword = (inputId, button) => {
            const input = document.getElementById(inputId);
            const icon = button.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
                button.setAttribute('aria-label', 'Ocultar contraseña');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
                button.setAttribute('aria-label', 'Mostrar contraseña');
            }
        };
        
        document.getElementById('togglePassword').addEventListener('click', (e) => {
            togglePassword('password', e.currentTarget);
        });
        
        document.getElementById('toggleConfirmPassword').addEventListener('click', (e) => {
            togglePassword('confirmPassword', e.currentTarget);
        });
    }
    
    setupNotification() {
        this.notificationClose.addEventListener('click', () => {
            this.notification.classList.remove('show');
        });
        
        // Auto-hide notification after 5 seconds
        this.notification.addEventListener('animationend', (e) => {
            if (e.animationName === 'fadeIn') {
                setTimeout(() => {
                    this.notification.classList.remove('show');
                }, 5000);
            }
        });
    }
    
    handleInput(input) {
        // Clear error state when user starts typing
        if (input.classList.contains('invalid')) {
            this.validateField(input);
        }
        
        // Password strength check
        if (input.id === 'password') {
            this.checkPasswordStrength(input.value);
        }
        
        // Confirm password validation when password changes
        if (input.id === 'password' || input.id === 'confirmPassword') {
            const confirmPassword = document.getElementById('confirmPassword');
            if (confirmPassword.value) {
                this.validateField(confirmPassword);
            }
        }
        
        // Phone number formatting
        if (input.id === 'phone') {
            this.formatPhoneNumber(input);
        }
    }
    
    formatPhoneNumber(input) {
        // Remove all non-digit characters
        let value = input.value.replace(/\D/g, '');
        
        // Format based on length
        if (value.length <= 4) {
            input.value = value;
        } else if (value.length === 8) {
            // Format as XXXX XXXX for 8 digits
            input.value = `${value.slice(0, 4)} ${value.slice(4, 8)}`;
        } else if (value.length === 9) {
            // Format as XXX XXX XXX for 9 digits
            input.value = `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6, 9)}`;
        } else if (value.length === 10) {
            // Format as XXX XXX XXXX for 10 digits
            input.value = `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6, 10)}`;
        } else {
            // If more than 10 digits, truncate to 10
            input.value = `${value.slice(0, 3)} ${value.slice(3, 6)} ${value.slice(6, 10)}`;
        }
    }
    
    validateField(input) {
        const formGroup = input.closest('.form-group');
        const errorElement = formGroup.querySelector('.error-message');
        
        // Clear previous states
        formGroup.classList.remove('error', 'valid');
        input.classList.remove('invalid', 'valid');
        
        // Skip validation for optional empty fields
        if (!input.hasAttribute('required') && !input.value && input.id !== 'phone') {
            return true;
        }
        
        let isValid = true;
        let errorMessage = '';
        
        // Special validations
        switch (input.id) {
            case 'firstName':
            case 'lastName':
                isValid = input.value.length >= 2;
                if (!isValid) errorMessage = 'Debe tener al menos 2 caracteres';
                break;
                
            case 'username':
                isValid = this.validateUsername(input.value);
                if (!isValid) errorMessage = 'Usuario inválido (3-20 caracteres, solo letras, números y _)';
                break;
                
            case 'email':
                isValid = this.validateEmail(input.value);
                if (!isValid) errorMessage = 'Por favor ingresa un correo electrónico válido';
                break;
                
            case 'password':
                isValid = this.validatePassword(input.value);
                if (!isValid) errorMessage = 'La contraseña no cumple con los requisitos de seguridad';
                break;
                
            case 'confirmPassword':
                const password = document.getElementById('password').value;
                isValid = input.value === password;
                if (!isValid) errorMessage = 'Las contraseñas no coinciden';
                break;
                
            case 'phone':
                if (input.value) {
                    // Remove spaces for validation
                    const phoneDigits = input.value.replace(/\s/g, '');
                    isValid = /^[0-9]{8,10}$/.test(phoneDigits);  // Cambiado de 9-10 a 8-10
                    if (!isValid) errorMessage = 'Ingresa un número de teléfono válido (8-10 dígitos)';
                }
                break;
                
            case 'terms':
                isValid = input.checked;
                if (!isValid) errorMessage = 'Debes aceptar los términos y condiciones';
                break;
                
            default:
                // Basic HTML5 validation
                isValid = input.checkValidity();
                if (!isValid) {
                    errorMessage = this.getValidationMessage(input);
                }
        }
        
        // Update UI
        if (isValid) {
            formGroup.classList.add('valid');
            input.classList.add('valid');
            errorElement.textContent = '';
        } else {
            formGroup.classList.add('error');
            input.classList.add('invalid');
            errorElement.textContent = errorMessage;
        }
        
        return isValid;
    }
    
    validateUsername(username) {
        return /^[a-zA-Z0-9_]{3,20}$/.test(username);
    }
    
    validateEmail(email) {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    }
    
    validatePassword(password) {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[@$!%*?&]/.test(password)
        };
        
        // Update password requirements UI
        Object.keys(requirements).forEach(rule => {
            const li = document.querySelector(`[data-rule="${rule}"]`);
            if (li) {
                li.classList.toggle('valid', requirements[rule]);
            }
        });
        
        return Object.values(requirements).every(req => req);
    }
    
    checkPasswordStrength(password) {
        if (!password) {
            document.querySelectorAll('[data-rule]').forEach(li => {
                li.classList.remove('valid');
            });
            return;
        }
        
        this.validatePassword(password);
    }
    
    getValidationMessage(input) {
        const messages = {
            valueMissing: 'Este campo es obligatorio',
            tooShort: `Mínimo ${input.getAttribute('minlength')} caracteres`,
            tooLong: `Máximo ${input.getAttribute('maxlength')} caracteres`,
            typeMismatch: 'Formato inválido',
            patternMismatch: input.getAttribute('title') || 'Formato inválido'
        };
        
        for (const [key, message] of Object.entries(messages)) {
            if (input.validity[key]) {
                return message;
            }
        }
        
        return 'Campo inválido';
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        // Validate all fields
        const inputs = this.form.querySelectorAll('input');
        let isValid = true;
        let firstInvalidInput = null;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
                if (!firstInvalidInput) {
                    firstInvalidInput = input;
                }
            }
        });
        
        if (!isValid) {
            this.showNotification('Por favor, corrige los errores en el formulario', 'error');
            
            if (firstInvalidInput) {
                firstInvalidInput.focus();
                firstInvalidInput.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }
            return;
        }
        
        // Show loading state
        this.submitBtn.disabled = true;
        this.submitBtn.classList.add('loading');
        
        try {
            // Simulate API call
            await this.simulateApiCall();
            
            // Show success message
            this.showNotification('¡Registro exitoso! Tu cuenta ha sido creada. Redirigiendo...', 'success');
            
            // Simulate redirection after successful registration
            setTimeout(() => {
                this.showNotification('¡Bienvenido a la plataforma!', 'success');
                
                // Reset form
                this.form.reset();
                this.resetValidation();
                this.submitBtn.disabled = false;
                this.submitBtn.classList.remove('loading');
                
                // Optional: You can add actual redirection here
                // window.location.href = 'dashboard.html';
                
            }, 2000);
            
        } catch (error) {
            this.showNotification('Error al crear la cuenta. Por favor, intenta nuevamente.', 'error');
            this.submitBtn.disabled = false;
            this.submitBtn.classList.remove('loading');
        }
    }
    
    simulateApiCall() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate random API failure (10% chance)
                if (Math.random() < 0.9) {
                    resolve();
                } else {
                    reject(new Error('API Error'));
                }
            }, 1500);
        });
    }
    
    resetValidation() {
        this.form.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error', 'valid');
            const input = group.querySelector('input');
            if (input) {
                input.classList.remove('invalid', 'valid');
            }
            const errorMsg = group.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.textContent = '';
            }
        });
        
        // Reset password requirements
        document.querySelectorAll('[data-rule]').forEach(li => {
            li.classList.remove('valid');
        });
    }
    
    showNotification(message, type = 'success') {
        this.notificationText.textContent = message;
        this.notification.className = 'notification';
        this.notification.classList.add(type, 'show');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            this.notification.classList.remove('show');
        }, 5000);
    }
}

// Initialize form validator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FormValidator();
    
    // Add form autocomplete hints
    document.getElementById('firstName').setAttribute('autocomplete', 'given-name');
    document.getElementById('lastName').setAttribute('autocomplete', 'family-name');
    document.getElementById('email').setAttribute('autocomplete', 'email');
    document.getElementById('password').setAttribute('autocomplete', 'new-password');
    document.getElementById('confirmPassword').setAttribute('autocomplete', 'new-password');
    document.getElementById('phone').setAttribute('autocomplete', 'tel');
});
