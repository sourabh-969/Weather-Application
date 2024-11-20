const apiKey = '839272a6b4e47d466830cfdf3fa24dfd'; // "demonstration purposes only: Enter Your Own API_KEY "
// Get current Location button
const currentLocation = document.getElementById('currentLocation');
currentLocation.addEventListener('click', () => {
    clearExtendedForecast();
    getLocationWeather();
});

// Search input and history dropdown
const cityInput = document.getElementById('cityInput');
const historyDropdown = document.getElementById('historyDropdown');

// Load search history from sessionStorage
const searchHistory = JSON.parse(sessionStorage.getItem('searchHistory')) || [];

// Function to store search history
function storeSearchHistory(city) {
    if (!searchHistory.includes(city)) {
        searchHistory.push(city);
        sessionStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    }
}


// Function to display search history
function displaySearchHistory() {
    historyDropdown.innerHTML = '';
    if (searchHistory.length > 0) {
        // Limit to the last 8 entries
        const limitedHistory = searchHistory.slice(-8).reverse();
        limitedHistory.forEach(city => {
            const historyItem = document.createElement('div');
            historyItem.classList.add('ml-0', 'p-2', 'cursor-pointer', 'hover:bg-gray-200');

            // Create the Font Awesome icon element
            const icon = document.createElement('i');
            icon.classList.add('fa-solid', 'fa-arrow-rotate-left', 'mr-2');

            // Append the icon to the history item
            historyItem.appendChild(icon);

            // Set the city name
            historyItem.appendChild(document.createTextNode(city));

            historyItem.addEventListener('click', () => {
                cityInput.value = city;
                historyDropdown.classList.add('hidden'); // Hide the dropdown after selection
            });

            historyDropdown.appendChild(historyItem);
        });
        historyDropdown.classList.remove('hidden'); // Show the dropdown
    } else {
        historyDropdown.classList.add('hidden'); // Hide the dropdown if no history
    }
}


// Show search history when input is focused
cityInput.addEventListener('focus', displaySearchHistory);

// Hide history dropdown when clicking outside
document.addEventListener('click', (event) => {
    if (!historyDropdown.contains(event.target) && event.target !== cityInput) {
        historyDropdown.classList.add('hidden');
    }
});

// Fetch weather data when search button is clicked
document.getElementById('searchButton').addEventListener('click', () => {
    const cityName = cityInput.value;
    if (cityName) {
        clearExtendedForecast(); // Clear and hide extended forecast display
        fetchWeatherDataByCity(cityName);
        storeSearchHistory(cityName);
        cityInput.blur(); // Close the dropdown after selection
    } else {
        alert('Enter a valid city name');
    }
});

// Clear and hide extended forecast display
function clearExtendedForecast() {
    document.getElementById('extendedForecast').classList.add('hidden');
    document.getElementById('forecastDisplay').innerHTML = ''; // Clear previous data
}

// Get current location coordinates
function getLocationWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(fetchWeatherData, showError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

// Get current location data with coordinates
function fetchWeatherData(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            updateWeatherDisplay(data);
            document.getElementById('extendedForecastButton').classList.remove('hidden'); // Show button after getting current weather 
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
            alert("Error fetching weather data.");
        });

}

// Show error if geolocation fails
function showError(error) {
    alert(`Error: ${error.message}`);
}

// Fetch weather data by city name
function fetchWeatherDataByCity(cityName) {
    getCoordinates(cityName)
        .then(coords => {
            const lat = coords.lat;
            const lon = coords.lon;
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

            return fetch(url);
        })
        .then(response => response.json())
        .then(data => {
            updateWeatherDisplay(data);
            document.getElementById('extendedForecastButton').classList.remove('hidden'); // Show button after fetching weather
        })
        .catch(error => {
            console.error("Error fetching weather data:", error);
            alert("Error fetching weather data.");
        });
}

// Get coordinates of a city
function getCoordinates(cityName) {
    
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}&units=metric`;

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const lat = data[0].lat;
                const lon = data[0].lon;
                return { lat, lon };
            } else {
                throw new Error("City not found");
            }
        })
        .catch(error => {
            console.error("Error fetching coordinates:", error);
            alert("Error fetching coordinates.");
        });
}

// Update weather display with fetched data
function updateWeatherDisplay(data) {
    const date = new Date(data.dt * 1000).toLocaleDateString();
    document.getElementById('dateTime').textContent = `${date}`;
    document.getElementById('cityName').textContent = `City: ${data.name}`;
    document.getElementById('condition').textContent = `Forecast: ${data.weather[0].description}`;
    document.getElementById('temperature').textContent = `Temp: ${data.main.temp} °C`;
    document.getElementById('wind').textContent = `Wind: ${data.wind.speed} m/s`;
    document.getElementById('humidity').textContent = `Humidity: ${data.main.humidity}%`;

    const img = document.getElementById('icon');
    img.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    document.getElementById('weatherDisplay').classList.remove('hidden');
}

// Extended Forecast Button
document.getElementById('extendedForecastButton').addEventListener('click', () => {
    const cityName = document.getElementById('cityName').textContent.split(": ")[1];
    if (cityName) {
        fetchExtendedForecast(cityName);
    } else {
        alert('Please enter a valid city name to view the extended forecast.');
    }
});

// Fetch extended forecast data
function fetchExtendedForecast(cityName) {
    getCoordinates(cityName)
        .then(coords => {
            const lat = coords.lat;
            const lon = coords.lon;
            
            const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

            return fetch(url);
        })
        .then(response => response.json())
        .then(data => {
            updateForecastDisplay(data);
        })
        .catch(error => {
            console.error("Error fetching extended forecast data:", error);
            alert("Error fetching extended forecast data.");
        });
}

// Update forecast display with fetched data
function updateForecastDisplay(data) {
    const forecastDisplay = document.getElementById('forecastDisplay');
    const seenDates = new Set();

    // Clear previous data efficiently
    forecastDisplay.textContent = ''; // Removes all child elements

    // Set styles for vertical scroll


    data.list.forEach(item => {
        const date = new Date(item.dt * 1000).toLocaleDateString();

        // Skip past and duplicate dates
        if (seenDates.has(date) || new Date(item.dt * 1000) <= new Date()) return;

        seenDates.add(date);

        // Create forecast item with template literal
        const forecastItem = document.createElement('div');
        forecastItem.classList.add(...[
            'bg-white',
            'bg-opacity-20',
            'p-4',
            'rounded-lg',
            'shadow-lg',
            'transition',
            'transform',
            'hover:scale-105',
            'duration-300',
        ]);

        const responsiveScales = {
            md: 'scale-102',
            lg: 'scale-105',
            xl: 'scale-110',
        };

        // Add responsive hover scales dynamically
        Object.entries(responsiveScales).forEach(([breakpoint, scale]) => {
            forecastItem.classList.add(`${breakpoint}:hover:${scale}`);
        });

        // Create forecast content using template literal (no change)
        const forecastContent = `
             <div class=" grid grid-cols-4 grid-rows-3 justify-evenly items-center  w-full rounded-lg md:grid md:grid-cols-5 md:grid-rows-none md:justify-center md:items-end md:h-full">
        <div class=" col-start-1 row-span-3 flex flex-col justify-center items-center md:w-full md:col-start-1  md:col-end-1 md:flex md:flex-col-reverse md:justify-start">
            <div class="p-2 pb-0 mb-0 ">${date}</div>
            <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="icon" class="pt-0 mt-0 w-16 h-16 animate-pulse md:hidden">
        </div>

        <div class="col-start-2 col-span-3 text-center font-doto text-xl text-black md:gap-2 md:col-start-2  md:col-end-2 md:flex md:flex-row md:justify-center md:items-center">
            <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png" alt="icon" class="max-sm:hidden md:visible md:w-10 md:h-8"><div class="text-sm text-left text-wrap font-thin m-auto w-32">${item.weather[0].description}</div>
        </div>

        <div class=" col-start-2 row-span-2 flex flex-col justify-center items-center md:flex md:flex-row md:w-fit md:justify-center md:pl-3  md:col-start-3  md:col-end-3 md:ml-2">
            <i class="fa-duotone fa-solid fa-temperature-high w-fit h-fit text-2xl m-auto  flex justify-center items-center  md:text-xl " style="--fa-primary-color: #e22c2c; --fa-secondary-color: #009afa;"></i>
            <div class="text-center mt-0 pt-0 ">${item.main.temp}°C</div>
        </div>

        <div class=" col-start-3 row-span-2 flex flex-col justify-center items-center md:flex md:flex-row md:w-fit md:justify-center  md:col-start-4  md:col-end-4">
            <i class="fa-solid fa-wind w-fit h-fit m-auto text-2xl flex justify-center items-center  md:text-xl "></i>
            <div class="text-center mt-0 pt-0">${item.wind.speed}m/s</div>
        </div>

        <div class=" col-start-4 row-span-2 flex flex-col justify-center items-center md:flex md:flex-row md:w-fit md:justify-center  md:col-start-5  md:col-end-5">
<svg fill="#000000" width="20px" height="28px" viewBox="0 0 64 64" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">

<g id="cloudy_sunny"/>

<g id="bright"/>

<g id="cloudy"/>

<g id="high_rainfall"/>

<g id="windy"/>

<g id="rain_with_thunder"/>

<g id="clear_night"/>

<g id="cloudy_night"/>

<g id="moon"/>

<g id="sun"/>

<g id="rainy_night"/>

<g id="windy_night"/>

<g id="night_rain_thunder"/>

<g id="windy_rain"/>

<g id="temperature"/>

<g id="humidity">

<g>

<path d="M49.7,35.9C47.3,21.2,29.5,4,28.7,3.3c-0.4-0.4-1-0.4-1.4,0C26.4,4.1,6,23.7,6,39c0,12.1,9.9,22,22,22    c3.4,0,6.7-0.8,9.7-2.3c2.1,1.4,4.6,2.3,7.3,2.3c7.2,0,13-5.8,13-13C58,42.5,54.6,37.8,49.7,35.9z M28,59C17,59,8,50,8,39    C8,26.1,24.4,9,28,5.4C31.3,8.7,45,23,47.6,35.3C46.7,35.1,45.9,35,45,35c-7.2,0-13,5.8-13,13c0,3.7,1.5,7,4,9.3    C33.5,58.4,30.8,59,28,59z M45,59c-6.1,0-11-4.9-11-11s4.9-11,11-11s11,4.9,11,11S51.1,59,45,59z"/>

<path d="M28,54c-8.3,0-15-6.7-15-15c0-0.6-0.4-1-1-1s-1,0.4-1,1c0,9.4,7.6,17,17,17c0.6,0,1-0.4,1-1S28.6,54,28,54z"/>

<path d="M48.4,40.1c-0.5-0.2-1.1,0-1.3,0.5l-6,14c-0.2,0.5,0,1.1,0.5,1.3C41.7,56,41.9,56,42,56c0.4,0,0.8-0.2,0.9-0.6l6-14    C49.1,40.9,48.9,40.3,48.4,40.1z"/>

<path d="M44,44c0-1.7-1.3-3-3-3s-3,1.3-3,3s1.3,3,3,3S44,45.7,44,44z M40,44c0-0.6,0.4-1,1-1s1,0.4,1,1s-0.4,1-1,1S40,44.6,40,44z    "/>

<path d="M49,49c-1.7,0-3,1.3-3,3s1.3,3,3,3s3-1.3,3-3S50.7,49,49,49z M49,53c-0.6,0-1-0.4-1-1s0.4-1,1-1s1,0.4,1,1S49.6,53,49,53z    "/>

</g>

</g>

<g id="air_pressure"/>

<g id="low_rainfall"/>

<g id="moderate_rainfall"/>

<g id="Sunset"/>

</svg> <div class="text-center mt-0 pt-0">${item.main.humidity}%</div>
        </div>
      </div>
      `;

        forecastItem.innerHTML = forecastContent;
        forecastDisplay.appendChild(forecastItem);
    });

    document.getElementById('extendedForecast').classList.remove('hidden');
    document.getElementById('extendedForecastButton').classList.add('hidden');
}
