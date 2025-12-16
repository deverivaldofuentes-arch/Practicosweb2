class Calculator {
    constructor(previousOperandElement, currentOperandElement) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.history = JSON.parse(localStorage.getItem('calculatorHistory')) || [];
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.clear();
        this.updateHistory();
        this.initTheme();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.error = false;
    }

    delete() {
        if (this.currentOperand === '0' || this.error) return;
        this.currentOperand = this.currentOperand.toString().slice(0, -1);
        if (this.currentOperand === '') this.currentOperand = '0';
    }

    appendNumber(number) {
        if (this.error) return;
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '' || this.error) return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '0';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        
        if (isNaN(prev) || isNaN(current)) return;
        
        if (this.operation === '÷' && current === 0) {
            this.currentOperand = 'Error: División por cero';
            this.error = true;
            this.operation = undefined;
            this.previousOperand = '';
            this.updateDisplay();
            return;
        }
        
        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '×':
                computation = prev * current;
                break;
            case '÷':
                computation = prev / current;
                break;
            default:
                return;
        }
        
        // Manejar números muy grandes o pequeños
        if (!isFinite(computation)) {
            this.currentOperand = 'Error: Overflow';
            this.error = true;
            this.operation = undefined;
            this.previousOperand = '';
            this.updateDisplay();
            return;
        }
        
        // Redondear a 8 decimales para evitar errores de precisión
        computation = Math.round(computation * 100000000) / 100000000;
        
        // Guardar en historial con mejor formato
        const expression = `${this.formatNumber(prev)} ${this.operation} ${this.formatNumber(current)}`;
        const result = this.formatNumber(computation);
        
        const historyEntry = {
            id: Date.now(),
            expression,
            result,
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.history.unshift(historyEntry);
        if (this.history.length > 20) this.history.pop();
        localStorage.setItem('calculatorHistory', JSON.stringify(this.history));
        this.updateHistory();
        
        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.error = false;
    }

    formatNumber(number) {
        // Formatear números para mostrar
        const numStr = number.toString();
        if (numStr.includes('e')) return numStr; // Notación científica
        
        const [integer, decimal] = numStr.split('.');
        if (!decimal) return this.addCommas(integer);
        
        // Limitar decimales a 8
        const limitedDecimal = decimal.length > 8 ? decimal.substring(0, 8) : decimal;
        return `${this.addCommas(integer)}.${limitedDecimal}`;
    }

    addCommas(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    getDisplayNumber(number) {
        if (typeof number === 'string' && (number.includes('Error') || number.includes('Infinity'))) {
            return number;
        }
        
        const num = parseFloat(number);
        if (isNaN(num)) return number;
        
        return this.formatNumber(num);
    }

    updateDisplay() {
        this.currentOperandElement.textContent = this.getDisplayNumber(this.currentOperand);
        
        if (this.operation != null) {
            this.previousOperandElement.textContent =
                `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandElement.textContent = '';
        }
    }

    updateHistory() {
        const historyList = document.getElementById('historyList');
        const historyCount = document.getElementById('historyCount');
        
        historyList.innerHTML = '';
        
        if (this.history.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'history-item';
            emptyState.innerHTML = `
                <div class="expression">No hay cálculos recientes</div>
                <div class="result">Realiza operaciones para ver el historial</div>
            `;
            historyList.appendChild(emptyState);
        } else {
            this.history.forEach(item => {
                const div = document.createElement('div');
                div.className = 'history-item';
                div.innerHTML = `
                    <div class="expression">${item.expression}</div>
                    <div class="result">= ${item.result}</div>
                    <div style="font-size: 0.8rem; color: #718096; margin-top: 0.25rem;">
                        ${item.timestamp}
                    </div>
                `;
                
                // Hacer clic en un elemento del historial para cargarlo
                div.addEventListener('click', () => {
                    this.loadFromHistory(item);
                });
                
                historyList.appendChild(div);
            });
        }
        
        historyCount.textContent = `${this.history.length} ${this.history.length === 1 ? 'cálculo' : 'cálculos'}`;
    }

    loadFromHistory(historyItem) {
        const result = historyItem.result.replace(/,/g, '');
        this.currentOperand = result;
        this.previousOperand = '';
        this.operation = undefined;
        this.error = false;
        this.updateDisplay();
    }

    clearHistory() {
        this.history = [];
        localStorage.removeItem('calculatorHistory');
        this.updateHistory();
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('darkMode', this.isDarkMode);
        this.applyTheme();
    }

    initTheme() {
        this.applyTheme();
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.innerHTML = this.isDarkMode 
                ? '<i class="fas fa-sun"></i> Modo Claro' 
                : '<i class="fas fa-moon"></i> Modo Oscuro';
        }
    }

    applyTheme() {
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
            document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
        } else {
            document.body.classList.remove('dark-mode');
            document.getElementById('themeToggle').innerHTML = '<i class="fas fa-moon"></i> Modo Oscuro';
        }
    }
}

// Inicializar calculadora
const previousOperandElement = document.querySelector('.previous-operand');
const currentOperandElement = document.querySelector('.current-operand');
const calculator = new Calculator(previousOperandElement, currentOperandElement);

// Event listeners para botones numéricos
document.querySelectorAll('.btn-number').forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendNumber(button.textContent);
        calculator.updateDisplay();
    });
});

// Event listeners para botones de operación
document.querySelectorAll('.btn-operator').forEach(button => {
    button.addEventListener('click', () => {
        calculator.chooseOperation(button.textContent);
        calculator.updateDisplay();
    });
});

// Event listener para botón igual
document.querySelector('.btn-equals').addEventListener('click', () => {
    calculator.compute();
    calculator.updateDisplay();
});

// Event listener para botón clear
document.querySelector('.btn-clear').addEventListener('click', () => {
    calculator.clear();
    calculator.updateDisplay();
});

// Event listener para botón delete
document.querySelector('.btn-delete').addEventListener('click', () => {
    calculator.delete();
    calculator.updateDisplay();
});

// Event listener para limpiar historial
document.getElementById('clearHistory').addEventListener('click', () => {
    if (calculator.history.length > 0) {
        if (confirm('¿Estás seguro de que quieres borrar todo el historial?')) {
            calculator.clearHistory();
        }
    }
});

// Event listener para toggle de tema
document.getElementById('themeToggle').addEventListener('click', () => {
    calculator.toggleTheme();
});

// Soporte mejorado para teclado
document.addEventListener('keydown', (e) => {
    // Prevenir comportamiento por defecto solo para teclas que usamos
    if (
        (e.key >= '0' && e.key <= '9') ||
        e.key === '.' ||
        e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/' ||
        e.key === 'Enter' || e.key === '=' || e.key === 'Backspace' || e.key === 'Escape'
    ) {
        e.preventDefault();
    }
    
    if (e.key >= '0' && e.key <= '9') {
        calculator.appendNumber(e.key);
        calculator.updateDisplay();
    }
    
    if (e.key === '.') {
        calculator.appendNumber(e.key);
        calculator.updateDisplay();
    }
    
    if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
        const operation = e.key === '*' ? '×' : e.key === '/' ? '÷' : e.key;
        calculator.chooseOperation(operation);
        calculator.updateDisplay();
    }
    
    if (e.key === 'Enter' || e.key === '=') {
        calculator.compute();
        calculator.updateDisplay();
    }
    
    if (e.key === 'Backspace') {
        calculator.delete();
        calculator.updateDisplay();
    }
    
    if (e.key === 'Escape') {
        calculator.clear();
        calculator.updateDisplay();
    }
    
    // Navegación por historial con flechas
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        const historyItems = document.querySelectorAll('.history-item');
        if (historyItems.length > 0 && calculator.history.length > 0) {
            if (e.key === 'ArrowUp') {
                calculator.loadFromHistory(calculator.history[0]);
            } else if (e.key === 'ArrowDown' && calculator.history.length > 1) {
                calculator.loadFromHistory(calculator.history[1]);
            }
        }
    }
});

// Efectos de sonido (opcional)
function playClickSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Añadir efecto de sonido a los botones
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', () => {
        playClickSound();
    });
});

// Inicializar display
calculator.updateDisplay();
