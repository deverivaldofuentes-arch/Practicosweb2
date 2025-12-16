class ColorGenerator {
    constructor() {
        this.init();
    }

    init() {
        // Elementos del DOM
        this.elements = {
            body: document.body,
            colorCode: document.getElementById('colorCode'),
            colorPreview: document.getElementById('colorPreview'),
            colorVisual: document.getElementById('colorVisual'),
            generateBtn: document.getElementById('generateBtn'),
            copyBtn: document.getElementById('copyBtn'),
            historyGrid: document.getElementById('historyGrid'),
            favoritesGrid: document.getElementById('favoritesGrid'),
            clearHistoryBtn: document.getElementById('clearHistory'),
            themeToggle: document.getElementById('themeToggle'),
            colorPicker: document.getElementById('colorPicker'),
            hexInput: document.getElementById('hexInput'),
            applyColorBtn: document.getElementById('applyColor'),
            rgbValue: document.getElementById('rgbValue'),
            hslValue: document.getElementById('hslValue'),
            cmykValue: document.getElementById('cmykValue'),
            brightnessValue: document.getElementById('brightnessValue'),
            saturationValue: document.getElementById('saturationValue'),
            contrastValue: document.getElementById('contrastValue'),
            historyCount: document.getElementById('historyCount'),
            favoritesCount: document.getElementById('favoritesCount'),
            toast: document.getElementById('toast'),
            toastTitle: document.getElementById('toastTitle'),
            toastMessage: document.getElementById('toastMessage')
        };

        this.state = {
            currentColor: '#667eea',
            colorHistory: [],
            favorites: new Set(),
            maxHistory: 12,
            maxFavorites: 8,
            theme: localStorage.getItem('theme') || 'light'
        };

        this.setupEventListeners();
        this.loadFromLocalStorage();
        this.applyTheme();
        this.updateColor(this.state.currentColor);
    }

    setupEventListeners() {
        // Generar color aleatorio
        this.elements.generateBtn.addEventListener('click', () => this.generateRandomColor());
        
        // Copiar al portapapeles
        this.elements.copyBtn.addEventListener('click', () => this.copyToClipboard());
        this.elements.colorCode.addEventListener('click', () => this.copyToClipboard());
        
        // Selector de color
        this.elements.colorPicker.addEventListener('input', (e) => {
            this.elements.hexInput.value = e.target.value;
            this.updateColor(e.target.value);
        });
        
        this.elements.hexInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.applyCustomColor();
            }
        });
        
        this.elements.applyColorBtn.addEventListener('click', () => this.applyCustomColor());
        
        // Limpiar historial
        this.elements.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        
        // Cambiar tema
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Atajos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && e.target === document.body) {
                e.preventDefault();
                this.generateRandomColor();
            }
            
            // Ctrl/Cmd + C para copiar
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                e.preventDefault();
                this.copyToClipboard();
            }
        });
    }

    generateRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        
        this.updateColor(color);
        
        // Animación del botón
        this.elements.generateBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.elements.generateBtn.style.transform = '';
        }, 100);
    }

    applyCustomColor() {
        let color = this.elements.hexInput.value.trim();
        
        // Añadir # si no lo tiene
        if (!color.startsWith('#')) {
            color = '#' + color;
        }
        
        // Validar formato HEX
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        if (hexRegex.test(color)) {
            this.updateColor(color);
            this.elements.colorPicker.value = color;
        } else {
            this.showToast('Error', 'Formato de color inválido', 'error');
        }
    }

    updateColor(hexColor) {
        this.state.currentColor = hexColor;
        
        // Actualizar elementos visuales
        this.elements.colorVisual.style.background = hexColor;
        this.elements.colorCode.textContent = hexColor;
        this.elements.colorPicker.value = hexColor;
        this.elements.hexInput.value = hexColor;
        
        // Actualizar información del color
        this.updateColorInfo(hexColor);
        
        // Agregar al historial
        this.addToHistory(hexColor);
        
        // Actualizar contadores
        this.updateCounters();
        
        // Guardar en localStorage
        this.saveToLocalStorage();
    }

    updateColorInfo(hexColor) {
        // Convertir HEX a RGB
        const rgb = this.hexToRgb(hexColor);
        this.elements.rgbValue.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        
        // Convertir HEX a HSL
        const hsl = this.hexToHsl(hexColor);
        this.elements.hslValue.textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        
        // Convertir HEX a CMYK
        const cmyk = this.hexToCmyk(hexColor);
        this.elements.cmykValue.textContent = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
        
        // Actualizar información adicional
        this.updateColorDetails(hexColor, rgb);
    }

    updateColorDetails(hexColor, rgb) {
        // Calcular brillo
        const brightness = Math.round(((rgb.r * 299) + (rgb.g * 587) + (rgb.b * 114)) / 1000);
        let brightnessText = 'Oscuro';
        if (brightness > 200) brightnessText = 'Muy claro';
        else if (brightness > 150) brightnessText = 'Claro';
        else if (brightness > 100) brightnessText = 'Medio';
        
        this.elements.brightnessValue.textContent = brightnessText;
        
        // Calcular saturación
        const hsl = this.hexToHsl(hexColor);
        let saturationText = 'Baja';
        if (hsl.s > 80) saturationText = 'Muy alta';
        else if (hsl.s > 60) saturationText = 'Alta';
        else if (hsl.s > 40) saturationText = 'Media';
        
        this.elements.saturationValue.textContent = saturationText;
        
        // Calcular contraste con blanco
        const contrast = this.calculateContrast(rgb, {r: 255, g: 255, b: 255});
        this.elements.contrastValue.textContent = `${contrast}:1`;
    }

    hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        return { r, g, b };
    }

    hexToHsl(hex) {
        let r = parseInt(hex.slice(1, 3), 16) / 255;
        let g = parseInt(hex.slice(3, 5), 16) / 255;
        let b = parseInt(hex.slice(5, 7), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        
        h = Math.round(h * 360);
        s = Math.round(s * 100);
        l = Math.round(l * 100);
        
        return { h, s, l };
    }

    hexToCmyk(hex) {
        const rgb = this.hexToRgb(hex);
        let r = rgb.r / 255;
        let g = rgb.g / 255;
        let b = rgb.b / 255;
        
        const k = 1 - Math.max(r, g, b);
        const c = (1 - r - k) / (1 - k) || 0;
        const m = (1 - g - k) / (1 - k) || 0;
        const y = (1 - b - k) / (1 - k) || 0;
        
        return {
            c: Math.round(c * 100),
            m: Math.round(m * 100),
            y: Math.round(y * 100),
            k: Math.round(k * 100)
        };
    }

    calculateContrast(rgb1, rgb2) {
        const luminance1 = this.calculateLuminance(rgb1);
        const luminance2 = this.calculateLuminance(rgb2);
        
        const brightest = Math.max(luminance1, luminance2);
        const darkest = Math.min(luminance1, luminance2);
        
        return ((brightest + 0.05) / (darkest + 0.05)).toFixed(1);
    }

    calculateLuminance(rgb) {
        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;
        
        const rs = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
        const gs = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
        const bs = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
        
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    addToHistory(color) {
        // Evitar duplicados consecutivos
        if (this.state.colorHistory[0] === color) return;
        
        // Agregar al inicio del array
        this.state.colorHistory.unshift(color);
        
        // Limitar historial
        if (this.state.colorHistory.length > this.state.maxHistory) {
            this.state.colorHistory = this.state.colorHistory.slice(0, this.state.maxHistory);
        }
        
        // Renderizar historial
        this.renderHistory();
    }

    renderHistory() {
        this.elements.historyGrid.innerHTML = '';
        
        this.state.colorHistory.forEach(color => {
            const item = this.createColorItem(color, 'history');
            this.elements.historyGrid.appendChild(item);
        });
        
        this.updateCounters();
    }

    renderFavorites() {
        this.elements.favoritesGrid.innerHTML = '';
        
        if (this.state.favorites.size === 0) {
            this.elements.favoritesGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-star"></i>
                    <p>Agrega colores a favoritos</p>
                </div>
            `;
            return;
        }
        
        Array.from(this.state.favorites).forEach(color => {
            const item = this.createColorItem(color, 'favorite');
            this.elements.favoritesGrid.appendChild(item);
        });
        
        this.updateCounters();
    }

    createColorItem(color, type) {
        const item = document.createElement('div');
        item.className = `${type}-item`;
        item.style.backgroundColor = color;
        
        // Mostrar código al hacer hover
        const code = document.createElement('div');
        code.className = 'color-code';
        code.textContent = color;
        item.appendChild(code);
        
        // Click para aplicar color
        item.addEventListener('click', () => {
            this.updateColor(color);
        });
        
        // Click largo para favoritos (solo en historial)
        if (type === 'history') {
            let longPressTimer;
            
            item.addEventListener('mousedown', () => {
                longPressTimer = setTimeout(() => {
                    this.toggleFavorite(color);
                }, 800);
            });
            
            item.addEventListener('mouseup', () => clearTimeout(longPressTimer));
            item.addEventListener('mouseleave', () => clearTimeout(longPressTimer));
            
            // Para touch devices
            item.addEventListener('touchstart', () => {
                longPressTimer = setTimeout(() => {
                    this.toggleFavorite(color);
                }, 800);
            });
            
            item.addEventListener('touchend', () => clearTimeout(longPressTimer));
        }
        
        return item;
    }

    toggleFavorite(color) {
        if (this.state.favorites.has(color)) {
            this.state.favorites.delete(color);
            this.showToast('Favoritos', 'Color eliminado de favoritos', 'info');
        } else {
            if (this.state.favorites.size >= this.state.maxFavorites) {
                this.showToast('Favoritos', 'Límite de favoritos alcanzado', 'warning');
                return;
            }
            this.state.favorites.add(color);
            this.showToast('Favoritos', 'Color agregado a favoritos', 'success');
        }
        
        this.renderFavorites();
        this.saveToLocalStorage();
    }

    clearHistory() {
        this.state.colorHistory = [];
        this.renderHistory();
        this.showToast('Historial', 'Historial limpiado', 'info');
        this.saveToLocalStorage();
    }

    async copyToClipboard() {
        const color = this.state.currentColor;
        
        try {
            await navigator.clipboard.writeText(color);
            this.showToast('Copiado', 'Código copiado al portapapeles', 'success');
        } catch (err) {
            // Fallback para navegadores antiguos
            const textArea = document.createElement('textarea');
            textArea.value = color;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showToast('Copiado', 'Código copiado', 'success');
        }
    }

    toggleTheme() {
        this.state.theme = this.state.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.saveToLocalStorage();
        
        // Actualizar icono
        const icon = this.elements.themeToggle.querySelector('i');
        icon.className = this.state.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.state.theme);
        localStorage.setItem('theme', this.state.theme);
    }

    showToast(title, message, type = 'info') {
        const colors = {
            success: '#2ecc71',
            error: '#e74c3c',
            warning: '#f39c12',
            info: '#3498db'
        };
        
        this.elements.toast.style.borderLeftColor = colors[type];
        this.elements.toastTitle.textContent = title;
        this.elements.toastMessage.textContent = message;
        this.elements.toast.classList.add('show');
        
        // Auto-ocultar
        setTimeout(() => {
            this.elements.toast.classList.remove('show');
        }, 3000);
    }

    updateCounters() {
        this.elements.historyCount.textContent = this.state.colorHistory.length;
        this.elements.favoritesCount.textContent = this.state.favorites.size;
    }

    saveToLocalStorage() {
        localStorage.setItem('colorHistory', JSON.stringify(this.state.colorHistory));
        localStorage.setItem('favorites', JSON.stringify(Array.from(this.state.favorites)));
    }

    loadFromLocalStorage() {
        const savedHistory = localStorage.getItem('colorHistory');
        const savedFavorites = localStorage.getItem('favorites');
        
        if (savedHistory) {
            this.state.colorHistory = JSON.parse(savedHistory);
            this.renderHistory();
        }
        
        if (savedFavorites) {
            this.state.favorites = new Set(JSON.parse(savedFavorites));
            this.renderFavorites();
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const colorGenerator = new ColorGenerator();
    
    // Exponer para debugging
    window.colorGenerator = colorGenerator;
});
