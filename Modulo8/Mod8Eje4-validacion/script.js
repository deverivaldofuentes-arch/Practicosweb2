class FormValidator {
    constructor() {
        this.init();
    }

    init() {
        this.elements = {
            form: document.getElementById('registrationForm'),
            username: document.getElementById('username'),
            email: document.getElementById('email'),
            password: document.getElementById('password'),
            confirmPassword: document.getElementById('confirmPassword'),
            age: document.getElementById('age'),
            terms: document.getElementById('terms'),
            submitBtn: document.getElementById('submitBtn'),
            formSummary: document.getElementById('formSummary'),
            progressBar: document.getElementById('progressBar'),
            strengthFill: document.getElementById('strengthFill'),
            strengthText: document.getElementById('strengthText'),
            notification: document.getElementById('notification'),
            togglePassword: document.getElementById('togglePassword'),
            toggleConfirmPassword: document.getElementById('toggleConfirmPassword'),
            resetBtn: document.getElementById('resetBtn')
        };

        this.state = {
            isValid: false,
            completedFields: 0,
            totalFields: 6,
            strengthLevels: {
                weak: { color: '#e74c3c', text: 'Débil', width: 25 },
                medium: { color: '#f39c12', text: 'Media', width: 50 },
                strong: { color: '#2ecc71', text: 'Fuerte', width: 75 },
                veryStrong: { color: '#27ae60', text: 'Muy Fuerte', width: 100 }
            },
            debounceTimers: {}
        };

        this.setupEventListeners();
        this.createParticles();
        this.updateProgress();
    }

    setupEventListeners() {
        // Validación en tiempo real con debounce
        this.setupValidation('username', this.validateUsername.bind(this));
        this.setupValidation('email', this.validateEmail.bind(this));
        this.setupValidation('password', this.validatePassword.bind(this));
        this.setupValidation('confirmPassword', this.validateConfirmPassword.bind(this));
        this.setupValidation('age', this.validateAge.bind(this));

        // Eventos de focus/blur
        this.addFocusEffects();
        
        // Mostrar/ocultar contraseña
        this.elements.togglePassword.addEventListener('click', () => 
            this.togglePasswordVisibility(this.elements.password, this.elements.togglePassword));
        this.elements.toggleConfirmPassword.addEventListener('click', () => 
            this.togglePasswordVisibility(this.elements.confirmPassword, this.elements.toggleConfirmPassword));

        // Términos
        this.elements.terms.addEventListener('change', () => {
            this.validateTerms();
            this.checkFormValidity();
        });

        // Envío del formulario
        this.elements.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Reset
        this.elements.resetBtn.addEventListener('click', () => this.resetForm());

        // Atajos de teclado
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
    }

    setupValidation(fieldName, validator) {
        const field = this.elements[fieldName];
        field.addEventListener('input', this.debounce(() => {
            validator();
            this.updateProgress();
            this.checkFormValidity();
        }, 300));
        
        field.addEventListener('blur', () => {
            validator();
            this.updateProgress();
            this.checkFormValidity();
        });
    }

    addFocusEffects() {
        const inputs = this.elements.form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.style.transform = 'scale(1.02)';
            });
            
            input.addEventListener('blur', () => {
                input.parentElement.style.transform = 'scale(1)';
            });
        });
    }

    debounce(func, wait) {
        return (...args) => {
            clearTimeout(this.state.debounceTimers[func]);
            this.state.debounceTimers[func] = setTimeout(() => func(...args), wait);
        };
    }

    // Validaciones mejoradas
    validateUsername() {
        const value = this.elements.username.value.trim();
        const isValid = value.length >= 3 && /^[a-zA-Z0-9_]+$/.test(value);
        this.updateFieldState('username', isValid, 
            isValid ? '' : 'Usuario inválido. Solo letras, números y guiones bajos (mínimo 3 caracteres)');
        return isValid;
    }

    validateEmail() {
        const value = this.elements.email.value.trim();
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const isValid = emailRegex.test(value);
        this.updateFieldState('email', isValid, 
            isValid ? '' : 'Correo electrónico inválido');
        return isValid;
    }

    validatePassword() {
        const value = this.elements.password.value;
        const requirements = {
            length: value.length >= 8,
            uppercase: /[A-Z]/.test(value),
            number: /[0-9]/.test(value),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
        };

        // Actualizar requisitos visuales
        Object.keys(requirements).forEach(req => {
            const element = document.getElementById(`req-${req}`);
            if (element) {
                element.classList.toggle('met', requirements[req]);
            }
        });

        // Calcular fortaleza
        const strength = this.calculatePasswordStrength(value);
        this.updatePasswordStrength(strength);

        const isValid = requirements.length && requirements.uppercase && requirements.number;
        this.updateFieldState('password', isValid,
            isValid ? '' : 'La contraseña no cumple con los requisitos mínimos');
        return isValid;
    }

    calculatePasswordStrength(password) {
        let score = 0;
        
        // Longitud
        if (password.length >= 8) score += 1;
        if (password.length >= 12) score += 1;
        
        // Complejidad
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 2;
        
        // Diversidad de caracteres
        const uniqueChars = new Set(password).size;
        if (uniqueChars >= 8) score += 1;
        
        if (score <= 2) return 'weak';
        if (score <= 4) return 'medium';
        if (score <= 6) return 'strong';
        return 'veryStrong';
    }

    updatePasswordStrength(strength) {
        const level = this.state.strengthLevels[strength];
        this.elements.strengthFill.style.width = `${level.width}%`;
        this.elements.strengthFill.style.backgroundColor = level.color;
        this.elements.strengthText.textContent = level.text;
        this.elements.strengthText.style.color = level.color;
    }

    validateConfirmPassword() {
        const value = this.elements.confirmPassword.value;
        const isValid = value === this.elements.password.value && value.length > 0;
        this.updateFieldState('confirmPassword', isValid,
            isValid ? '' : 'Las contraseñas no coinciden');
        return isValid;
    }

    validateAge() {
        const value = parseInt(this.elements.age.value);
        const isValid = !isNaN(value) && value >= 18 && value <= 120;
        this.updateFieldState('age', isValid,
            isValid ? '' : 'Debes tener entre 18 y 120 años');
        return isValid;
    }

    validateTerms() {
        const isValid = this.elements.terms.checked;
        const formGroup = this.elements.terms.closest('.checkbox-group');
        const errorElement = formGroup.querySelector('.error-message');
        
        errorElement.textContent = isValid ? '' : 'Debes aceptar los términos y condiciones';
        errorElement.classList.toggle('show', !isValid);
        
        return isValid;
    }

    updateFieldState(fieldName, isValid, errorMessage = '') {
        const field = this.elements[fieldName];
        const formGroup = field.closest('.form-group');
        const errorElement = formGroup.querySelector('.error-message');
        
        field.classList.toggle('valid', isValid);
        field.classList.toggle('invalid', !isValid && field.value.length > 0);
        formGroup.classList.toggle('valid', isValid);
        
        errorElement.textContent = errorMessage;
        errorElement.classList.toggle('show', !isValid && field.value.length > 0);
        
        // Actualizar contador de campos completados
        const allFields = ['username', 'email', 'password', 'confirmPassword', 'age'];
        this.state.completedFields = allFields.reduce((count, f) => 
            count + (this.elements[f].classList.contains('valid') ? 1 : 0), 0);
        
        document.getElementById('completedFields').textContent = this.state.completedFields;
    }

    updateProgress() {
        const progress = (this.state.completedFields / this.state.totalFields) * 100;
        this.elements.progressBar.style.setProperty('--progress', `${progress}%`);
        
        // Actualizar pasos activos
        const steps = document.querySelectorAll('.step');
        if (progress < 33) {
            steps[0].classList.add('active');
            steps[1].classList.remove('active');
            steps[2].classList.remove('active');
        } else if (progress < 66) {
            steps[0].classList.add('active');
            steps[1].classList.add('active');
            steps[2].classList.remove('active');
        } else {
            steps[0].classList.add('active');
            steps[1].classList.add('active');
            steps[2].classList.add('active');
        }
    }

    checkFormValidity() {
        const isValid = 
            this.elements.username.classList.contains('valid') &&
            this.elements.email.classList.contains('valid') &&
            this.elements.password.classList.contains('valid') &&
            this.elements.confirmPassword.classList.contains('valid') &&
            this.elements.age.classList.contains('valid') &&
            this.elements.terms.checked;
        
        this.state.isValid = isValid;
        this.elements.submitBtn.disabled = !isValid;
        
        return isValid;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (!this.checkFormValidity()) {
            this.showNotification('Completa todos los campos correctamente', 'warning');
            return;
        }

        // Simular envío
        this.elements.submitBtn.classList.add('loading');
        this.elements.submitBtn.disabled = true;

        try {
            // Simular petición a API
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Mostrar éxito
            this.elements.submitBtn.classList.remove('loading');
            this.elements.submitBtn.classList.add('success');
            
            // Actualizar resumen
            this.updateSummary();
            this.elements.formSummary.classList.add('show');
            
            // Mostrar notificación
            this.showNotification('¡Registro exitoso! Tu cuenta ha sido creada', 'success');
            
            // Guardar en localStorage (simulación)
            this.saveToLocalStorage();
            
            // Scroll a resumen
            this.elements.formSummary.scrollIntoView({ behavior: 'smooth' });
            
        } catch (error) {
            this.showNotification('Error al procesar el registro', 'error');
            this.elements.submitBtn.classList.remove('loading');
            this.elements.submitBtn.disabled = false;
        }
    }

    updateSummary() {
        document.getElementById('summaryUsername').textContent = this.elements.username.value;
        document.getElementById('summaryEmail').textContent = this.elements.email.value;
        document.getElementById('summaryAge').textContent = `${this.elements.age.value} años`;
        document.getElementById('summaryStrength').textContent = this.elements.strengthText.textContent;
    }

    resetForm() {
        this.elements.form.reset();
        this.elements.formSummary.classList.remove('show');
        this.elements.submitBtn.classList.remove('success', 'loading');
        this.elements.submitBtn.disabled = true;
        
        // Resetear estados visuales
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('valid');
        });
        
        document.querySelectorAll('input').forEach(input => {
            input.classList.remove('valid', 'invalid');
        });
        
        document.querySelectorAll('.error-message').forEach(error => {
            error.classList.remove('show');
            error.textContent = '';
        });
        
        document.querySelectorAll('.requirement').forEach(req => {
            req.classList.remove('met');
        });
        
        this.state.completedFields = 0;
        this.updateProgress();
        document.getElementById('completedFields').textContent = '0';
        
        this.showNotification('Formulario reiniciado. Puedes crear una nueva cuenta', 'info');
    }

    togglePasswordVisibility(passwordField, toggleButton) {
        const type = passwordField.type === 'password' ? 'text' : 'password';
        passwordField.type = type;
        
        const icon = toggleButton.querySelector('i');
        icon.classList.toggle('fa-eye');
        icon.classList.toggle('fa-eye-slash');
    }

    showNotification(message, type = 'info') {
        const notification = this.elements.notification;
        const text = notification.querySelector('.notification-text');
        
        // Configurar colores según tipo
        const colors = {
            success: '#2ecc71',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };
        
        notification.style.borderLeftColor = colors[type];
        text.textContent = message;
        notification.classList.add('show');
        
        // Auto-ocultar
        setTimeout(() => {
            notification.classList.remove('show');
        }, 5000);
    }

    saveToLocalStorage() {
        const formData = {
            username: this.elements.username.value,
            email: this.elements.email.value,
            age: this.elements.age.value,
            registeredAt: new Date().toISOString(),
            strength: this.elements.strengthText.textContent
        };
        
        // Guardar histórico
        const history = JSON.parse(localStorage.getItem('formRegistrations') || '[]');
        history.push(formData);
        localStorage.setItem('formRegistrations', JSON.stringify(history.slice(-10))); // Últimos 10 registros
    }

    handleKeyboardShortcuts(e) {
        // Ctrl + Enter para enviar
        if (e.ctrlKey && e.key === 'Enter' && !this.elements.submitBtn.disabled) {
            this.elements.form.requestSubmit();
        }
        
        // Escape para limpiar
        if (e.key === 'Escape') {
            this.elements.form.reset();
        }
    }

    createParticles() {
        const particlesContainer = this.elements.form.parentElement.querySelector('.particles');
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1});
                border-radius: 50%;
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: float ${Math.random() * 10 + 10}s linear infinite;
            `;
            particlesContainer.appendChild(particle);
        }
        
        // Agregar animación flotante
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const validator = new FormValidator();
    
    // Exponer para debugging
    window.formValidator = validator;
});
