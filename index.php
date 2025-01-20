<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Havamania Hava Durumunu Anlık Takip Et</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.9.0/css/ol.css">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container">
            <a class="navbar-brand" href="#"><i class="fas fa-cloud-sun"></i> Hava Durumu</a>
            <form class="d-flex position-relative" id="searchForm">
                <div class="input-group">
                    <input class="form-control" type="search" placeholder="Şehir ara..." id="cityInput" autocomplete="off">
                    <button class="btn btn-light" type="submit">Ara</button>
                </div>
                <div id="searchResults" class="position-absolute w-100 mt-1 bg-white border rounded-3 shadow-sm" style="top: 100%; z-index: 1000; display: none;"></div>
            </form>
        </div>
    </nav>

    <div class="container mt-4">
        <ul class="nav nav-tabs mb-4" id="weatherTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#today" type="button">
                    <i class="fas fa-calendar-day"></i> Bugün
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#hourly" type="button">
                    <i class="fas fa-clock"></i> Saat Başı
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#daily" type="button">
                    <i class="fas fa-calendar-week"></i> Günlük
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#radar" type="button">
                    <i class="fas fa-satellite-dish"></i> Radar
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#minutecast" type="button">
                    <i class="fas fa-stopwatch"></i> Anlık Tahminler
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#monthly" type="button">
                    <i class="fas fa-calendar-alt"></i> Aylık
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#airquality" type="button">
                    <i class="fas fa-wind"></i> Hava Kalitesi
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" data-bs-toggle="tab" data-bs-target="#health" type="button">
                    <i class="fas fa-heartbeat"></i> Sağlık ve Aktiviteler
                </button>
            </li>
        </ul>

        <div class="tab-content">
            <!-- Bugün Sekmesi -->
            <div class="tab-pane fade show active" id="today">
                <div class="row">
                    <div class="col-md-12">
                        <div class="current-weather card">
                            <div class="card-body">
                                <h2 class="city-name">İstanbul</h2>
                                <div class="current-temp">
                                    <img src="https://openweathermap.org/img/wn/01d@2x.png" alt="hava durumu" class="weather-icon">
                                    <span class="temp">25°C</span>
                                </div>
                                <p class="weather-desc">Güneşli</p>
                                <div class="weather-details">
                                    <div class="detail">
                                        <i class="fas fa-wind"></i>
                                        <span class="wind">12 km/s</span>
                                    </div>
                                    <div class="detail">
                                        <i class="fas fa-tint"></i>
                                        <span class="humidity">65%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row mt-4">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h5><i class="fas fa-satellite"></i> Hava Durumu Radar Haritası</h5>
                            </div>
                            <div class="card-body">
                                <div id="weather-map" class="map-container"></div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h5><i class="fas fa-map-marker-alt"></i> Konum Haritası</h5>
                            </div>
                            <div class="card-body">
                                <div id="location-map" class="map-container"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Saat Başı Sekmesi -->
            <div class="tab-pane fade" id="hourly">
                <div class="row" id="hourly-forecast">
                    <!-- Saatlik tahminler buraya eklenecek -->
                </div>
            </div>

            <!-- Günlük Sekmesi -->
            <div class="tab-pane fade" id="daily">
                <div class="row" id="forecast">
                    <!-- Günlük tahminler buraya eklenecek -->
                </div>
            </div>

            <!-- Radar Sekmesi -->
            <div class="tab-pane fade" id="radar">
                <div class="card">
                    <div class="card-body">
                        <div id="radar-map" class="map-container-large"></div>
                    </div>
                </div>
            </div>

            <!-- MinuteCast Sekmesi -->
            <div class="tab-pane fade" id="minutecast">
                <div class="card">
                    <div class="card-body">
                        <div id="minutecast-container">
                            <h3>Dakika Dakika Yağış Tahmini</h3>
                            <div id="minutecast-timeline"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Aylık Sekmesi -->
            <div class="tab-pane fade" id="monthly">
                <div class="card">
                    <div class="card-body">
                        <div id="monthly-calendar"></div>
                    </div>
                </div>
            </div>

            <!-- Hava Kalitesi Sekmesi -->
            <div class="tab-pane fade" id="airquality">
                <div class="card">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="air-quality-index">
                                    <h3>Hava Kalitesi İndeksi</h3>
                                    <div class="aqi-value"></div>
                                    <div class="aqi-description"></div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="pollutants">
                                    <h3>Kirletici Değerleri</h3>
                                    <div class="pollutant-list"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sağlık ve Aktiviteler Sekmesi -->
            <div class="tab-pane fade" id="health">
                <div class="card">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-4">
                                <div class="health-card">
                                    <h4><i class="fas fa-running"></i> Spor Aktiviteleri</h4>
                                    <div class="activity-score"></div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="health-card">
                                    <h4><i class="fas fa-lungs"></i> Solunum</h4>
                                    <div class="breathing-score"></div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="health-card">
                                    <h4><i class="fas fa-sun"></i> UV İndeksi</h4>
                                    <div class="uv-index"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/gh/openlayers/openlayers.github.io@master/en/v6.9.0/build/ol.js"></script>
    <script src="script.js"></script>
</body>
</html> 