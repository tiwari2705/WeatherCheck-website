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
        if (mainNav.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });
}

// Tab functionality
if (tabBtns.length > 0) {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(`${tabId}Tab`).classList.add('active');
        });
    });
}

// Search form submission
if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const city = searchInput.value.trim();
        if (city) {
            loadWeatherData(city);
        }
    });
}

// Sign in form submission
const signInForm = document.getElementById('signInForm');
if (signInForm) {
    signInForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        console.log('Sign in attempt:', { email, password });
        alert('Sign in functionality would be implemented in a real application.');
    });
}

// Get weather icon class based on weather code
function getWeatherIcon(weatherCode) {
    if (weatherCode >= 200 && weatherCode < 300) return 'bolt';
    if (weatherCode >= 300 && weatherCode < 400) return 'cloud-rain';
    if (weatherCode >= 500 && weatherCode < 600) return 'cloud-showers-heavy';
    if (weatherCode >= 600 && weatherCode < 700) return 'snowflake';
    if (weatherCode >= 700 && weatherCode < 800) return 'smog';
    if (weatherCode === 800) return 'sun';
    if (weatherCode > 800) return 'cloud';
    return 'cloud';
}

// Convert temperature from Kelvin to Celsius
function kelvinToCelsius(kelvin) {
    return Math.round(kelvin - 273.15);
}

// Format date for forecast
function formatDay(timestamp) {
    const date = new Date(timestamp * 1000);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
}

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
        const weatherIcon = document.querySelector('.weather-icon i');
        weatherIcon.className = '';
        weatherIcon.classList.add('fas', `fa-${getWeatherIcon(data.weather[0].id)}`);
        return data.coord;
    } catch (error) {
        console.error('Error fetching current weather:', error);
        showError(error.message);
        return null;
    }
}

// Load weather data function
async function loadWeatherData(city) {
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';
    loadingOverlay.style.display = 'flex';
    try {
        const coords = await loadCurrentWeather(city);
        if (coords) {
            await loadForecastData(coords.lat, coords.lon);
        }
    } catch (error) {
        console.error('Error loading weather data:', error);
        /*showError('Failed to load weather data. Please try again.');*/
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
    if (document.querySelector('.weather-container')) {
        const style = document.createElement('style');
        style.textContent = `
            .error-message {
                background-color: #fee2e2;
                color: #b91c1c;
                padding: 0.75rem;
                border-radius: 0.25rem;
                margin-bottom: 1rem;
                display: none;
            }
        `;
        document.head.appendChild(style);
        loadWeatherData('Varanasi');
    }
});
