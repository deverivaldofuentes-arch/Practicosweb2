const hourHand = document.getElementById('hourHand');
        const minuteHand = document.getElementById('minuteHand');
        const secondHand = document.getElementById('secondHand');
        const digitalTime = document.getElementById('digitalTime');
        const dateDisplay = document.getElementById('date');
        const greetingDisplay = document.getElementById('greeting');
        const formatBtn = document.getElementById('formatBtn');
        const formatText = document.getElementById('formatText');
        const themeBtn = document.getElementById('themeBtn');
        const dayOfYearDisplay = document.getElementById('dayOfYear');
        const weekNumberDisplay = document.getElementById('weekNumber');
        const secondsTodayDisplay = document.getElementById('secondsToday');

        let is24HourFormat = false;
        let currentTheme = 0;

        const themes = [
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
            }
        ];

        // Crear estrellas
        function createStars() {
            const starsContainer = document.getElementById('stars');
            for (let i = 0; i < 100; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                star.style.left = Math.random() * 100 + '%';
                star.style.top = Math.random() * 100 + '%';
                star.style.animationDelay = Math.random() * 3 + 's';
                starsContainer.appendChild(star);
            }
        }

        // Crear marcas de minutos
        function createTicks() {
            const ticksContainer = document.getElementById('ticks');
            for (let i = 0; i < 60; i++) {
                const tick = document.createElement('div');
                tick.className = i % 5 === 0 ? 'tick major' : 'tick';
                tick.style.transform = `translateX(-50%) rotate(${i * 6}deg)`;
                ticksContainer.appendChild(tick);
            }
        }

        // Actualizar reloj
        function updateClock() {
            const now = new Date();
            
            // Obtener tiempo
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const seconds = now.getSeconds();
            const milliseconds = now.getMilliseconds();

            // Calcular ángulos (suave con milisegundos)
            const secondAngle = ((seconds + milliseconds / 1000) * 6); // 6 grados por segundo
            const minuteAngle = ((minutes + seconds / 60) * 6); // 6 grados por minuto
            const hourAngle = ((hours % 12 + minutes / 60) * 30); // 30 grados por hora

            // Aplicar rotación a las manecillas
            secondHand.style.transform = `rotate(${secondAngle}deg)`;
            minuteHand.style.transform = `rotate(${minuteAngle}deg)`;
            hourHand.style.transform = `rotate(${hourAngle}deg)`;

            // Actualizar reloj digital
            updateDigitalClock(now);
            
            // Actualizar fecha
            updateDate(now);
            
            // Actualizar saludo
            updateGreeting(hours);
            
            // Actualizar stats
            updateStats(now);
        }

        function updateDigitalClock(date) {
            let hours = date.getHours();
            const minutes = date.getMinutes();
            const seconds = date.getSeconds();
            
            let displayTime;
            if (!is24HourFormat) {
                const period = hours >= 12 ? ' PM' : ' AM';
                hours = hours % 12 || 12;
                displayTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}${period}`;
            } else {
                displayTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            }
            
            digitalTime.textContent = displayTime;
        }

        function updateDate(date) {
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            
            const dateString = date.toLocaleDateString('es-ES', options);
            dateDisplay.textContent = dateString.charAt(0).toUpperCase() + dateString.slice(1);
        }

        function updateGreeting(hour) {
            let greeting;
            
            if (hour >= 5 && hour < 12) {
                greeting = '☀️ Buenos días';
            } else if (hour >= 12 && hour < 19) {
                greeting = '🌤️ Buenas tardes';
            } else {
                greeting = '🌙 Buenas noches';
            }
            
            greetingDisplay.textContent = greeting;
        }

        function getDayOfYear(date) {
            const start = new Date(date.getFullYear(), 0, 0);
            const diff = date - start;
            const oneDay = 1000 * 60 * 60 * 24;
            return Math.floor(diff / oneDay);
        }

        function getWeekNumber(date) {
            const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            const dayNum = d.getUTCDay() || 7;
            d.setUTCDate(d.getUTCDate() + 4 - dayNum);
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        }

        function getSecondsToday(date) {
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const seconds = date.getSeconds();
            
            return (hours * 3600) + (minutes * 60) + seconds;
        }

        function updateStats(date) {
            dayOfYearDisplay.textContent = getDayOfYear(date);
            weekNumberDisplay.textContent = getWeekNumber(date);
            secondsTodayDisplay.textContent = getSecondsToday(date).toLocaleString();
        }

        function toggleFormat() {
            is24HourFormat = !is24HourFormat;
            formatText.textContent = is24HourFormat ? 'Cambiar a 12h' : 'Cambiar a 24h';
            updateClock();
        }

        function changeTheme() {
            currentTheme = (currentTheme + 1) % themes.length;
            document.body.style.background = themes[currentTheme].bg;
        }

        // Event listeners
        formatBtn.addEventListener('click', toggleFormat);
        themeBtn.addEventListener('click', changeTheme);

        // Inicializar
        createStars();
        createTicks();
        updateClock();

        // Actualizar cada 50ms para movimiento suave
        setInterval(updateClock, 50);

        console.log('⏰ Reloj analógico iniciado');
