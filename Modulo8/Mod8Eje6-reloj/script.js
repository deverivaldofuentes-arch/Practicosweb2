class AdvancedClock {
    constructor() {
        this.init();
    }

    init() {
        // Elementos del DOM
        this.elements = {
            hourHand: document.getElementById('hourHand'),
            minuteHand: document.getElementById('minuteHand'),
            secondHand: document.getElementById('secondHand'),
            digitalTime: document.getElementById('digitalTime'),
            timePeriod: document.getElementById('timePeriod'),
            date: document.getElementById('date'),
            greeting: document.getElementById('greeting'),
            formatBtn: document.getElementById('formatBtn'),
            formatText: document.getElementById('formatText'),
            themeBtn: document.getElementById('themeBtn'),
            fullscreenBtn: document.getElementById('fullscreenBtn'),
            stopwatchBtn: document.getElementById('stopwatchBtn'),
            dayOfYear: document.getElementById('dayOfYear'),
            weekNumber: document.getElementById('weekNumber'),
            secondsToday: document.getElementById('secondsToday'),
            yearProgress: document.getElementById('yearProgress'),
            weekProgress: document.getElementById('weekProgress'),
            dayProgress: document.getElementById('dayProgress'),
            yearProgressText: document.getElementById('yearProgressText'),
            weekProgressText: document.getElementById('weekProgressText'),
            dayProgressText: document.getElementById('dayProgressText'),
            moonPhase: document.getElementById('moonPhase'),
            moonPhaseText: document.getElementById('moonPhaseText'),
            sunrise: document.getElementById('sunrise'),
            sunset: document.getElementById('sunset'),
            season: document.getElementById('season'),
            localTime: document.getElementById('localTime'),
            timezone: document.getElementById('timezone'),
            stopwatchModal: document.getElementById('stopwatchModal'),
            closeModal: document.getElementById('closeModal'),
            startStopwatch: document.getElementById('startStopwatch'),
            pauseStopwatch: document.getElementById('pauseStopwatch'),
            resetStopwatch: document.getElementById('resetStopwatch'),
            stopwatchTime: document.getElementById('stopwatchTime'),
            stopwatchLaps: document.getElementById('stopwatchLaps'),
            notification: document.getElementById('notification'),
            notificationText: document.getElementById('notificationText')
        };

        this.state = {
            is24HourFormat: false,
            currentTheme: 0,
            isFullscreen: false,
            stopwatch: {
                running: false,
                startTime: 0,
                elapsed: 0,
                laps: []
            },
            themes: [
                {
                    bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                    primary: '#00c3ff',
                    secondary: '#0066ff'
                },
                {
                    bg: 'linear-gradient(135deg, #2d1b69 0%, #5b247a 50%, #8b31a9 100%)',
                    primary: '#ff6bcb',
                    secondary: '#c44569'
                },
                {
                    bg: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
                    primary: '#7ee8fa',
                    secondary: '#80ff72'
                },
                {
                    bg: 'linear-gradient(135deg, #2c003e 0%, #4c0070 50%, #8e00cc 100%)',
                    primary: '#ff00ff',
                    secondary: '#00ffff'
                }
            ],
            moonPhases: ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'],
            seasons: ['Primavera', 'Verano', 'Otoño', 'Invierno']
        };

        this.setupEventListeners();
        this.createStars();
        this.createTicks();
        this.updateClock();
        this.startClock();
        this.updateTimezone();
        this.calculateMoonPhase();
        this.updateSeason();
        this.updateSunTimes();
    }

    setupEventListeners() {
        // Botones de control
        this.elements.formatBtn.addEventListener('click', () => this.toggleFormat());
        this.elements.themeBtn.addEventListener('click', () => this.changeTheme());
        this.elements.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());
        this.elements.stopwatchBtn.addEventListener('click', () => this.showStopwatch());
        
        // Cronómetro
        this.elements.startStopwatch.addEventListener('click', () => this.toggleStopwatch());
        this.elements.pauseStopwatch.addEventListener('click', () => this.pauseStopwatch());
        this.elements.resetStopwatch.addEventListener('click', () => this.resetStopwatch());
        this.elements.closeModal.addEventListener('click', () => this.hideStopwatch());
        
        // Atajos de teclado
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Cerrar modal con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideStopwatch();
                if (this.state.isFullscreen) {
                    this.toggleFullscreen();
                }
            }
        });
        
        // Cerrar modal al hacer click fuera
        this.elements.stopwatchModal.addEventListener('click', (e) => {
            if (e.target === this.elements.stopwatchModal) {
                this.hideStopwatch();
            }
        });
    }

    createStars() {
        const starsContainer = document.getElementById('stars');
        for (let i = 0; i < 150; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 100 + '%';
            star.style.animationDelay = Math.random() * 3 + 's';
            star.style.animationDuration = (Math.random() * 2 + 1) + 's';
            starsContainer.appendChild(star);
        }
    }

    createTicks() {
        const ticksContainer = document.getElementById('ticks');
        for (let i = 0; i < 60; i++) {
            const tick = document.createElement('div');
            tick.className = i % 5 === 0 ? 'tick major' : 'tick';
            tick.style.transform = `translateX(-50%) rotate(${i * 6}deg)`;
            ticksContainer.appendChild(tick);
        }
    }

    startClock() {
        // Actualizar cada 50ms para movimiento suave
        setInterval(() => this.updateClock(), 50);
        
        // Actualizar progresos cada segundo
        setInterval(() => this.updateProgressBars(), 1000);
        
        // Actualizar cronómetro si está activo
        setInterval(() => this.updateStopwatch(), 10);
    }

    updateClock() {
        const now = new Date();
        
        // Obtener tiempo
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const milliseconds = now.getMilliseconds();

        // Calcular ángulos (suave con milisegundos)
        const secondAngle = ((seconds + milliseconds / 1000) * 6);
        const minuteAngle = ((minutes + seconds / 60) * 6);
        const hourAngle = ((hours % 12 + minutes / 60) * 30);

        // Aplicar rotación a las manecillas
        this.elements.hourHand.style.transform = `rotate(${hourAngle}deg)`;
        this.elements.minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
        this.elements.secondHand.style.transform = `rotate(${secondAngle}deg)`;

        // Actualizar reloj digital
        this.updateDigitalClock(now);
        
        // Actualizar fecha
        this.updateDate(now);
        
        // Actualizar saludo
        this.updateGreeting(hours);
        
        // Actualizar estadísticas
        this.updateStats(now);
        
        // Actualizar hora local
        this.elements.localTime.textContent = now.toLocaleTimeString('es-ES');
    }

    updateDigitalClock(date) {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        
        let displayTime;
        if (!this.state.is24HourFormat) {
            const period = hours >= 12 ? 'PM' : 'AM';
            this.elements.timePeriod.textContent = period;
            hours = hours % 12 || 12;
            displayTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        } else {
            this.elements.timePeriod.textContent = '';
            displayTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
        
        this.elements.digitalTime.textContent = displayTime;
    }

    updateDate(date) {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        const dateString = date.toLocaleDateString('es-ES', options);
        this.elements.date.textContent = dateString.charAt(0).toUpperCase() + dateString.slice(1);
    }

    updateGreeting(hour) {
        let greeting;
        let icon;
        
        if (hour >= 5 && hour < 12) {
            greeting = 'Buenos días';
            icon = 'fa-sun';
        } else if (hour >= 12 && hour < 19) {
            greeting = 'Buenas tardes';
            icon = 'fa-cloud-sun';
        } else {
            greeting = 'Buenas noches';
            icon = 'fa-moon';
        }
        
        this.elements.greeting.innerHTML = `<i class="fas ${icon}"></i> ${greeting}`;
    }

    updateStats(date) {
        const dayOfYear = this.getDayOfYear(date);
        const weekNumber = this.getWeekNumber(date);
        const secondsToday = this.getSecondsToday(date);
        
        this.elements.dayOfYear.textContent = dayOfYear;
        this.elements.weekNumber.textContent = weekNumber;
        this.elements.secondsToday.textContent = secondsToday.toLocaleString();
    }

    updateProgressBars() {
        const now = new Date();
        
        // Progreso del año
        const dayOfYear = this.getDayOfYear(now);
        const yearProgress = (dayOfYear / 365) * 100;
        this.elements.yearProgress.querySelector('.progress-fill').style.width = `${yearProgress}%`;
        this.elements.yearProgressText.textContent = `${yearProgress.toFixed(1)}%`;
        
        // Progreso de la semana
        const dayOfWeek = now.getDay() || 7; // 1-7 (Lunes-Domingo)
        const weekProgress = (dayOfWeek / 7) * 100;
        this.elements.weekProgress.querySelector('.progress-fill').style.width = `${weekProgress}%`;
        this.elements.weekProgressText.textContent = `${weekProgress.toFixed(1)}%`;
        
        // Progreso del día
        const secondsToday = this.getSecondsToday(now);
        const dayProgress = (secondsToday / 86400) * 100;
        this.elements.dayProgress.querySelector('.progress-fill').style.width = `${dayProgress}%`;
        this.elements.dayProgressText.textContent = `${dayProgress.toFixed(1)}%`;
    }

    getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    getSecondsToday(date) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        
        return (hours * 3600) + (minutes * 60) + seconds;
    }

    toggleFormat() {
        this.state.is24HourFormat = !this.state.is24HourFormat;
        this.elements.formatText.textContent = this.state.is24HourFormat ? '24h' : '12h';
        this.showNotification(`Modo ${this.state.is24HourFormat ? '24 horas' : '12 horas'} activado`);
    }

    changeTheme() {
        this.state.currentTheme = (this.state.currentTheme + 1) % this.state.themes.length;
        const theme = this.state.themes[this.state.currentTheme];
        document.body.style.background = theme.bg;
        
        // Actualizar colores CSS variables
        document.documentElement.style.setProperty('--primary', theme.primary);
        document.documentElement.style.setProperty('--primary-dark', theme.secondary);
        
        this.showNotification(`Tema ${this.state.currentTheme + 1} activado`);
    }

    toggleFullscreen() {
        if (!this.state.isFullscreen) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            }
            this.state.isFullscreen = true;
            this.showNotification('Pantalla completa activada');
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
            this.state.isFullscreen = false;
            this.showNotification('Pantalla completa desactivada');
        }
    }

    showStopwatch() {
        this.elements.stopwatchModal.classList.add('show');
    }

    hideStopwatch() {
        this.elements.stopwatchModal.classList.remove('show');
    }

    toggleStopwatch() {
        if (!this.state.stopwatch.running) {
            this.state.stopwatch.startTime = Date.now() - this.state.stopwatch.elapsed;
            this.state.stopwatch.running = true;
            this.elements.startStopwatch.innerHTML = '<i class="fas fa-stop"></i> Detener';
            this.showNotification('Cronómetro iniciado');
        } else {
            this.state.stopwatch.running = false;
            this.elements.startStopwatch.innerHTML = '<i class="fas fa-play"></i> Iniciar';
            this.showNotification('Cronómetro detenido');
        }
    }

    pauseStopwatch() {
        if (this.state.stopwatch.running) {
            this.state.stopwatch.elapsed = Date.now() - this.state.stopwatch.startTime;
            this.state.stopwatch.running = false;
            this.elements.startStopwatch.innerHTML = '<i class="fas fa-play"></i> Iniciar';
            
            // Agregar vuelta
            const lapTime = this.formatStopwatchTime(this.state.stopwatch.elapsed);
            const lapItem = document.createElement('div');
            lapItem.className = 'lap-item';
            lapItem.textContent = `Vuelta ${this.state.stopwatch.laps.length + 1}: ${lapTime}`;
            this.elements.stopwatchLaps.appendChild(lapItem);
            this.state.stopwatch.laps.push(lapTime);
            
            this.showNotification('Vuelta registrada');
        }
    }

    resetStopwatch() {
        this.state.stopwatch = {
            running: false,
            startTime: 0,
            elapsed: 0,
            laps: []
        };
        this.elements.stopwatchTime.textContent = '00:00:00.000';
        this.elements.stopwatchLaps.innerHTML = '';
        this.elements.startStopwatch.innerHTML = '<i class="fas fa-play"></i> Iniciar';
        this.showNotification('Cronómetro reiniciado');
    }

    updateStopwatch() {
        if (this.state.stopwatch.running) {
            this.state.stopwatch.elapsed = Date.now() - this.state.stopwatch.startTime;
            this.elements.stopwatchTime.textContent = this.formatStopwatchTime(this.state.stopwatch.elapsed);
        }
    }

    formatStopwatchTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const ms = Math.floor((milliseconds % 1000) / 10);
        
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
    }

    updateTimezone() {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const offset = new Date().getTimezoneOffset();
        const utcOffset = -offset / 60;
        const offsetString = utcOffset >= 0 ? `UTC+${utcOffset}` : `UTC${utcOffset}`;
        
        this.elements.timezone.textContent = `${timezone.split('/')[1]} (${offsetString})`;
    }

    calculateMoonPhase() {
        // Algoritmo simplificado para fase lunar
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        
        // Cálculo aproximado
        const c = (year % 100);
        const e = (month < 3) ? year - 1 : year;
        const jd = Math.floor(365.25 * (e + 4716)) + 
                   Math.floor(30.6001 * ((month < 3 ? month + 12 : month) + 1)) + 
                   day + c - 1524.5;
        
        const daysSinceNew = (jd - 2451549.5) % 29.530588853;
        const phaseIndex = Math.floor((daysSinceNew / 29.530588853) * 8) % 8;
        
        this.elements.moonPhase.textContent = this.state.moonPhases[phaseIndex];
        
        const phaseNames = ['Nueva', 'Creciente', 'Cuarto creciente', 'Gibosa creciente', 
                           'Llena', 'Gibosa menguante', 'Cuarto menguante', 'Creciente menguante'];
        this.elements.moonPhaseText.textContent = phaseNames[phaseIndex];
    }

    updateSeason() {
        const now = new Date();
        const month = now.getMonth();
        
        let season;
        if (month >= 2 && month <= 4) season = 'Primavera';
        else if (month >= 5 && month <= 7) season = 'Verano';
        else if (month >= 8 && month <= 10) season = 'Otoño';
        else season = 'Invierno';
        
        this.elements.season.textContent = season;
    }

    updateSunTimes() {
        // Horas aproximadas (puedes implementar cálculo real con API)
        this.elements.sunrise.textContent = '06:30 AM';
        this.elements.sunset.textContent = '06:30 PM';
    }

    showNotification(message) {
        this.elements.notificationText.textContent = message;
        this.elements.notification.classList.add('show');
        
        setTimeout(() => {
            this.elements.notification.classList.remove('show');
        }, 3000);
    }

    handleKeyboardShortcuts(e) {
        // Espacio para cambiar formato
        if (e.code === 'Space' && e.target === document.body) {
            e.preventDefault();
            this.toggleFormat();
        }
        
        // T para cambiar tema
        if (e.key === 't' || e.key === 'T') {
            e.preventDefault();
            this.changeTheme();
        }
        
        // F para pantalla completa
        if (e.key === 'f' || e.key === 'F') {
            e.preventDefault();
            this.toggleFullscreen();
        }
        
        // S para cronómetro
        if (e.key === 's' || e.key === 'S') {
            e.preventDefault();
            this.showStopwatch();
        }
        
        // H para formato 12/24h
        if (e.key === 'h' || e.key === 'H') {
            e.preventDefault();
            this.toggleFormat();
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const clock = new AdvancedClock();
    
    // Exponer para debugging
    window.clock = clock;
});

// Manejar cambios en pantalla completa
document.addEventListener('fullscreenchange', () => {
    const clock = window.clock;
    if (clock) {
        clock.state.isFullscreen = !!document.fullscreenElement;
    }
});
