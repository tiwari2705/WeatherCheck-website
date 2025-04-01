// API Configuration
const API_KEY = '9e8a41f9b00e4b2feadfeb194cc2be78'; // Replace with your OpenWeatherMap API key
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mainNav = document.getElementById('mainNav');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const loadingOverlay = document.getElementById('loadingOverlay');
const currentYearElements = document.querySelectorAll('#currentYear');
const forecastGrid = document.getElementById('forecastGrid');
const errorMessage = document.createElement('div');
errorMessage.className = 'error-message';
document.querySelector('.weather-container').appendChild(errorMessage);

// Set current year in footer
currentYearElements.forEach(el => {
    el.textContent = new Date().getFullYear();
});

// Mobile menu toggle
if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        mainNav.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });
}

// Tab functionality
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`${btn.getAttribute('data-tab')}Tab`).classList.add('active');
    });
});

// Search form submission
searchForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = searchInput.value.trim();
    if (city) loadWeatherData(city);
});

// Get weather icon class based on weather code
function getWeatherIcon(weatherCode) {
    const icons = {
        2: 'bolt', 3: 'cloud-rain', 5: 'cloud-showers-heavy',
        6: 'snowflake', 7: 'smog', 8: 'sun',
    };
    return `fa-${icons[Math.floor(weatherCode / 100)] || 'cloud'}`;
}

// Convert temperature from Kelvin to Celsius
const kelvinToCelsius = kelvin => Math.round(kelvin - 273.15);

// Format date for forecast
const formatDay = timestamp => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(timestamp * 1000).getDay()];

// Load current weather data
async function loadCurrentWeather(city) {
    try {
        const response = await fetch(`${WEATHER_API_URL}/weather?q=${city}&appid=${API_KEY}`);
        if (!response.ok) throw new Error(`Error: ${response.statusText}`);
        const data = await response.json();
        document.getElementById('cityName').textContent = data.name;
        document.getElementById('forecastCityName').textContent = data.name;
        document.getElementById('currentTemp').textContent = `${kelvinToCelsius(data.main.temp)}°C`;
        document.getElementById('weatherDesc').textContent = data.weather[0].description;
        document.getElementById('feelsLike').textContent = `${kelvinToCelsius(data.main.feels_like)}°C`;
        document.getElementById('windSpeed').textContent = `${Math.round(data.wind.speed)} mph`;
        document.getElementById('humidity').textContent = `${data.main.humidity}%`;
        document.querySelector('.weather-icon i').className = `fas ${getWeatherIcon(data.weather[0].id)}`;
        return data.coord;
    } catch (error) {
        console.error('Error fetching current weather:', error);
        showError(error.message);
    }
}

// Load 7-day forecast data
async function loadForecastData(lat, lon) {
    try {
        const response = await fetch(`${WEATHER_API_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        if (!response.ok) throw new Error('Error fetching forecast');
        const data = await response.json();
        forecastGrid.innerHTML = '';
        const dailyData = {};
        data.list.forEach(item => {
            const date = item.dt_txt.split(' ')[0];
            if (!dailyData[date]) dailyData[date] = item;
        });
        Object.values(dailyData).slice(0, 7).forEach(day => {
            const forecastItem = document.createElement('div');
            forecastItem.classList.add('forecast-item');
            forecastItem.innerHTML = `
                <p>${formatDay(day.dt)}</p>
                <i class="fas ${getWeatherIcon(day.weather[0].id)}"></i>
                <p>${Math.round(day.main.temp)}°C</p>
                <p>${day.weather[0].description}</p>
            `;
            forecastGrid.appendChild(forecastItem);
        });
    } catch (error) {
        console.error('Error fetching forecast:', error);
        showError('Could not load forecast data');
    }
}

// Load weather data
async function loadWeatherData(city) {
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
    loadingOverlay.style.display = 'flex';
    try {
        const coords = await loadCurrentWeather(city);
        if (coords) await loadForecastData(coords.lat, coords.lon);
    } catch (error) {
        console.error('Error loading weather data:', error);
    } finally {
        loadingOverlay.style.display = 'none';
    }
}

// Show error message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Load weather data on page load
document.addEventListener('DOMContentLoaded', () => {
    document.head.insertAdjacentHTML('beforeend', `
        <style>
            .error-message { background-color: #fee2e2; color: #b91c1c; padding: 0.75rem; border-radius: 0.25rem; margin-bottom: 1rem; display: none; }
        </style>
    `);
    loadWeatherData('Varanasi');
});
