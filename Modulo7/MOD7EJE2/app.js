// app.js - Versión simple del cambio de tema
const themeToggle = document.getElementById('checkbox');
const html = document.documentElement;

// Escuchar cambios en el checkbox
themeToggle.addEventListener('change', function() {
    if (this.checked) {
        html.setAttribute('data-theme', 'dark');
    } else {
        html.setAttribute('data-theme', 'light');
    }
});
