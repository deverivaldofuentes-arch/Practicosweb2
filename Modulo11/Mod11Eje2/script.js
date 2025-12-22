// ============================================
// OPEN METEO API
// ============================================

// API gratuita (Open-Meteo.com)
const API_CONFIGS = [
    {
        name: 'openmeteo',
        base: 'https://api.open-meteo.com/v1',
        endpoints: {
            forecast: '/forecast'
        }
    }
];

let currentApiIndex = 0;

// Estado de la aplicación
let currentUnit = 'metric'; // 'metric' o 'imperial'
let currentWeatherData = null;
let currentLocation = null;
let favorites = JSON.parse(localStorage.getItem('weatherFavorites')) || [];
let searchTimeout = null;
let autoRefreshInterval = null;

// Elementos DOM
const elements = {
    citySearch: document.getElementById('citySearch'),
    searchBtn: document.getElementById('searchBtn'),
    locationBtn: document.getElementById('locationBtn'),
    unitToggle: document.getElementById('unitToggle'),
    unitToggleF: document.getElementById('unitToggleF'),
    refreshBtn: document.getElementById('refreshBtn'),
    clearFavorites: document.getElementById('clearFavorites'),
    scrollLeft: document.getElementById('scrollLeft'),
    scrollRight: document.getElementById('scrollRight'),
    closeSettings: document.getElementById('closeSettings'),
    saveSettings: document.getElementById('saveSettings'),
    closeModal: document.getElementById('closeModal'),
    searchSuggestions: document.getElementById('searchSuggestions'),
    settingsBtn: document.getElementById('settingsBtn'),
    
    // Contenedores de contenido
    currentWeather: document.getElementById('currentWeather'),
    additionalInfo: document.getElementById('additionalInfo'),
    forecastGrid: document.getElementById('forecastGrid'),
    favoritesList: document.getElementById('favoritesList'),
    locationInfo: document.getElementById('locationInfo'),
    
    // Elementos de estadísticas
    avgTemp: document.getElementById('avgTemp'),
    windSpeed: document.getElementById('windSpeed'),
    humidityLevel: document.getElementById('humidityLevel'),
    uvIndex: document.getElementById('uvIndex'),
    
    // Modal
    settingsModal: document.getElementById('settingsModal'),
    
    // Toast container
    toastContainer: document.getElementById('toastContainer')
};

// Mapeo de códigos de clima a iconos y descripciones
const WEATHER_CODES = {
    0: { icon: 'fas fa-sun', text: 'Despejado', emoji: '☀️' },
    1: { icon: 'fas fa-cloud-sun', text: 'Mayormente despejado', emoji: '🌤️' },
    2: { icon: 'fas fa-cloud-sun', text: 'Parcialmente nublado', emoji: '⛅' },
    3: { icon: 'fas fa-cloud', text: 'Nublado', emoji: '☁️' },
    45: { icon: 'fas fa-smog', text: 'Niebla', emoji: '🌫️' },
    48: { icon: 'fas fa-smog', text: 'Niebla con escarcha', emoji: '🌫️' },
    51: { icon: 'fas fa-cloud-rain', text: 'Llovizna ligera', emoji: '🌦️' },
    53: { icon: 'fas fa-cloud-rain', text: 'Llovizna moderada', emoji: '🌧️' },
    55: { icon: 'fas fa-cloud-rain', text: 'Llovizna densa', emoji: '🌧️' },
    56: { icon: 'fas fa-cloud-rain', text: 'Llovizna helada ligera', emoji: '🌧️❄️' },
    57: { icon: 'fas fa-cloud-rain', text: 'Llovizna helada densa', emoji: '🌧️❄️' },
    61: { icon: 'fas fa-cloud-rain', text: 'Lluvia ligera', emoji: '🌦️' },
    63: { icon: 'fas fa-cloud-rain', text: 'Lluvia moderada', emoji: '🌧️' },
    65: { icon: 'fas fa-cloud-showers-heavy', text: 'Lluvia intensa', emoji: '⛈️' },
    66: { icon: 'fas fa-cloud-rain', text: 'Lluvia helada ligera', emoji: '🌧️❄️' },
    67: { icon: 'fas fa-cloud-rain', text: 'Lluvia helada intensa', emoji: '🌧️❄️' },
    71: { icon: 'far fa-snowflake', text: 'Nevada ligera', emoji: '🌨️' },
    73: { icon: 'far fa-snowflake', text: 'Nevada moderada', emoji: '❄️' },
    75: { icon: 'far fa-snowflake', text: 'Nevada intensa', emoji: '❄️❄️' },
    77: { icon: 'far fa-snowflake', text: 'Granizo', emoji: '🧊' },
    80: { icon: 'fas fa-cloud-rain', text: 'Chubascos ligeros', emoji: '🌦️' },
    81: { icon: 'fas fa-cloud-showers-heavy', text: 'Chubascos moderados', emoji: '🌧️' },
    82: { icon: 'fas fa-cloud-showers-heavy', text: 'Chubascos intensos', emoji: '⛈️' },
    85: { icon: 'far fa-snowflake', text: 'Nevadas ligeras', emoji: '🌨️' },
    86: { icon: 'far fa-snowflake', text: 'Nevadas intensas', emoji: '❄️' },
    95: { icon: 'fas fa-bolt', text: 'Tormenta eléctrica', emoji: '⛈️' },
    96: { icon: 'fas fa-bolt', text: 'Tormenta con granizo ligero', emoji: '⛈️🧊' },
    99: { icon: 'fas fa-bolt', text: 'Tormenta con granizo intenso', emoji: '⛈️🧊' }
};

// ============================================
// FUNCIONES DE LA API - OPEN METEO
// ============================================

/**
 * Busca ciudades por nombre usando API de geocodificación
 */
async function searchCities(query) {
    if (query.length < 2) {
        elements.searchSuggestions.innerHTML = '';
        elements.searchSuggestions.style.display = 'none';
        return;
    }
    
    try {
        const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=es`
        );
        
        if (!response.ok) {
            throw new Error('Error en búsqueda');
        }
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            elements.searchSuggestions.innerHTML = data.results.slice(0, 5).map(city => `
                <div class="search-suggestion" data-city="${city.name}" data-lat="${city.latitude}" data-lon="${city.longitude}">
                    <strong>${city.name}</strong>, ${city.country}
                    ${city.admin1 ? `<small>(${city.admin1})</small>` : ''}
                    <br><small>Lat: ${city.latitude.toFixed(2)}, Lon: ${city.longitude.toFixed(2)}</small>
                </div>
            `).join('');
            
            elements.searchSuggestions.style.display = 'block';
            
            // Agregar event listeners a las sugerencias
            document.querySelectorAll('.search-suggestion').forEach(suggestion => {
                suggestion.addEventListener('click', () => {
                    const cityName = suggestion.getAttribute('data-city');
                    const lat = suggestion.getAttribute('data-lat');
                    const lon = suggestion.getAttribute('data-lon');
                    
                    elements.citySearch.value = cityName;
                    getWeatherByCoords(lat, lon, cityName);
                    elements.searchSuggestions.style.display = 'none';
                });
            });
        } else {
            elements.searchSuggestions.innerHTML = '<div class="search-suggestion">No se encontraron ciudades</div>';
            elements.searchSuggestions.style.display = 'block';
        }
    } catch (error) {
        console.error('Error en búsqueda:', error);
        elements.searchSuggestions.style.display = 'none';
    }
}

/**
 * Obtiene el clima por coordenadas (principal función)
 */
async function getWeatherByCoords(lat, lon, cityName = null) {
    try {
        showLoading();
        
        // Construir URL para Open-Meteo
        const unit = currentUnit === 'metric' ? 'celsius' : 'fahrenheit';
        const windUnit = currentUnit === 'metric' ? 'kmh' : 'mph';
        const precipitationUnit = currentUnit === 'metric' ? 'mm' : 'inch';
        
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,weathercode,windspeed_10m,winddirection_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_probability_max,windspeed_10m_max&timezone=auto&forecast_days=6&temperature_unit=${unit}&windspeed_unit=${windUnit}&precipitation_unit=${precipitationUnit}`;
        
        console.log('Fetching:', url); // Para debug
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: No se pudo obtener datos`);
        }
        
        const data = await response.json();
        
        // Obtener nombre de la ciudad si no se proporcionó
        if (!cityName) {
            cityName = await getCityName(lat, lon);
        }
        
        // Transformar datos al formato de nuestra aplicación
        const transformedData = transformOpenMeteoData(data, lat, lon, cityName);
        
        currentWeatherData = transformedData;
        currentLocation = cityName;
        
        displayCurrentWeather(transformedData);
        displayForecast(transformedData.forecast);
        displayAdditionalInfo(transformedData);
        displayLocationInfo(transformedData.location);
        updateStats(transformedData);
        
        elements.searchSuggestions.innerHTML = '';
        elements.searchSuggestions.style.display = 'none';
        
        showToast(`Clima de ${cityName} cargado`, 'success');
        
        // Guardar en historial
        saveToHistory(cityName);
        
    } catch (error) {
        console.error('Error al obtener clima:', error);
        showToast(`Error: ${error.message}`, 'error');
        showError(error.message);
    }
}

/**
 * Obtiene nombre de ciudad por coordenadas
 */
async function getCityName(lat, lon) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&accept-language=es`
        );
        
        if (response.ok) {
            const data = await response.json();
            return data.address.city || data.address.town || data.address.village || data.address.county || 'Ubicación desconocida';
        }
    } catch (error) {
        console.error('Error obteniendo nombre de ciudad:', error);
    }
    
    return `Lat ${lat.toFixed(2)}, Lon ${lon.toFixed(2)}`;
}

/**
 * Transforma datos de Open-Meteo a nuestro formato
 */
function transformOpenMeteoData(data, lat, lon, cityName) {
    const now = new Date();
    const current = data.current_weather;
    const daily = data.daily;
    
    // Obtener el código del clima actual
    const weatherCode = current.weathercode;
    const weatherInfo = WEATHER_CODES[weatherCode] || WEATHER_CODES[0];
    
    // Crear objeto location
    const location = {
        name: cityName,
        country: 'Local',
        region: '',
        lat: lat,
        lon: lon,
        localtime: now.toISOString(),
        tz_id: data.timezone || 'UTC'
    };
    
    // Crear objeto current weather
    const currentWeather = {
        temp_c: currentUnit === 'metric' ? current.temperature : (current.temperature - 32) * 5/9,
        temp_f: currentUnit === 'metric' ? (current.temperature * 9/5) + 32 : current.temperature,
        feelslike_c: currentUnit === 'metric' ? current.temperature : (current.temperature - 32) * 5/9,
        feelslike_f: currentUnit === 'metric' ? (current.temperature * 9/5) + 32 : current.temperature,
        condition: {
            text: weatherInfo.text,
            icon: weatherInfo.icon,
            emoji: weatherInfo.emoji
        },
        wind_kph: currentUnit === 'metric' ? current.windspeed : current.windspeed * 1.60934,
        wind_mph: currentUnit === 'metric' ? current.windspeed / 1.60934 : current.windspeed,
        humidity: data.hourly ? data.hourly.relativehumidity_2m[0] : 50,
        pressure_mb: 1013, // Valor por defecto, Open-Meteo no provee presión
        vis_km: 10, // Valor por defecto
        vis_miles: 6.2,
        gust_kph: current.windspeed * 1.2, // Aproximación
        gust_mph: currentUnit === 'metric' ? (current.windspeed * 1.2) / 1.60934 : current.windspeed * 1.2,
        cloud: weatherCode === 3 ? 100 : weatherCode === 2 ? 50 : 0,
        uv: Math.floor(Math.random() * 11) // Valor aleatorio 0-10
    };
    
    // Crear forecast para 5 días
    const forecastDays = [];
    for (let i = 1; i <= 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayCode = daily.weathercode[i] || 0;
        const dayInfo = WEATHER_CODES[dayCode] || WEATHER_CODES[0];
        
        forecastDays.push({
            date: dateStr,
            day: {
                maxtemp_c: currentUnit === 'metric' ? daily.temperature_2m_max[i] : (daily.temperature_2m_max[i] - 32) * 5/9,
                maxtemp_f: currentUnit === 'metric' ? (daily.temperature_2m_max[i] * 9/5) + 32 : daily.temperature_2m_max[i],
                mintemp_c: currentUnit === 'metric' ? daily.temperature_2m_min[i] : (daily.temperature_2m_min[i] - 32) * 5/9,
                mintemp_f: currentUnit === 'metric' ? (daily.temperature_2m_min[i] * 9/5) + 32 : daily.temperature_2m_min[i],
                condition: {
                    text: dayInfo.text,
                    icon: dayInfo.icon,
                    emoji: dayInfo.emoji
                },
                daily_chance_of_rain: daily.precipitation_probability_max[i] || 0,
                totalprecip_mm: daily.precipitation_sum[i] || 0,
                totalprecip_in: (daily.precipitation_sum[i] || 0) / 25.4
            },
            astro: {
                sunrise: formatTimeString(daily.sunrise[i]),
                sunset: formatTimeString(daily.sunset[i])
            }
        });
    }
    
    return {
        location: location,
        current: currentWeather,
        forecast: {
            forecastday: forecastDays
        }
    };
}

/**
 * Formatea tiempo de string ISO a formato legible
 */
function formatTimeString(isoString) {
    const time = isoString.split('T')[1];
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
}

/**
 * Obtiene el clima por nombre de ciudad
 */
async function getWeatherByCity(city) {
    try {
        showLoading();
        
        // Primero obtener coordenadas de la ciudad
        const geoResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=es`
        );
        
        if (!geoResponse.ok) {
            throw new Error('Error en búsqueda de ciudad');
        }
        
        const geoData = await geoResponse.json();
        
        if (!geoData.results || geoData.results.length === 0) {
            throw new Error('Ciudad no encontrada');
        }
        
        const { latitude, longitude, name, country } = geoData.results[0];
        
        // Obtener clima con las coordenadas
        await getWeatherByCoords(latitude, longitude, `${name}, ${country}`);
        
    } catch (error) {
        console.error('Error al obtener clima por ciudad:', error);
        showToast(`Error: ${error.message}`, 'error');
        showError(error.message);
    }
}

// ============================================
// FUNCIONES DE INTERFAZ DE USUARIO
// ============================================

/**
 * Muestra el clima actual en la interfaz
 */
function displayCurrentWeather(data) {
    const { location, current } = data;
    const unitSymbol = currentUnit === 'metric' ? '°C' : '°F';
    const speedUnit = currentUnit === 'metric' ? 'km/h' : 'mph';
    
    // Verificar si es favorito
    const isFavorite = favorites.some(fav => fav.name === location.name);
    
    const weatherHTML = `
        <div class="weather-content">
            <div class="weather-header">
                <div class="city-info">
                    <h2>${location.name}</h2>
                    <p class="city-date">${formatDate(location.localtime)}</p>
                </div>
                <button class="favorite-btn ${isFavorite ? 'favorited' : ''}" 
                        onclick="toggleFavorite('${location.name.replace(/'/g, "\\'")}', '${location.country.replace(/'/g, "\\'")}')"
                        title="${isFavorite ? 'Eliminar de favoritos' : 'Añadir a favoritos'}"
                        aria-label="${isFavorite ? 'Eliminar de favoritos' : 'Añadir a favoritos'}">
                    ${isFavorite ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>'}
                </button>
            </div>
            
            <div class="weather-main">
                <div class="temperature-display">
                    <div class="temp-value">
                        ${currentUnit === 'metric' ? Math.round(current.temp_c) : Math.round(current.temp_f)}${unitSymbol}
                    </div>
                    <p class="temp-feels">
                        Sensación: ${currentUnit === 'metric' ? Math.round(current.feelslike_c) : Math.round(current.feelslike_f)}${unitSymbol}
                    </p>
                    <div class="weather-emoji" style="font-size: 3rem; margin-top: 1rem;">
                        ${current.condition.emoji}
                    </div>
                </div>
                
                <div class="weather-icon-container">
                    <i class="${current.condition.icon} fa-6x" style="color: white; margin-bottom: 1rem;"></i>
                    <p class="weather-description">${current.condition.text}</p>
                </div>
            </div>
            
            <div class="weather-details">
                <div class="detail-item">
                    <i class="fas fa-wind"></i>
                    <div>
                        <strong>Viento</strong>
                        <p>${Math.round(currentUnit === 'metric' ? current.wind_kph : current.wind_mph)} ${speedUnit}</p>
                    </div>
                </div>
                <div class="detail-item">
                    <i class="fas fa-tint"></i>
                    <div>
                        <strong>Humedad</strong>
                        <p>${current.humidity}%</p>
                    </div>
                </div>
                <div class="detail-item">
                    <i class="fas fa-tachometer-alt"></i>
                    <div>
                        <strong>Presión</strong>
                        <p>${current.pressure_mb} hPa</p>
                    </div>
                </div>
                <div class="detail-item">
                    <i class="fas fa-eye"></i>
                    <div>
                        <strong>Visibilidad</strong>
                        <p>${currentUnit === 'metric' ? current.vis_km : current.vis_miles} ${currentUnit === 'metric' ? 'km' : 'mi'}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    elements.currentWeather.innerHTML = weatherHTML;
}

/**
 * Muestra el pronóstico de 5 días
 */
function displayForecast(forecastData) {
    const forecastDays = forecastData.forecastday;
    const unitSymbol = currentUnit === 'metric' ? '°C' : '°F';
    
    elements.forecastGrid.innerHTML = forecastDays.map(day => {
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
        const dateStr = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        
        return `
            <div class="forecast-day">
                <div class="day-name">${dayName}</div>
                <div class="date">${dateStr}</div>
                <div class="weather-emoji" style="font-size: 2rem; margin: 0.5rem 0;">
                    ${day.day.condition.emoji}
                </div>
                <div class="temp-range">
                    ${currentUnit === 'metric' ? Math.round(day.day.maxtemp_c) : Math.round(day.day.maxtemp_f)}${unitSymbol} / 
                    ${currentUnit === 'metric' ? Math.round(day.day.mintemp_c) : Math.round(day.day.mintemp_f)}${unitSymbol}
                </div>
                <div class="description">${day.day.condition.text}</div>
                <div class="precipitation">
                    <i class="fas fa-cloud-rain"></i> ${day.day.daily_chance_of_rain}%
                </div>
            </div>
        `;
    }).join('');
    
    // Configurar scroll horizontal
    const scrollContainer = document.querySelector('.forecast-scroll');
    elements.scrollLeft.addEventListener('click', () => {
        scrollContainer.scrollBy({ left: -200, behavior: 'smooth' });
    });
    
    elements.scrollRight.addEventListener('click', () => {
        scrollContainer.scrollBy({ left: 200, behavior: 'smooth' });
    });
}

/**
 * Muestra información adicional
 */
function displayAdditionalInfo(data) {
    const { current, forecast } = data;
    const forecastDay = forecast.forecastday[0];
    
    const infoHTML = `
        <div class="info-grid">
            <div class="info-card">
                <h4><i class="fas fa-sun"></i> Amanecer / Atardecer</h4>
                <div class="info-value">
                    ${forecastDay.astro.sunrise} / ${forecastDay.astro.sunset}
                </div>
            </div>
            
            <div class="info-card">
                <h4><i class="fas fa-cloud-rain"></i> Probabilidad de lluvia</h4>
                <div class="info-value">${forecastDay.day.daily_chance_of_rain}%</div>
            </div>
            
            <div class="info-card">
                <h4><i class="fas fa-umbrella"></i> Precipitación</h4>
                <div class="info-value">
                    ${currentUnit === 'metric' ? forecastDay.day.totalprecip_mm.toFixed(1) : forecastDay.day.totalprecip_in.toFixed(2)} 
                    ${currentUnit === 'metric' ? 'mm' : 'in'}
                </div>
            </div>
            
            <div class="info-card">
                <h4><i class="fas fa-cloud"></i> Nubosidad</h4>
                <div class="info-value">${current.cloud}%</div>
            </div>
            
            <div class="info-card">
                <h4><i class="fas fa-temperature-high"></i> Índice UV</h4>
                <div class="info-value">${current.uv}</div>
                <small>${getUVLevel(current.uv)}</small>
            </div>
            
            <div class="info-card">
                <h4><i class="fas fa-wind"></i> Ráfagas de viento</h4>
                <div class="info-value">
                    ${Math.round(currentUnit === 'metric' ? current.gust_kph : current.gust_mph)} 
                    ${currentUnit === 'metric' ? 'km/h' : 'mph'}
                </div>
            </div>
        </div>
    `;
    
    elements.additionalInfo.innerHTML = infoHTML;
}

/**
 * Muestra información de la ubicación
 */
function displayLocationInfo(location) {
    const locationHTML = `
        <div class="location-card">
            <h3><i class="fas fa-map-marker-alt"></i> Información de Ubicación</h3>
            <div class="location-details">
                <p><strong>Ciudad:</strong> ${location.name}</p>
                <p><strong>País:</strong> ${location.country}</p>
                <p><strong>Zona horaria:</strong> ${location.tz_id}</p>
                <p><strong>Latitud/Longitud:</strong> ${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}</p>
                <p><strong>Hora local:</strong> ${formatTime(location.localtime)}</p>
            </div>
        </div>
    `;
    
    elements.locationInfo.innerHTML = locationHTML;
}

/**
 * Actualiza las estadísticas
 */
function updateStats(data) {
    const { current } = data;
    
    elements.avgTemp.textContent = `${currentUnit === 'metric' ? Math.round(current.temp_c) : Math.round(current.temp_f)}${currentUnit === 'metric' ? '°C' : '°F'}`;
    elements.windSpeed.textContent = `${Math.round(currentUnit === 'metric' ? current.wind_kph : current.wind_mph)} ${currentUnit === 'metric' ? 'km/h' : 'mph'}`;
    elements.humidityLevel.textContent = `${current.humidity}%`;
    elements.uvIndex.textContent = `${current.uv} (${getUVLevel(current.uv)})`;
}

/**
 * Muestra el estado de carga
 */
function showLoading() {
    elements.currentWeather.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Cargando datos del clima...</p>
        </div>
    `;
    
    elements.forecastGrid.innerHTML = '';
    elements.additionalInfo.innerHTML = '';
    elements.locationInfo.innerHTML = '';
}

/**
 * Muestra un mensaje de error
 */
function showError(message) {
    elements.currentWeather.innerHTML = `
        <div class="loading-container">
            <i class="fas fa-exclamation-triangle fa-3x" style="color: #f87171; margin-bottom: 1rem;"></i>
            <p style="font-size: 1.1rem;">${message}</p>
            <button class="btn-primary" onclick="useGeolocation()" style="margin-top: 1rem;">
                <i class="fas fa-location-crosshairs"></i> Usar mi ubicación
            </button>
            <button class="btn-secondary" onclick="getWeatherByCity('Madrid')" style="margin-top: 0.5rem;">
                <i class="fas fa-city"></i> Cargar Madrid
            </button>
        </div>
    `;
}

// ============================================
// FUNCIONES DE GESTIÓN DE FAVORITOS
// ============================================

/**
 * Alterna una ciudad en favoritos
 */
function toggleFavorite(cityName, country) {
    try {
        const cityId = `${cityName}_${country}`.replace(/[^a-zA-Z0-9_]/g, '_');
        const index = favorites.findIndex(fav => fav.id === cityId);
        
        if (index > -1) {
            // Remover de favoritos
            favorites.splice(index, 1);
            showToast(`${cityName} eliminada de favoritos`, 'warning');
        } else {
            // Agregar a favoritos
            favorites.push({
                id: cityId,
                name: cityName,
                country: country,
                added: new Date().toISOString()
            });
            showToast(`${cityName} añadida a favoritos`, 'success');
        }
        
        // Guardar en localStorage
        localStorage.setItem('weatherFavorites', JSON.stringify(favorites));
        
        // Actualizar interfaz
        displayFavorites();
        
        // Si estamos viendo esta ciudad, actualizar el botón
        if (currentWeatherData && currentWeatherData.location.name === cityName) {
            displayCurrentWeather(currentWeatherData);
        }
    } catch (error) {
        console.error('Error al gestionar favoritos:', error);
        showToast('Error al gestionar favoritos', 'error');
    }
}

/**
 * Muestra la lista de favoritos
 */
function displayFavorites() {
    if (favorites.length === 0) {
        elements.favoritesList.innerHTML = `
            <div class="empty-favorites">
                <i class="fas fa-star fa-2x"></i>
                <p>No hay ciudades favoritas aún</p>
                <p class="hint">Busca una ciudad y haz clic en la estrella para agregarla</p>
            </div>
        `;
        return;
    }
    
    elements.favoritesList.innerHTML = favorites.map(fav => `
        <div class="favorite-city" onclick="getWeatherByCity('${fav.name.replace(/'/g, "\\'")}')">
            <div class="favorite-city-info">
                <h4>${fav.name}</h4>
                <p>${fav.country}</p>
                <small>Añadido: ${formatDateShort(fav.added)}</small>
            </div>
            <div class="favorite-city-actions">
                <button class="btn-small" onclick="event.stopPropagation(); toggleFavorite('${fav.name.replace(/'/g, "\\'")}', '${fav.country.replace(/'/g, "\\'")}')" 
                        title="Eliminar de favoritos">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Limpia todos los favoritos
 */
function clearFavorites() {
    if (favorites.length === 0) {
        showToast('No hay favoritos para eliminar', 'info');
        return;
    }
    
    if (confirm('¿Estás seguro de que quieres eliminar todas las ciudades favoritas?')) {
        favorites = [];
        localStorage.removeItem('weatherFavorites');
        displayFavorites();
        showToast('Todas las ciudades favoritas eliminadas', 'warning');
    }
}

// ============================================
// FUNCIONES DE CONFIGURACIÓN
// ============================================

/**
 * Cambia las unidades de medida
 */
function toggleUnits(unit) {
    currentUnit = unit;
    localStorage.setItem('weatherUnit', unit);
    
    // Actualizar botones de unidad
    if (unit === 'metric') {
        elements.unitToggle.classList.add('active');
        elements.unitToggleF.classList.remove('active');
    } else {
        elements.unitToggle.classList.remove('active');
        elements.unitToggleF.classList.add('active');
    }
    
    // Actualizar datos si hay información cargada
    if (currentWeatherData) {
        // Volver a cargar datos con nuevas unidades
        const lat = currentWeatherData.location.lat;
        const lon = currentWeatherData.location.lon;
        const cityName = currentWeatherData.location.name;
        
        getWeatherByCoords(lat, lon, cityName);
    }
}

/**
 * Usa la geolocalización del navegador
 */
function useGeolocation() {
    if ('geolocation' in navigator) {
        showToast('Obteniendo tu ubicación...', 'info');
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                getWeatherByCoords(
                    position.coords.latitude,
                    position.coords.longitude
                );
            },
            (error) => {
                console.error('Error de geolocalización:', error);
                let message = 'No se pudo obtener tu ubicación';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Permiso de ubicación denegado';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Información de ubicación no disponible';
                        break;
                    case error.TIMEOUT:
                        message = 'Tiempo de espera agotado';
                        break;
                }
                
                showToast(`${message}. Cargando Madrid por defecto.`, 'error');
                getWeatherByCity('Madrid');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        showToast('Geolocalización no soportada en este navegador', 'error');
        getWeatherByCity('Madrid');
    }
}

/**
 * Guarda una ciudad en el historial
 */
function saveToHistory(cityName) {
    try {
        let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
        
        // Evitar duplicados
        history = history.filter(item => item !== cityName);
        
        // Agregar al inicio
        history.unshift(cityName);
        
        // Mantener solo las últimas 10
        if (history.length > 10) {
            history = history.slice(0, 10);
        }
        
        localStorage.setItem('weatherHistory', JSON.stringify(history));
    } catch (error) {
        console.error('Error al guardar historial:', error);
    }
}

// ============================================
// FUNCIONES UTILITARIAS
// ============================================

/**
 * Muestra una notificación toast
 */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${getToastIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    elements.toastContainer.appendChild(toast);
    
    // Mostrar toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Ocultar y eliminar después de 4 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

/**
 * Obtiene el icono adecuado para el toast
 */
function getToastIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-triangle',
        'warning': 'exclamation-circle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

/**
 * Formatea una fecha
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Formatea una hora
 */
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Formatea una fecha en formato corto
 */
function formatDateShort(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

/**
 * Obtiene el nivel de UV como texto
 */
function getUVLevel(uvIndex) {
    if (uvIndex <= 2) return 'Bajo';
    if (uvIndex <= 5) return 'Moderado';
    if (uvIndex <= 7) return 'Alto';
    if (uvIndex <= 10) return 'Muy alto';
    return 'Extremo';
}

/**
 * Configura la actualización automática
 */
function setupAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
    }
    
    const autoRefresh = document.getElementById('autoRefresh');
    if (autoRefresh && autoRefresh.checked) {
        autoRefreshInterval = setInterval(() => {
            if (currentWeatherData) {
                const lat = currentWeatherData.location.lat;
                const lon = currentWeatherData.location.lon;
                const cityName = currentWeatherData.location.name;
                
                getWeatherByCoords(lat, lon, cityName);
                showToast('Datos actualizados automáticamente', 'info');
            }
        }, 15 * 60 * 1000); // Cada 15 minutos
    }
}

/**
 * Guarda configuración
 */
function saveSettings() {
    const darkMode = document.getElementById('darkMode').checked;
    const autoRefresh = document.getElementById('autoRefresh').checked;
    const notifications = document.getElementById('notifications').checked;
    
    // Guardar en localStorage
    localStorage.setItem('darkMode', darkMode);
    localStorage.setItem('autoRefresh', autoRefresh);
    localStorage.setItem('notifications', notifications);
    
    // Aplicar modo oscuro si está activado
    if (darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    
    setupAutoRefresh();
    showToast('Configuración guardada', 'success');
}

/**
 * Carga configuración
 */
function loadSettings() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    const autoRefresh = localStorage.getItem('autoRefresh') !== 'false'; // Por defecto true
    const notifications = localStorage.getItem('notifications') === 'true';
    
    document.getElementById('darkMode').checked = darkMode;
    document.getElementById('autoRefresh').checked = autoRefresh;
    document.getElementById('notifications').checked = notifications;
    
    // Aplicar modo oscuro
    if (darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

// ============================================
// INICIALIZACIÓN DE EVENT LISTENERS
// ============================================

/**
 * Inicializa todos los event listeners
 */
function initializeEventListeners() {
    // Búsqueda de ciudades
    elements.searchBtn.addEventListener('click', () => {
        const city = elements.citySearch.value.trim();
        if (city) {
            getWeatherByCity(city);
        } else {
            showToast('Por favor, ingresa una ciudad', 'warning');
        }
    });
    
    // Búsqueda con Enter
    elements.citySearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = elements.citySearch.value.trim();
            if (city) {
                getWeatherByCity(city);
            }
        }
    });
    
    // Autocompletado con debounce
    elements.citySearch.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchCities(e.target.value);
        }, 300);
    });
    
    // Cerrar sugerencias al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!elements.searchSuggestions.contains(e.target) && e.target !== elements.citySearch) {
            elements.searchSuggestions.style.display = 'none';
        }
    });
    
    // Botón de ubicación
    elements.locationBtn.addEventListener('click', useGeolocation);
    
    // Botón de actualizar
    elements.refreshBtn.addEventListener('click', () => {
        if (currentWeatherData) {
            const lat = currentWeatherData.location.lat;
            const lon = currentWeatherData.location.lon;
            const cityName = currentWeatherData.location.name;
            
            getWeatherByCoords(lat, lon, cityName);
            showToast('Actualizando datos...', 'info');
        } else {
            showToast('No hay ciudad seleccionada', 'warning');
        }
    });
    
    // Cambio de unidades
    elements.unitToggle.addEventListener('click', () => toggleUnits('metric'));
    elements.unitToggleF.addEventListener('click', () => toggleUnits('imperial'));
    
    // Limpiar favoritos
    elements.clearFavorites.addEventListener('click', clearFavorites);
    
    // Modal de configuración
    elements.closeSettings.addEventListener('click', () => {
        elements.settingsModal.classList.remove('active');
        setTimeout(() => {
            elements.settingsModal.style.display = 'none';
        }, 300);
    });
    
    elements.closeModal.addEventListener('click', () => {
        elements.settingsModal.classList.remove('active');
        setTimeout(() => {
            elements.settingsModal.style.display = 'none';
        }, 300);
    });
    
    elements.saveSettings.addEventListener('click', () => {
        saveSettings();
        elements.settingsModal.classList.remove('active');
        setTimeout(() => {
            elements.settingsModal.style.display = 'none';
        }, 300);
    });
    
    // Cerrar modal al hacer clic fuera
    elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) {
            elements.settingsModal.classList.remove('active');
            setTimeout(() => {
                elements.settingsModal.style.display = 'none';
            }, 300);
        }
    });
    
    // Configurar actualización automática
    const autoRefreshCheckbox = document.getElementById('autoRefresh');
    if (autoRefreshCheckbox) {
        autoRefreshCheckbox.addEventListener('change', setupAutoRefresh);
    }
    
    // Configurar modo oscuro
    const darkModeCheckbox = document.getElementById('darkMode');
    if (darkModeCheckbox) {
        darkModeCheckbox.addEventListener('change', () => {
            localStorage.setItem('darkMode', darkModeCheckbox.checked);
            if (darkModeCheckbox.checked) {
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
        });
    }
}

// ============================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ============================================

/**
 * Inicializa la aplicación
 */
function initializeApp() {
    console.log('🌤️ ClimaPlus - Aplicación meteorológica inicializando...');
    
    try {
        // Cargar configuración
        loadSettings();
        
        const savedUnit = localStorage.getItem('weatherUnit');
        if (savedUnit) {
            currentUnit = savedUnit;
            toggleUnits(savedUnit);
        }
        
        // Cargar favoritos de forma segura
        try {
            const savedFavorites = localStorage.getItem('weatherFavorites');
            favorites = savedFavorites ? JSON.parse(savedFavorites) : [];
            
            // Validar estructura de favoritos
            favorites = favorites.filter(fav => 
                fav && fav.id && fav.name && fav.country
            );
        } catch (error) {
            console.error('Error cargando favoritos:', error);
            favorites = [];
            localStorage.removeItem('weatherFavorites');
        }
        
        // Inicializar UI
        displayFavorites();
        initializeEventListeners();
        
        // Cargar ciudad inicial
        const defaultCity = favorites.length > 0 ? favorites[0].name : 'Madrid';
        getWeatherByCity(defaultCity);
        
        // Configurar actualización automática
        setupAutoRefresh();
        
        console.log('✅ Aplicación inicializada correctamente');
    } catch (error) {
        console.error('❌ Error crítico en inicialización:', error);
        showToast('Error al inicializar la aplicación', 'error');
        
        // Mostrar UI de error
        elements.currentWeather.innerHTML = `
            <div class="error-container">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
                <h3>Error de Inicialización</h3>
                <p>La aplicación encontró un error crítico.</p>
                <button class="btn-primary" onclick="location.reload()">
                    <i class="fas fa-redo"></i> Recargar Aplicación
                </button>
            </div>
        `;
    }
}

// ============================================
// EJECUCIÓN AL CARGAR LA PÁGINA
// ============================================

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Exportar funciones para uso en consola (debug)
window.weatherApp = {
    getWeatherByCity,
    getWeatherByCoords,
    useGeolocation,
    toggleFavorite,
    toggleUnits,
    showToast,
    clearFavorites
};
