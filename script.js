// OpenWeatherMap API anahtarınızı buraya ekleyin
// 1. https://home.openweathermap.org/users/sign_up adresinden ücretsiz hesap oluşturun
// 2. https://home.openweathermap.org/api_keys adresinden API anahtarı alın
// 3. Aşağıdaki API_KEY değişkenine API anahtarınızı yapıştırın
const API_KEY = 'c732948f966e2e0b7826610640ad79d2';
const DEFAULT_CITY = 'Istanbul';

// Hava durumu ikonları ve açıklamaları
const weatherIcons = {
    '01d': { icon: 'fas fa-sun', description: 'Açık', color: '#FFD700' },
    '01n': { icon: 'fas fa-moon', description: 'Açık (Gece)', color: '#4A5568' },
    '02d': { icon: 'fas fa-cloud-sun', description: 'Parçalı Bulutlu', color: '#A0AEC0' },
    '02n': { icon: 'fas fa-cloud-moon', description: 'Parçalı Bulutlu (Gece)', color: '#718096' },
    '03d': { icon: 'fas fa-cloud', description: 'Bulutlu', color: '#718096' },
    '03n': { icon: 'fas fa-cloud', description: 'Bulutlu (Gece)', color: '#4A5568' },
    '04d': { icon: 'fas fa-cloud', description: 'Çok Bulutlu', color: '#4A5568' },
    '04n': { icon: 'fas fa-cloud', description: 'Çok Bulutlu (Gece)', color: '#2D3748' },
    '09d': { icon: 'fas fa-cloud-showers-heavy', description: 'Sağanak Yağışlı', color: '#4299E1' },
    '09n': { icon: 'fas fa-cloud-showers-heavy', description: 'Sağanak Yağışlı (Gece)', color: '#2B6CB0' },
    '10d': { icon: 'fas fa-cloud-sun-rain', description: 'Yağmurlu', color: '#63B3ED' },
    '10n': { icon: 'fas fa-cloud-moon-rain', description: 'Yağmurlu (Gece)', color: '#4299E1' },
    '11d': { icon: 'fas fa-bolt', description: 'Gök Gürültülü Fırtına', color: '#ECC94B' },
    '11n': { icon: 'fas fa-bolt', description: 'Gök Gürültülü Fırtına (Gece)', color: '#D69E2E' },
    '13d': { icon: 'fas fa-snowflake', description: 'Karlı', color: '#E2E8F0' },
    '13n': { icon: 'fas fa-snowflake', description: 'Karlı (Gece)', color: '#CBD5E0' },
    '50d': { icon: 'fas fa-smog', description: 'Sisli', color: '#A0AEC0' },
    '50n': { icon: 'fas fa-smog', description: 'Sisli (Gece)', color: '#718096' }
};

// DOM elementleri
const searchForm = document.getElementById('searchForm');
const cityInput = document.getElementById('cityInput');
const cityName = document.querySelector('.city-name');
const weatherIcon = document.querySelector('.weather-icon');
const temperature = document.querySelector('.temp');
const weatherDesc = document.querySelector('.weather-desc');
const windSpeed = document.querySelector('.wind');
const humidity = document.querySelector('.humidity');
const forecastContainer = document.getElementById('forecast');
const hourlyForecastContainer = document.getElementById('hourly-forecast');

// Tab değişikliğini dinle
const tabs = document.querySelectorAll('[data-bs-toggle="tab"]');
tabs.forEach(tab => {
    tab.addEventListener('shown.bs.tab', (event) => {
        const targetId = event.target.getAttribute('data-bs-target');
        const lat = lastKnownPosition?.latitude || 41.0082;
        const lon = lastKnownPosition?.longitude || 28.9784;

        switch(targetId) {
            case '#hourly':
                updateDetailedHourlyForecast();
                break;
            case '#daily':
                updateDetailedDailyForecast();
                break;
            case '#radar':
                updateDetailedRadarMap();
                break;
            case '#minutecast':
                updateDetailedMinuteCast(lat, lon);
                break;
            case '#monthly':
                updateDetailedMonthlyForecast();
                break;
            case '#airquality':
                updateDetailedAirQuality(lat, lon);
                break;
            case '#health':
                updateDetailedHealthData(lat, lon);
                break;
        }
    });
});

// Son bilinen konum
let lastKnownPosition = null;

// Sayfa yüklendiğinde kullanıcının konumunu al
document.addEventListener('DOMContentLoaded', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                lastKnownPosition = { latitude, longitude };
                getWeatherDataByCoords(latitude, longitude);
                initializeMaps(latitude, longitude);
                getAirQuality(latitude, longitude);
                getHealthData(latitude, longitude);
            },
            (error) => {
                console.error('Konum alınamadı:', error);
                getWeatherData(DEFAULT_CITY);
                initializeMaps(41.0082, 28.9784);
            }
        );
    } else {
        console.log('Tarayıcınız konum özelliğini desteklemiyor');
        getWeatherData(DEFAULT_CITY);
        initializeMaps(41.0082, 28.9784);
    }
});

// Koordinatlara göre hava durumu verilerini al
async function getWeatherDataByCoords(lat, lon) {
    try {
        // Mevcut hava durumu
        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=tr`;
        const currentWeatherResponse = await fetch(currentWeatherUrl);
        const currentWeatherData = await currentWeatherResponse.json();

        if (currentWeatherResponse.ok) {
            updateCurrentWeather(currentWeatherData);

            // 5 günlük tahmin
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=tr`;
            const forecastResponse = await fetch(forecastUrl);
            const forecastData = await forecastResponse.json();

            if (forecastResponse.ok) {
                updateForecast(forecastData);
                updateHourlyForecast(forecastData);
            }
        } else {
            throw new Error(currentWeatherData.message);
        }
    } catch (error) {
        alert('Hava durumu bilgisi alınamadı: ' + error.message);
    }
}

// Dünya şehirleri
const worldCities = [
    { name: 'New York, ABD', lat: 40.7128, lon: -74.0060 },
    { name: 'Londra, İngiltere', lat: 51.5074, lon: -0.1278 },
    { name: 'Paris, Fransa', lat: 48.8566, lon: 2.3522 },
    { name: 'Tokyo, Japonya', lat: 35.6762, lon: 139.6503 },
    { name: 'Dubai, BAE', lat: 25.2048, lon: 55.2708 },
    { name: 'Roma, İtalya', lat: 41.9028, lon: 12.4964 },
    { name: 'Barcelona, İspanya', lat: 41.3851, lon: 2.1734 },
    { name: 'Amsterdam, Hollanda', lat: 52.3676, lon: 4.9041 },
    { name: 'Berlin, Almanya', lat: 52.5200, lon: 13.4050 },
    { name: 'Viyana, Avusturya', lat: 48.2082, lon: 16.3738 },
    { name: 'Moskova, Rusya', lat: 55.7558, lon: 37.6173 },
    { name: 'Pekin, Çin', lat: 39.9042, lon: 116.4074 },
    { name: 'Seul, Güney Kore', lat: 37.5665, lon: 126.9780 },
    { name: 'Sydney, Avustralya', lat: -33.8688, lon: 151.2093 },
    { name: 'Rio de Janeiro, Brezilya', lat: -22.9068, lon: -43.1729 },
    { name: 'Cape Town, Güney Afrika', lat: -33.9249, lon: 18.4241 },
    { name: 'Mumbai, Hindistan', lat: 19.0760, lon: 72.8777 },
    { name: 'Singapur', lat: 1.3521, lon: 103.8198 },
    { name: 'Toronto, Kanada', lat: 43.6532, lon: -79.3832 },
    { name: 'Mexico City, Meksika', lat: 19.4326, lon: -99.1332 },
    { name: 'Cairo, Mısır', lat: 30.0444, lon: 31.2357 },
    { name: 'Athens, Yunanistan', lat: 37.9838, lon: 23.7275 },
    { name: 'Stockholm, İsveç', lat: 59.3293, lon: 18.0686 },
    { name: 'Oslo, Norveç', lat: 59.9139, lon: 10.7522 },
    { name: 'Helsinki, Finlandiya', lat: 60.1699, lon: 24.9384 },
    { name: 'Kopenhag, Danimarka', lat: 55.6761, lon: 12.5683 },
    { name: 'Prag, Çek Cumhuriyeti', lat: 50.0755, lon: 14.4378 },
    { name: 'Budapeşte, Macaristan', lat: 47.4979, lon: 19.0402 },
    { name: 'Varşova, Polonya', lat: 52.2297, lon: 21.0122 },
    { name: 'Buenos Aires, Arjantin', lat: -34.6037, lon: -58.3816 }
];

// Arama işlevselliği güncelleme
window.cityInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    if (searchTerm.length < 2) {
        window.searchResults.style.display = 'none';
        return;
    }

    let matchedLocations = [];

    // Türkiye şehirleri ve ilçeleri arama
    turkishLocations.forEach(city => {
        if (city.name.toLowerCase().includes(searchTerm)) {
            matchedLocations.push({
                name: city.name,
                lat: city.lat,
                lon: city.lon,
                type: 'city',
                country: 'Türkiye'
            });
        }

        if (city.districts) {
            city.districts.forEach(district => {
                if (district.name.toLowerCase().includes(searchTerm)) {
                    matchedLocations.push({
                        name: `${district.name}, ${city.name}`,
                        lat: district.lat,
                        lon: district.lon,
                        type: 'district',
                        country: 'Türkiye'
                    });
                }
            });
        }
    });

    // Dünya şehirleri arama
    worldCities.forEach(city => {
        if (city.name.toLowerCase().includes(searchTerm)) {
            matchedLocations.push({
                name: city.name,
                lat: city.lat,
                lon: city.lon,
                type: 'world-city',
                country: city.name.split(', ')[1]
            });
        }
    });

    if (matchedLocations.length > 0) {
        // Sonuçları gruplandır
        const groupedResults = {
            turkey: matchedLocations.filter(loc => loc.country === 'Türkiye'),
            world: matchedLocations.filter(loc => loc.country !== 'Türkiye')
        };

        // Sonuçları HTML olarak oluştur
        let resultsHTML = '';

        // Türkiye sonuçları
        if (groupedResults.turkey.length > 0) {
            resultsHTML += '<div class="search-group"><div class="search-group-title">Türkiye</div>';
            resultsHTML += groupedResults.turkey.map(location => `
                <div class="p-2 search-result ${location.type}" style="cursor: pointer;" 
                     data-name="${location.name}" 
                     data-lat="${location.lat}" 
                     data-lon="${location.lon}">
                    <i class="fas fa-${location.type === 'city' ? 'city' : 'map-marker-alt'} text-primary me-2"></i>
                    ${location.name}
                </div>
            `).join('');
            resultsHTML += '</div>';
        }

        // Dünya şehirleri sonuçları
        if (groupedResults.world.length > 0) {
            resultsHTML += '<div class="search-group"><div class="search-group-title">Dünya</div>';
            resultsHTML += groupedResults.world.map(location => `
                <div class="p-2 search-result world-city" style="cursor: pointer;" 
                     data-name="${location.name}" 
                     data-lat="${location.lat}" 
                     data-lon="${location.lon}">
                    <i class="fas fa-globe text-primary me-2"></i>
                    ${location.name}
                </div>
            `).join('');
            resultsHTML += '</div>';
        }

        window.searchResults.innerHTML = resultsHTML;
        window.searchResults.style.display = 'block';

        // Konum seçme olayını ekle
        document.querySelectorAll('.search-result').forEach(result => {
            result.addEventListener('click', () => {
                const name = result.dataset.name;
                const lat = parseFloat(result.dataset.lat);
                const lon = parseFloat(result.dataset.lon);
                
                window.cityInput.value = name;
                window.searchResults.style.display = 'none';
                selectedCity = { name, lat, lon };
                
                // Seçilen konum için hava durumu ve harita verilerini güncelle
                getWeatherDataByCoords(lat, lon);
                updateMaps(lat, lon);
            });
        });
    } else {
        window.searchResults.style.display = 'none';
    }
});

// Sayfa dışına tıklandığında sonuçları gizle
document.addEventListener('click', (e) => {
    if (!e.target.closest('#searchForm')) {
        window.searchResults.style.display = 'none';
    }
});

// Haritaları güncelle
function updateMaps(lat, lon) {
    // Konum haritası
    const locationMap = new ol.Map({
        target: 'location-map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([lon, lat]),
            zoom: 10
        })
    });

    // Konum işaretleyicisi
    const marker = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
    });

    const vectorSource = new ol.source.Vector({
        features: [marker]
    });

    const markerLayer = new ol.layer.Vector({
        source: vectorSource,
        style: new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 1],
                src: 'https://openlayers.org/en/latest/examples/data/icon.png'
            })
        })
    });

    locationMap.addLayer(markerLayer);

    // Radar haritası
    const weatherMap = new ol.Map({
        target: 'weather-map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([lon, lat]),
            zoom: 8
        })
    });

    // Radar katmanları
    const layers = {
        precipitation: new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
                crossOrigin: 'anonymous'
            }),
            opacity: 0.7,
            visible: true
        }),
        clouds: new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
                crossOrigin: 'anonymous'
            }),
            opacity: 0.7,
            visible: false
        }),
        temp: new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
                crossOrigin: 'anonymous'
            }),
            opacity: 0.7,
            visible: false
        }),
        wind: new ol.layer.Tile({
            source: new ol.source.XYZ({
                url: `https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${API_KEY}`,
                crossOrigin: 'anonymous'
            }),
            opacity: 0.7,
            visible: false
        })
    };

    // Tüm katmanları haritaya ekle
    Object.values(layers).forEach(layer => {
        weatherMap.addLayer(layer);
    });

    // Radar kontrolleri
    const mapContainer = document.getElementById('weather-map').parentElement;
    const existingControls = mapContainer.querySelector('.radar-controls');
    if (existingControls) {
        existingControls.remove();
    }

    const controls = document.createElement('div');
    controls.className = 'radar-controls mt-3';
    controls.innerHTML = `
        <div class="btn-group" role="group">
            <button type="button" class="btn btn-primary active" data-layer="precipitation">Yağış</button>
            <button type="button" class="btn btn-primary" data-layer="clouds">Bulut</button>
            <button type="button" class="btn btn-primary" data-layer="temp">Sıcaklık</button>
            <button type="button" class="btn btn-primary" data-layer="wind">Rüzgar</button>
        </div>
    `;
    mapContainer.appendChild(controls);

    // Radar katmanları arasında geçiş
    controls.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const layerType = e.target.dataset.layer;
            
            // Aktif butonu güncelle
            controls.querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            // Tüm katmanları gizle
            Object.values(layers).forEach(layer => {
                layer.setVisible(false);
            });

            // Seçilen katmanı göster
            layers[layerType].setVisible(true);
        });
    });
}

// Mevcut hava durumu bilgilerini güncelle
function updateCurrentWeather(data) {
    cityName.textContent = data.name;
    const iconCode = data.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    
    // Önce yeni resmi yükle, sonra göster
    const tempImg = new Image();
    tempImg.onload = function() {
        weatherIcon.src = this.src;
    };
    tempImg.src = iconUrl;
    
    // Font Awesome ikonu ve rengi ekle
    const weatherIconInfo = weatherIcons[iconCode];
    if (weatherIconInfo) {
        weatherDesc.innerHTML = `
            <i class="${weatherIconInfo.icon}" style="color: ${weatherIconInfo.color}; margin-right: 8px;"></i>
            ${data.weather[0].description}
        `;
    } else {
        weatherDesc.textContent = data.weather[0].description;
    }
    
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    windSpeed.textContent = `${data.wind.speed} km/s`;
    humidity.textContent = `${data.main.humidity}%`;

    // Ek hava durumu detayları
    const cardBody = document.querySelector('.current-weather .card-body');
    const extraDetails = document.createElement('div');
    extraDetails.className = 'weather-extra-details mt-3';
    extraDetails.innerHTML = `
        <div class="row">
            <div class="col-6 col-md-3">
                <div class="detail">
                    <i class="fas fa-temperature-high"></i>
                    <span>Maks: ${Math.round(data.main.temp_max)}°C</span>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="detail">
                    <i class="fas fa-temperature-low"></i>
                    <span>Min: ${Math.round(data.main.temp_min)}°C</span>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="detail">
                    <i class="fas fa-compress-arrows-alt"></i>
                    <span>Basınç: ${data.main.pressure} hPa</span>
                </div>
            </div>
            <div class="col-6 col-md-3">
                <div class="detail">
                    <i class="fas fa-eye"></i>
                    <span>Görüş: ${(data.visibility / 1000).toFixed(1)} km</span>
                </div>
            </div>
        </div>
    `;

    // Eğer varsa eski extra details'ı kaldır
    const oldExtraDetails = document.querySelector('.weather-extra-details');
    if (oldExtraDetails) {
        oldExtraDetails.remove();
    }
    
    // Yeni extra details'ı ekle
    cardBody.appendChild(extraDetails);
}

// 5 günlük tahmin bilgilerini güncelle
function updateForecast(data) {
    forecastContainer.innerHTML = '';
    
    const dailyForecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));
    
    dailyForecasts.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('tr-TR', { weekday: 'long' });
        const iconCode = day.weather[0].icon;
        const weatherIconInfo = weatherIcons[iconCode];
        
        const forecastCard = document.createElement('div');
        forecastCard.className = 'col-md-2 mb-3';
        forecastCard.innerHTML = `
            <div class="forecast-card">
                <div class="forecast-date">${dayName}</div>
                <div class="forecast-icon-container">
                    <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" 
                         alt="${day.weather[0].description}" 
                         class="forecast-icon">
                    <i class="${weatherIconInfo?.icon || 'fas fa-cloud'}" 
                       style="color: ${weatherIconInfo?.color || '#718096'}; font-size: 1.5rem;"></i>
                </div>
                <div class="forecast-temp">${Math.round(day.main.temp)}°C</div>
                <div class="forecast-desc">${day.weather[0].description}</div>
                <div class="forecast-details">
                    <div class="detail">
                        <i class="fas fa-temperature-high"></i>
                        <span>${Math.round(day.main.temp_max)}°C</span>
                    </div>
                    <div class="detail">
                        <i class="fas fa-temperature-low"></i>
                        <span>${Math.round(day.main.temp_min)}°C</span>
                    </div>
                </div>
            </div>
        `;
        
        forecastContainer.appendChild(forecastCard);
    });
}

// Saatlik tahmin bilgilerini güncelle
function updateHourlyForecast(data) {
    hourlyForecastContainer.innerHTML = '';
    
    // İlk 24 saatlik veriyi al
    const hourlyData = data.list.slice(0, 8);
    
    hourlyData.forEach(hour => {
        const date = new Date(hour.dt * 1000);
        const hourStr = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        
        const hourlyCard = document.createElement('div');
        hourlyCard.className = 'col-md-3 mb-3';
        hourlyCard.innerHTML = `
            <div class="forecast-card">
                <div class="forecast-date">${hourStr}</div>
                <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png" 
                     alt="${hour.weather[0].description}" 
                     class="forecast-icon">
                <div class="forecast-temp">${Math.round(hour.main.temp)}°C</div>
                <div class="forecast-desc">${hour.weather[0].description}</div>
                <div class="detail">
                    <i class="fas fa-wind"></i>
                    <span>${hour.wind.speed} km/s</span>
                </div>
            </div>
        `;
        
        hourlyForecastContainer.appendChild(hourlyCard);
    });
}

// Haritaları başlat
function initializeMaps(lat, lon) {
    // Konum haritası
    const locationMap = new ol.Map({
        target: 'location-map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([lon, lat]),
            zoom: 12
        })
    });

    // Konum işaretleyicisi ekle
    const marker = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([lon, lat]))
    });

    const vectorSource = new ol.source.Vector({
        features: [marker]
    });

    const markerLayer = new ol.layer.Vector({
        source: vectorSource,
        style: new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 1],
                src: 'https://openlayers.org/en/latest/examples/data/icon.png'
            })
        })
    });

    locationMap.addLayer(markerLayer);

    // Hava durumu haritası
    const weatherMap = new ol.Map({
        target: 'weather-map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            }),
            new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${API_KEY}`
                }),
                opacity: 0.6
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([lon, lat]),
            zoom: 6
        })
    });
}

// Radar haritasını güncelle
function updateRadarMap() {
    const radarMap = new ol.Map({
        target: 'radar-map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            }),
            new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`
                }),
                opacity: 0.6
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([35, 39]), // Türkiye'nin merkezi
            zoom: 6
        })
    });
}

// Hava kalitesi verilerini al
async function getAirQuality(lat, lon) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            updateAirQuality(data);
        }
    } catch (error) {
        console.error('Hava kalitesi bilgisi alınamadı:', error);
    }
}

// Hava kalitesi bilgilerini güncelle
function updateAirQuality(data) {
    const aqi = data.list[0].main.aqi;
    const aqiValue = document.querySelector('.aqi-value');
    const aqiDesc = document.querySelector('.aqi-description');
    const pollutantList = document.querySelector('.pollutant-list');

    const aqiDescriptions = {
        1: 'İyi',
        2: 'Makul',
        3: 'Orta',
        4: 'Kötü',
        5: 'Çok Kötü'
    };

    aqiValue.textContent = aqi;
    aqiDesc.textContent = aqiDescriptions[aqi];

    // Kirletici değerlerini göster
    const pollutants = data.list[0].components;
    pollutantList.innerHTML = Object.entries(pollutants)
        .map(([key, value]) => `
            <div class="mb-2">
                <strong>${key.toUpperCase()}:</strong> ${value} μg/m³
            </div>
        `).join('');
}

// Sağlık ve aktivite verilerini al
function getHealthData(lat, lon) {
    // UV İndeksi
    fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            const uvIndex = document.querySelector('.uv-index');
            uvIndex.innerHTML = `
                <div class="h1">${Math.round(data.value)}</div>
                <p>${getUVDescription(data.value)}</p>
            `;
        })
        .catch(error => console.error('UV indeksi alınamadı:', error));

    // Aktivite ve solunum skorları (örnek değerler)
    const activityScore = document.querySelector('.activity-score');
    const breathingScore = document.querySelector('.breathing-score');

    activityScore.innerHTML = `
        <div class="h1">8/10</div>
        <p>Spor yapmak için uygun</p>
    `;

    breathingScore.innerHTML = `
        <div class="h1">7/10</div>
        <p>İyi hava kalitesi</p>
    `;
}

// UV İndeksi açıklaması
function getUVDescription(value) {
    if (value <= 2) return 'Düşük';
    if (value <= 5) return 'Orta';
    if (value <= 7) return 'Yüksek';
    if (value <= 10) return 'Çok Yüksek';
    return 'Aşırı';
}

// Aylık tahmin verilerini güncelle (örnek veri)
function updateMonthlyForecast() {
    const monthlyCalendar = document.getElementById('monthly-calendar');
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
                       'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

    let calendarHTML = `
        <h3>${monthNames[currentMonth]} ${currentYear}</h3>
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th>Pzt</th>
                    <th>Sal</th>
                    <th>Çar</th>
                    <th>Per</th>
                    <th>Cum</th>
                    <th>Cmt</th>
                    <th>Paz</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Takvim mantığını burada implement et
    // Bu kısım örnek veri gösteriyor
    for (let i = 0; i < 5; i++) {
        calendarHTML += '<tr>';
        for (let j = 0; j < 7; j++) {
            const day = i * 7 + j + 1;
            if (day <= 31) {
                calendarHTML += `
                    <td>
                        <div class="text-center">
                            <div>${day}</div>
                            <img src="https://openweathermap.org/img/wn/01d@2x.png" 
                                 alt="sunny" 
                                 style="width: 30px; height: 30px;">
                            <div class="small">22°C</div>
                        </div>
                    </td>
                `;
            } else {
                calendarHTML += '<td></td>';
            }
        }
        calendarHTML += '</tr>';
    }

    calendarHTML += `
            </tbody>
        </table>
    `;

    monthlyCalendar.innerHTML = calendarHTML;
}

// Detaylı saatlik tahmin
async function updateDetailedHourlyForecast() {
    const container = document.getElementById('hourly-forecast');
    container.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';

    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lastKnownPosition?.latitude || 41.0082}&lon=${lastKnownPosition?.longitude || 28.9784}&appid=${API_KEY}&units=metric&lang=tr`;
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            container.innerHTML = '<div class="row">';
            const next24Hours = data.list.slice(0, 8);

            next24Hours.forEach(hour => {
                const date = new Date(hour.dt * 1000);
                const hourStr = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                const iconCode = hour.weather[0].icon;
                const weatherIconInfo = weatherIcons[iconCode];

                const card = document.createElement('div');
                card.className = 'col-md-3 mb-4';
                card.innerHTML = `
                    <div class="forecast-card">
                        <div class="forecast-date">${hourStr}</div>
                        <div class="forecast-icon-container">
                            <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" 
                                 alt="${hour.weather[0].description}" 
                                 class="forecast-icon">
                            <i class="${weatherIconInfo?.icon || 'fas fa-cloud'}" 
                               style="color: ${weatherIconInfo?.color || '#718096'}"></i>
                        </div>
                        <div class="forecast-temp">${Math.round(hour.main.temp)}°C</div>
                        <div class="forecast-desc">${hour.weather[0].description}</div>
                        <div class="forecast-details mt-3">
                            <div class="detail">
                                <i class="fas fa-wind"></i>
                                <span>${hour.wind.speed} km/s</span>
                            </div>
                            <div class="detail">
                                <i class="fas fa-tint"></i>
                                <span>${hour.main.humidity}%</span>
                            </div>
                        </div>
                        <div class="additional-details mt-3">
                            <div class="detail">
                                <i class="fas fa-temperature-high"></i>
                                <span>Hissedilen: ${Math.round(hour.main.feels_like)}°C</span>
                            </div>
                            <div class="detail">
                                <i class="fas fa-compress-arrows-alt"></i>
                                <span>Basınç: ${hour.main.pressure} hPa</span>
                            </div>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        }
    } catch (error) {
        container.innerHTML = '<div class="alert alert-danger">Hava durumu bilgisi alınamadı</div>';
    }
}

// Detaylı günlük tahmin
async function updateDetailedDailyForecast() {
    const container = document.getElementById('forecast');
    container.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';

    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lastKnownPosition?.latitude || 41.0082}&lon=${lastKnownPosition?.longitude || 28.9784}&appid=${API_KEY}&units=metric&lang=tr`;
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            container.innerHTML = '<div class="row">';
            const dailyForecasts = data.list.filter(item => item.dt_txt.includes('12:00:00'));

            dailyForecasts.forEach(day => {
                const date = new Date(day.dt * 1000);
                const dayName = date.toLocaleDateString('tr-TR', { weekday: 'long' });
                const iconCode = day.weather[0].icon;
                const weatherIconInfo = weatherIcons[iconCode];

                const card = document.createElement('div');
                card.className = 'col-md-4 mb-4';
                card.innerHTML = `
                    <div class="forecast-card">
                        <div class="forecast-date h5">${dayName}</div>
                        <div class="forecast-icon-container">
                            <img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" 
                                 alt="${day.weather[0].description}" 
                                 class="forecast-icon">
                            <i class="${weatherIconInfo?.icon || 'fas fa-cloud'}" 
                               style="color: ${weatherIconInfo?.color || '#718096'}"></i>
                        </div>
                        <div class="forecast-temp">${Math.round(day.main.temp)}°C</div>
                        <div class="forecast-desc">${day.weather[0].description}</div>
                        <div class="forecast-details mt-3">
                            <div class="row">
                                <div class="col-6">
                                    <div class="detail">
                                        <i class="fas fa-temperature-high"></i>
                                        <span>Maks: ${Math.round(day.main.temp_max)}°C</span>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="detail">
                                        <i class="fas fa-temperature-low"></i>
                                        <span>Min: ${Math.round(day.main.temp_min)}°C</span>
                                    </div>
                                </div>
                            </div>
                            <div class="row mt-2">
                                <div class="col-6">
                                    <div class="detail">
                                        <i class="fas fa-wind"></i>
                                        <span>${day.wind.speed} km/s</span>
                                    </div>
                                </div>
                                <div class="col-6">
                                    <div class="detail">
                                        <i class="fas fa-tint"></i>
                                        <span>${day.main.humidity}%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="additional-details mt-3">
                            <div class="detail">
                                <i class="fas fa-sun"></i>
                                <span>UV İndeksi: ${getRandomUVIndex()}/10</span>
                            </div>
                            <div class="detail">
                                <i class="fas fa-umbrella"></i>
                                <span>Yağış Olasılığı: ${Math.round(day.pop * 100)}%</span>
                            </div>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        }
    } catch (error) {
        container.innerHTML = '<div class="alert alert-danger">Hava durumu bilgisi alınamadı</div>';
    }
}

// Detaylı radar haritası
function updateDetailedRadarMap() {
    const container = document.getElementById('radar-map');
    const lat = lastKnownPosition?.latitude || 41.0082;
    const lon = lastKnownPosition?.longitude || 28.9784;

    const radarMap = new ol.Map({
        target: container,
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            }),
            new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`
                }),
                opacity: 0.7
            }),
            new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${API_KEY}`
                }),
                opacity: 0.4
            })
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat([lon, lat]),
            zoom: 7
        })
    });

    // Radar kontrolleri ekle
    const controls = document.createElement('div');
    controls.className = 'radar-controls mt-3';
    controls.innerHTML = `
        <div class="btn-group" role="group">
            <button type="button" class="btn btn-primary" data-layer="precipitation">Yağış</button>
            <button type="button" class="btn btn-primary" data-layer="clouds">Bulut</button>
            <button type="button" class="btn btn-primary" data-layer="temp">Sıcaklık</button>
            <button type="button" class="btn btn-primary" data-layer="wind">Rüzgar</button>
        </div>
    `;
    container.parentNode.appendChild(controls);
}

// Detaylı MinuteCast
async function updateDetailedMinuteCast(lat, lon) {
    const container = document.getElementById('minutecast-container');
    container.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';

    try {
        // OpenWeatherMap'in minutely endpoint'ini kullan
        const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=tr`;
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok && data.minutely) {
            let html = '<h3>Dakika Dakika Yağış Tahmini</h3>';
            html += '<div class="timeline-container mt-4">';
            
            data.minutely.forEach((minute, index) => {
                if (index % 5 === 0) { // Her 5 dakikada bir göster
                    const time = new Date(minute.dt * 1000);
                    const precipitation = minute.precipitation;
                    
                    html += `
                        <div class="timeline-item">
                            <div class="time">${time.toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</div>
                            <div class="precipitation-bar" style="height: ${precipitation * 100}px">
                                <div class="precipitation-value">${precipitation.toFixed(1)} mm</div>
                            </div>
                        </div>
                    `;
                }
            });
            
            html += '</div>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<div class="alert alert-info">Bu bölge için dakikalık tahmin bilgisi bulunmuyor.</div>';
        }
    } catch (error) {
        container.innerHTML = '<div class="alert alert-danger">Dakikalık tahmin bilgisi alınamadı</div>';
    }
}

// Detaylı hava kalitesi
async function updateDetailedAirQuality(lat, lon) {
    const container = document.querySelector('#airquality .card-body');
    container.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';

    try {
        const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok) {
            const aqi = data.list[0].main.aqi;
            const components = data.list[0].components;
            
            const aqiDescriptions = {
                1: { text: 'İyi', color: '#4CAF50' },
                2: { text: 'Makul', color: '#8BC34A' },
                3: { text: 'Orta', color: '#FFC107' },
                4: { text: 'Kötü', color: '#FF5722' },
                5: { text: 'Çok Kötü', color: '#F44336' }
            };

            const componentDescriptions = {
                co: 'Karbon Monoksit',
                no: 'Azot Monoksit',
                no2: 'Azot Dioksit',
                o3: 'Ozon',
                so2: 'Kükürt Dioksit',
                pm2_5: 'PM2.5',
                pm10: 'PM10',
                nh3: 'Amonyak'
            };

            let html = `
                <div class="row">
                    <div class="col-md-6">
                        <div class="air-quality-index" style="background: linear-gradient(135deg, ${aqiDescriptions[aqi].color}88, ${aqiDescriptions[aqi].color})">
                            <h3>Hava Kalitesi İndeksi</h3>
                            <div class="aqi-value display-1">${aqi}</div>
                            <div class="aqi-description h4">${aqiDescriptions[aqi].text}</div>
                            <div class="mt-3">
                                <div class="progress">
                                    <div class="progress-bar" role="progressbar" 
                                         style="width: ${aqi * 20}%; background-color: ${aqiDescriptions[aqi].color}" 
                                         aria-valuenow="${aqi}" aria-valuemin="0" aria-valuemax="5"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="pollutants">
                            <h3>Kirletici Değerleri</h3>
                            <div class="pollutant-list">
                                ${Object.entries(components).map(([key, value]) => `
                                    <div class="pollutant-item">
                                        <div class="d-flex justify-content-between align-items-center mb-2">
                                            <strong>${componentDescriptions[key] || key.toUpperCase()}</strong>
                                            <span>${value} μg/m³</span>
                                        </div>
                                        <div class="progress">
                                            <div class="progress-bar" role="progressbar" 
                                                 style="width: ${Math.min(value, 100)}%" 
                                                 aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100"></div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row mt-4">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <h4>Sağlık Önerileri</h4>
                                <ul class="list-group list-group-flush">
                                    ${getHealthRecommendations(aqi)}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            container.innerHTML = html;
        }
    } catch (error) {
        container.innerHTML = '<div class="alert alert-danger">Hava kalitesi bilgisi alınamadı</div>';
    }
}

// Detaylı sağlık verileri
async function updateDetailedHealthData(lat, lon) {
    const container = document.querySelector('#health .card-body');
    container.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';

    try {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=tr`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        if (weatherResponse.ok) {
            const temp = weatherData.main.temp;
            const humidity = weatherData.main.humidity;
            const windSpeed = weatherData.wind.speed;

            const activityScore = calculateActivityScore(temp, humidity, windSpeed);
            const breathingScore = calculateBreathingScore(temp, humidity);
            const uvIndex = getRandomUVIndex(); // Gerçek UV verisi için ayrı bir API gerekebilir

            let html = `
                <div class="row">
                    <div class="col-md-4">
                        <div class="health-card">
                            <h4><i class="fas fa-running"></i> Spor Aktiviteleri</h4>
                            <div class="score-circle" style="background: ${getScoreColor(activityScore)}">
                                <div class="score-value">${activityScore}/10</div>
                            </div>
                            <div class="mt-3">
                                <h5>Öneriler</h5>
                                <ul class="list-unstyled">
                                    ${getActivityRecommendations(activityScore, temp)}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="health-card">
                            <h4><i class="fas fa-lungs"></i> Solunum</h4>
                            <div class="score-circle" style="background: ${getScoreColor(breathingScore)}">
                                <div class="score-value">${breathingScore}/10</div>
                            </div>
                            <div class="mt-3">
                                <h5>Öneriler</h5>
                                <ul class="list-unstyled">
                                    ${getBreathingRecommendations(breathingScore, humidity)}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="health-card">
                            <h4><i class="fas fa-sun"></i> UV İndeksi</h4>
                            <div class="score-circle" style="background: ${getUVColor(uvIndex)}">
                                <div class="score-value">${uvIndex}/10</div>
                            </div>
                            <div class="mt-3">
                                <h5>Öneriler</h5>
                                <ul class="list-unstyled">
                                    ${getUVRecommendations(uvIndex)}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row mt-4">
                    <div class="col-12">
                        <div class="card">
                            <div class="card-body">
                                <h4>Günlük Sağlık Tavsiyeleri</h4>
                                <div class="daily-recommendations">
                                    ${getDailyHealthRecommendations(temp, humidity, windSpeed)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            container.innerHTML = html;
        }
    } catch (error) {
        container.innerHTML = '<div class="alert alert-danger">Sağlık bilgileri alınamadı</div>';
    }
}

// Yardımcı fonksiyonlar
function getRandomUVIndex() {
    return Math.floor(Math.random() * 11);
}

function calculateActivityScore(temp, humidity, windSpeed) {
    let score = 10;
    if (temp < 10 || temp > 30) score -= 2;
    if (temp < 5 || temp > 35) score -= 2;
    if (humidity > 70) score -= 1;
    if (humidity > 85) score -= 1;
    if (windSpeed > 20) score -= 2;
    return Math.max(1, score);
}

function calculateBreathingScore(temp, humidity) {
    let score = 10;
    if (humidity < 30) score -= 2;
    if (humidity > 70) score -= 2;
    if (temp < 5 || temp > 30) score -= 1;
    return Math.max(1, score);
}

function getScoreColor(score) {
    if (score >= 8) return '#4CAF50';
    if (score >= 6) return '#FFC107';
    if (score >= 4) return '#FF9800';
    return '#F44336';
}

function getUVColor(index) {
    if (index <= 2) return '#4CAF50';
    if (index <= 5) return '#FFC107';
    if (index <= 7) return '#FF9800';
    if (index <= 10) return '#F44336';
    return '#9C27B0';
}

function getActivityRecommendations(score, temp) {
    let recommendations = [];
    if (score >= 8) {
        recommendations.push('İdeal koşullar! Dış mekan aktiviteleri için uygun.');
        recommendations.push('Yürüyüş, koşu veya bisiklet için harika bir gün.');
    } else if (score >= 6) {
        recommendations.push('Orta şiddetli aktiviteler için uygun.');
        recommendations.push('Düzenli molalar vermeyi unutmayın.');
    } else {
        recommendations.push('Yoğun aktivitelerden kaçının.');
        recommendations.push('İç mekan aktiviteleri tercih edin.');
    }
    return recommendations.map(r => `<li><i class="fas fa-check text-success"></i> ${r}</li>`).join('');
}

function getBreathingRecommendations(score, humidity) {
    let recommendations = [];
    if (score >= 8) {
        recommendations.push('Solunum için ideal koşullar.');
    } else if (score >= 6) {
        recommendations.push('Hassas gruplar için dikkatli olunmalı.');
    } else {
        recommendations.push('Astım hastaları için riskli koşullar.');
        recommendations.push('Dış mekan aktivitelerini sınırlayın.');
    }
    return recommendations.map(r => `<li><i class="fas fa-check text-success"></i> ${r}</li>`).join('');
}

function getUVRecommendations(index) {
    let recommendations = [];
    if (index <= 2) {
        recommendations.push('Güneş koruması gerekli değil.');
    } else if (index <= 5) {
        recommendations.push('SPF 30+ güneş kremi kullanın.');
        recommendations.push('Şapka takın.');
    } else if (index <= 7) {
        recommendations.push('Güneşten kaçının.');
        recommendations.push('Koruyucu giysiler giyin.');
    } else {
        recommendations.push('Dışarı çıkmayın!');
        recommendations.push('Mutlaka güneş koruması kullanın.');
    }
    return recommendations.map(r => `<li><i class="fas fa-check text-success"></i> ${r}</li>`).join('');
}

function getHealthRecommendations(aqi) {
    const recommendations = {
        1: [
            'Normal aktivitelerinize devam edebilirsiniz',
            'Dış mekan aktiviteleri için ideal'
        ],
        2: [
            'Hassas gruplar dikkatli olmalı',
            'Uzun süreli dış mekan aktivitelerini sınırlayın'
        ],
        3: [
            'Yaşlılar ve çocuklar dış mekan aktivitelerini azaltmalı',
            'Maske kullanımı önerilir'
        ],
        4: [
            'Dış mekan aktivitelerinden kaçının',
            'Pencerelerinizi kapalı tutun'
        ],
        5: [
            'Dışarı çıkmayın!',
            'Hava kirliliği çok yüksek'
        ]
    };
    
    return recommendations[aqi].map(r => `
        <li class="list-group-item">
            <i class="fas fa-exclamation-circle text-warning me-2"></i>
            ${r}
        </li>
    `).join('');
}

function getDailyHealthRecommendations(temp, humidity, windSpeed) {
    let recommendations = [];
    
    if (temp < 10) {
        recommendations.push('Soğuk havaya karşı kalın giysiler giyin');
    } else if (temp > 30) {
        recommendations.push('Bol su için ve güneşten korunun');
    }
    
    if (humidity > 70) {
        recommendations.push('Yüksek nem nedeniyle daha sık mola verin');
    }
    
    if (windSpeed > 20) {
        recommendations.push('Kuvvetli rüzgar var, dikkatli olun');
    }
    
    return recommendations.map(r => `
        <div class="alert alert-info">
            <i class="fas fa-info-circle me-2"></i>
            ${r}
        </div>
    `).join('');
}

// Türkiye şehirleri ve ilçeleri
const turkishLocations = [
    {
        name: 'İstanbul',
        lat: 41.0082,
        lon: 28.9784,
        districts: [
            { name: 'Kadıköy', lat: 40.9927, lon: 29.0277 },
            { name: 'Beşiktaş', lat: 41.0420, lon: 29.0094 },
            { name: 'Üsküdar', lat: 41.0235, lon: 29.0145 },
            { name: 'Şişli', lat: 41.0602, lon: 28.9877 },
            { name: 'Beyoğlu', lat: 41.0370, lon: 28.9850 },
            { name: 'Fatih', lat: 41.0186, lon: 28.9397 },
            { name: 'Bakırköy', lat: 40.9819, lon: 28.8772 },
            { name: 'Maltepe', lat: 40.9351, lon: 29.1307 },
            { name: 'Ataşehir', lat: 40.9923, lon: 29.1244 },
            { name: 'Pendik', lat: 40.8775, lon: 29.2333 },
            { name: 'Kartal', lat: 40.9060, lon: 29.1897 },
            { name: 'Beylikdüzü', lat: 41.0031, lon: 28.6381 },
            { name: 'Esenyurt', lat: 41.0289, lon: 28.6728 },
            { name: 'Başakşehir', lat: 41.0936, lon: 28.8020 },
            { name: 'Sultanbeyli', lat: 40.9608, lon: 29.2674 },
            { name: 'Sancaktepe', lat: 41.0011, lon: 29.2342 }
        ]
    },
    {
        name: 'Ankara',
        lat: 39.9208,
        lon: 32.8541,
        districts: [
            { name: 'Çankaya', lat: 39.9179, lon: 32.8621 },
            { name: 'Keçiören', lat: 39.9650, lon: 32.8642 },
            { name: 'Yenimahalle', lat: 39.9785, lon: 32.7742 },
            { name: 'Mamak', lat: 39.9252, lon: 32.9137 },
            { name: 'Etimesgut', lat: 39.9580, lon: 32.6861 },
            { name: 'Sincan', lat: 39.9753, lon: 32.5814 },
            { name: 'Altındağ', lat: 39.9625, lon: 32.8608 },
            { name: 'Pursaklar', lat: 40.0398, lon: 32.8913 },
            { name: 'Gölbaşı', lat: 39.7938, lon: 32.8061 }
        ]
    },
    {
        name: 'İzmir',
        lat: 38.4189,
        lon: 27.1287,
        districts: [
            { name: 'Konak', lat: 38.4189, lon: 27.1287 },
            { name: 'Karşıyaka', lat: 38.4595, lon: 27.1105 },
            { name: 'Bornova', lat: 38.4703, lon: 27.2159 },
            { name: 'Buca', lat: 38.3778, lon: 27.1797 },
            { name: 'Çiğli', lat: 38.4924, lon: 27.0814 },
            { name: 'Gaziemir', lat: 38.3192, lon: 27.1321 },
            { name: 'Bayraklı', lat: 38.4579, lon: 27.1571 },
            { name: 'Karabağlar', lat: 38.3703, lon: 27.1361 },
            { name: 'Balçova', lat: 38.3967, lon: 27.0704 }
        ]
    },
    {
        name: 'Bursa',
        lat: 40.1824,
        lon: 29.0670,
        districts: [
            { name: 'Osmangazi', lat: 40.1824, lon: 29.0670 },
            { name: 'Nilüfer', lat: 40.2153, lon: 28.9530 },
            { name: 'Yıldırım', lat: 40.1911, lon: 29.1199 },
            { name: 'Gemlik', lat: 40.4339, lon: 29.1517 },
            { name: 'İnegöl', lat: 40.0778, lon: 29.5134 },
            { name: 'Mudanya', lat: 40.3747, lon: 28.8825 }
        ]
    },
    {
        name: 'Antalya',
        lat: 36.8841,
        lon: 30.7056,
        districts: [
            { name: 'Muratpaşa', lat: 36.8841, lon: 30.7056 },
            { name: 'Konyaaltı', lat: 36.8665, lon: 30.6363 },
            { name: 'Kepez', lat: 36.9249, lon: 30.7133 },
            { name: 'Alanya', lat: 36.5444, lon: 31.9954 },
            { name: 'Manavgat', lat: 36.7866, lon: 31.4431 },
            { name: 'Serik', lat: 36.9178, lon: 31.1003 }
        ]
    },
    {
        name: 'Adana',
        lat: 37.0000,
        lon: 35.3213,
        districts: [
            { name: 'Seyhan', lat: 37.0000, lon: 35.3213 },
            { name: 'Çukurova', lat: 37.0571, lon: 35.2486 },
            { name: 'Yüreğir', lat: 37.0356, lon: 35.3945 },
            { name: 'Sarıçam', lat: 37.1089, lon: 35.3909 },
            { name: 'Ceyhan', lat: 37.0247, lon: 35.8119 }
        ]
    },
    {
        name: 'Eskişehir',
        lat: 39.7767,
        lon: 30.5206,
        districts: [
            { name: 'Tepebaşı', lat: 39.7767, lon: 30.5206 },
            { name: 'Odunpazarı', lat: 39.7683, lon: 30.5269 },
            { name: 'Sivrihisar', lat: 39.4500, lon: 31.5333 },
            { name: 'Çifteler', lat: 39.3833, lon: 31.0333 }
        ]
    },
    {
        name: 'Gaziantep',
        lat: 37.0662,
        lon: 37.3833,
        districts: [
            { name: 'Şahinbey', lat: 37.0662, lon: 37.3833 },
            { name: 'Şehitkamil', lat: 37.1891, lon: 37.3690 },
            { name: 'Nizip', lat: 37.0094, lon: 37.7944 },
            { name: 'İslahiye', lat: 37.0233, lon: 36.6317 }
        ]
    }
];

// Şehir arama işlevselliği
let selectedCity = null;

if (!window.cityInput) {
    window.cityInput = document.getElementById('cityInput');
}
if (!window.searchResults) {
    window.searchResults = document.getElementById('searchResults');
}

window.cityInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    if (searchTerm.length < 2) {
        window.searchResults.style.display = 'none';
        return;
    }

    let matchedLocations = [];

    // Türkiye şehirleri ve ilçeleri arama
    turkishLocations.forEach(city => {
        if (city.name.toLowerCase().includes(searchTerm)) {
            matchedLocations.push({
                name: city.name,
                lat: city.lat,
                lon: city.lon,
                type: 'city',
                country: 'Türkiye'
            });
        }

        if (city.districts) {
            city.districts.forEach(district => {
                if (district.name.toLowerCase().includes(searchTerm)) {
                    matchedLocations.push({
                        name: `${district.name}, ${city.name}`,
                        lat: district.lat,
                        lon: district.lon,
                        type: 'district',
                        country: 'Türkiye'
                    });
                }
            });
        }
    });

    // Dünya şehirleri arama
    worldCities.forEach(city => {
        if (city.name.toLowerCase().includes(searchTerm)) {
            matchedLocations.push({
                name: city.name,
                lat: city.lat,
                lon: city.lon,
                type: 'world-city',
                country: city.name.split(', ')[1]
            });
        }
    });

    if (matchedLocations.length > 0) {
        // Sonuçları gruplandır
        const groupedResults = {
            turkey: matchedLocations.filter(loc => loc.country === 'Türkiye'),
            world: matchedLocations.filter(loc => loc.country !== 'Türkiye')
        };

        // Sonuçları HTML olarak oluştur
        let resultsHTML = '';

        // Türkiye sonuçları
        if (groupedResults.turkey.length > 0) {
            resultsHTML += '<div class="search-group"><div class="search-group-title">Türkiye</div>';
            resultsHTML += groupedResults.turkey.map(location => `
                <div class="p-2 search-result ${location.type}" style="cursor: pointer;" 
                 data-name="${location.name}" 
                 data-lat="${location.lat}" 
                 data-lon="${location.lon}">
                <i class="fas fa-${location.type === 'city' ? 'city' : 'map-marker-alt'} text-primary me-2"></i>
                ${location.name}
            </div>
        `).join('');
            resultsHTML += '</div>';
        }

        // Dünya şehirleri sonuçları
        if (groupedResults.world.length > 0) {
            resultsHTML += '<div class="search-group"><div class="search-group-title">Dünya</div>';
            resultsHTML += groupedResults.world.map(location => `
                <div class="p-2 search-result world-city" style="cursor: pointer;" 
                     data-name="${location.name}" 
                     data-lat="${location.lat}" 
                     data-lon="${location.lon}">
                    <i class="fas fa-globe text-primary me-2"></i>
                    ${location.name}
                </div>
            `).join('');
            resultsHTML += '</div>';
        }

        window.searchResults.innerHTML = resultsHTML;
        window.searchResults.style.display = 'block';

        // Konum seçme olayını ekle
        document.querySelectorAll('.search-result').forEach(result => {
            result.addEventListener('click', () => {
                const name = result.dataset.name;
                const lat = parseFloat(result.dataset.lat);
                const lon = parseFloat(result.dataset.lon);
                
                window.cityInput.value = name;
                window.searchResults.style.display = 'none';
                selectedCity = { name, lat, lon };
                
                // Seçilen konum için hava durumu ve harita verilerini güncelle
                getWeatherDataByCoords(lat, lon);
                updateMaps(lat, lon);
            });
        });
    } else {
        window.searchResults.style.display = 'none';
    }
});

// Sayfa dışına tıklandığında sonuçları gizle
document.addEventListener('click', (e) => {
    if (!e.target.closest('#searchForm')) {
        window.searchResults.style.display = 'none';
    }
});