// Demo Interactiva de Box-Sizing

const widthSlider = document.getElementById('widthSlider');
const paddingSlider = document.getElementById('paddingSlider');
const borderSlider = document.getElementById('borderSlider');

const widthValue = document.getElementById('widthValue');
const paddingValue = document.getElementById('paddingValue');
const borderValue = document.getElementById('borderValue');

const demoContentBox = document.getElementById('demoContentBox');
const demoBorderBox = document.getElementById('demoBorderBox');

const totalContentBox = document.getElementById('totalContentBox');
const totalBorderBox = document.getElementById('totalBorderBox');

function updateBoxes() {
    const width = parseInt(widthSlider.value);
    const padding = parseInt(paddingSlider.value);
    const border = parseInt(borderSlider.value);
    
    // Actualizar valores mostrados
    widthValue.textContent = `${width}px`;
    paddingValue.textContent = `${padding}px`;
    borderValue.textContent = `${border}px`;
    
    // Aplicar estilos
    [demoContentBox, demoBorderBox].forEach(box => {
        box.style.width = `${width}px`;
        box.style.padding = `${padding}px`;
        box.style.borderWidth = `${border}px`;
    });
    
    // Calcular totales
    // content-box: width + padding*2 + border*2
    const contentBoxTotal = width + (padding * 2) + (border * 2);
    // border-box: width (incluye padding y border)
    const borderBoxTotal = width;
    
    totalContentBox.textContent = `Total: ${contentBoxTotal}px`;
    totalBorderBox.textContent = `Total: ${borderBoxTotal}px`;
}

// Event listeners
widthSlider.addEventListener('input', updateBoxes);
paddingSlider.addEventListener('input', updateBoxes);
borderSlider.addEventListener('input', updateBoxes);

// Inicializar
updateBoxes();

console.log('📦 Box-sizing demo cargada');
console.log('🎮 Ajusta los sliders para ver la diferencia!');
