//* global variables

var homePosition = [];
var selectedCountryName = '';
var popup = L.popup();
var earthquakeMarkers = [];
var marker = null;
var markersVisible = false;
var countryCode = '';

//* End of global variables

//* general functions 

// Exibe o loading circle
function showLoadingCircle() {
    $('#loading-circle').css('display', 'block');
}

showLoadingCircle();

// Oculta o loading circle
function hideLoadingCircle() {
    $('#loading-circle').css('display', 'none');
}

function hideCoverLayer() {
    $('#cover-layer').css('display', 'none');
}

//! Get the coordinates from a country name
async function getCoordinatesFromCountry(countryName) {
    try {
        const response = await fetch('assets/php/openCage.php?countryName=' + encodeURIComponent(countryName));
        const data = await response.json();
        const country = data.results[0].geometry;
        return [country.lat, country.lng];
    } catch (error) {
        console.log(error);
        return null;
    }
}

//! Get the exchange rate from USD
async function getExchangeRate(currencyCode) {
    try {
        const response = await fetch('assets/php/openExchange.php');
        const data = await response.json();
        console.log(data.rates[currencyCode]);
        return data.rates[currencyCode];
    } catch (error) {
        console.log(error);
        return null;
    }
}

//! Get the country info from a country code on countryInfo.php
async function getCountryInfoByCode(countryCode) {
    try {
        const response = await fetch('assets/php/countryInfo.php?countryCode=' + countryCode);
        const data = await response.json();
        const country = data.data[0];
        return country;
    } catch (error) {
        console.log(error);
        return null;
    }
}

//! Check if a point is inside a polygon
function pointInPolygon(latitude, longitude, coordinates) {
    var isInPolygon = false;

    for (var i = 0; i < coordinates.length; i++) {
        var polygon = coordinates[i];

        for (var j = 0; j < polygon.length; j++) {
            var ring = polygon[j];

            var intersect = false;
            for (var k = 0, l = ring.length - 1; k < ring.length; l = k++) {
                var xi = ring[k][0];
                var yi = ring[k][1];
                var xj = ring[l][0];
                var yj = ring[l][1];

                if (((yi > latitude) !== (yj > latitude)) && (longitude < (xj - xi) * (latitude - yi) / (yj - yi) + xi)) {
                    intersect = !intersect;
                }
            }

            if (intersect) {
                isInPolygon = !isInPolygon;
            }
        }
    }

    return isInPolygon;
}

//! Get the country name by latitude and longitude
function getCountryFromCoordinates(latitude, longitude, geoJSON) {
    for (var i = 0; i < geoJSON.features.length; i++) {
        var feature = geoJSON.features[i];
        if (pointInPolygon(latitude, longitude, feature.geometry.coordinates)) {
            updateCountryList();
            return feature.properties.name;
        }
    }
    console.log('No country found');
    return ""; // Retorna uma string vazia se nenhum país for encontrado
}

//! Get the country code by latitude and longitude
function getCountryCodeFromCoordinates(latitude, longitude, geoJSON) {
    for (var i = 0; i < geoJSON.features.length; i++) {
        var feature = geoJSON.features[i];
        if (pointInPolygon(latitude, longitude, feature.geometry.coordinates)) {
            return feature.properties.iso_a2;
        }
    }
    console.log('No country found');
    return ""; // Retorna uma string vazia se nenhum país for encontrado
}

//! update the country list on the select element
function updateCountryList() {
    var selectElement = $('#countriesList select');

    $.getJSON('assets/php/getCountryList.php', function (data) {
        selectElement.empty(); // Limpa a lista antes de atualizá-la

        $.each(data, function (index, country) {
            var option = $('<option>').val(country.iso_a2).text(country.name);

            if (country.name === selectedCountryName) {
                option.attr('selected', 'selected');
            }

            selectElement.append(option);
        });
    });
}

//! Get the country code from the selected country and render the info modal
function handleInfoButtonClick(selectedCountryName) {
    $.getJSON('assets/php/getCountryList.php', function (data) {
        var selectedCountryCode = '';
        $.each(data, function (index, country) {
            if (country.name === selectedCountryName) {
                selectedCountryCode = country.iso_a2;
            }
        });

        if (selectedCountryCode !== '') {
            renderInfoModal(selectedCountryName, selectedCountryCode);
        }
    });
}

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

//! classify the magnitude of an earthquake
function richterScale(magnitude) {
    if (magnitude < 3.0) {
        return 'Microtremor';
    } else if (magnitude < 4.0) {
        return 'Minor earthquake';
    } else if (magnitude < 5.0) {
        return 'Moderate earthquake';
    } else if (magnitude < 6.0) {
        return 'Strong earthquake';
    } else if (magnitude >= 6.0) {
        return 'Major earthquake';
    } else {
        return 'Unknown';
    }
}

//! Get wikipedia article about a country from wikipediaSearch.php
async function getWikipediaArticle(north, south, east, west) {
    try {
        console.log('north=' + north + '\n&south=' + south + '\n&east=' + east + '\n&west=' + west);
        const response = await fetch('assets/php/wikipediaSearch.php?north=' + north + '&south=' + south + '&east=' + east + '&west=' + west);
        const data = await response.json();
        console.log(data.data[0]);
        return data;
    } catch (error) {
        console.log(error);
        return null;
    }
}

//! Get weather info from getWeatherInfo.php by latitude and longitude
async function getWeatherInfo(latitude, longitude) {
    try {
        const response = await fetch('assets/php/getWeatherInfo.php?lat=' + latitude + '&lng=' + longitude);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
        return null;
    }
}


//* End of general functions

//* Leaflet helper functions

async function toggleMarkers() {
    if (markersVisible) {
        removeMarkers();
        markersVisible = false;

    } else {
        var cardinalCoordinates = await getCountryInfoByCode(countryCode);
        var north = cardinalCoordinates.north;
        var south = cardinalCoordinates.south;
        var east = cardinalCoordinates.east;
        var west = cardinalCoordinates.west;

        addEarthquakes(north, south, east, west);

        markersVisible = true;

    }
}

function onMarkerClick(earthquake) {

    const datetime = new Date(earthquake.datetime); // Convert datetime string to a Date object

    const formattedDate = datetime.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    popup
        .setLatLng([earthquake.lat, earthquake.lng])
        .setContent(
            "Richter Scale: " + earthquake.magnitude + "<br>" +
            "Magnitude: " + richterScale(Number(earthquake.magnitude)) + "<br>" +
            "Depth: " + earthquake.depth + "km<br />" +
            "Date: " + formattedDate + "<br />" +
            "Coordinates: " + earthquake.lat + ", " + earthquake.lng + "<br />"
        )
        .openOn(map);
}

//! Add earthquake markers to the map
async function addEarthquakes(north, south, east, west) {
    console.log('north: ' + north + ', south: ' + south + ', east: ' + east + ', west: ' + west);
    const response = await fetch('assets/php/earthquakes.php?north=' + north + '&south=' + south + '&east=' + east + '&west=' + west);
    const data = await response.json();
    data.data.forEach(function (earthquake) {
        var lat = earthquake.lat;
        var lng = earthquake.lng;

        // customize the marker
        var earthquakeIcon = L.divIcon({
            className: 'custom-marker-icon',
            html: '<i class="fa-solid fa-house-chimney-crack"></i>',
            iconSize: [20, 20],
            iconAnchor: [20, 40]
        });

        // Crie um marcador usando as coordenadas lat e lng
        var marker = L.marker([lat, lng], { icon: earthquakeIcon });

        // Adiciona um evento de clique ao marcador para exibir as informações
        marker.on('click', function () {
            onMarkerClick(earthquake);
        });

        // Adicione o marcador à matriz earthquakeMarkers
        earthquakeMarkers.push(marker);

        // Adicione o marcador ao mapa
        marker.addTo(map);
    });
}

function removeMarkers() {
    if (earthquakeMarkers.length > 0) {
        earthquakeMarkers.forEach(function (marker) {
            marker.remove();
        });
        earthquakeMarkers = [];
    }
}

function hideLoadingModal() {
    $('#modal .loading-text').remove(); // Remove the loading dots text
}

async function renderInfoModal(countryCode) {
    showLoadingModal();

    var countryInfo = await getCountryInfoByCode(countryCode);

    // Atualize o título do modal
    $('#modalLabel').text(countryInfo.countryName + ' Information');

    // Limpe o conteúdo atual do modal
    $('#modal .modal-body').empty();

    // Crie elementos HTML para as informações do país
    var capitalElement = $('<p>').append($('<span class="title-info">').text('Capital: '), countryInfo.capital);
    var populationElement = $('<p>').append($('<span class="title-info">').text('Population: '), countryInfo.population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
    var areaElement = $('<p>').append($('<span class="title-info">').text('Area: '), countryInfo.areaInSqKm.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' km²');
    var continentElement = $('<p>').append($('<span class="title-info">').text('Continent: '), countryInfo.continentName);

    // Adicione os elementos criados ao modal
    $('#modal .modal-body').append(capitalElement, populationElement, areaElement, continentElement);

    hideLoadingModal(); // Hide the loading modal after the information is rendered
}

//! Convert timestamp to hh:mm format
function timestampToTime(timestamp) {
    var date = new Date(timestamp * 1000);
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var formattedTime = hours + ':' + minutes.substr(-2);
    return formattedTime;
}


//! Render weather modal
async function renderWeatherModal(countryName) {
    showLoadingModal();
    var coordinates = await getCoordinatesFromCountry(countryName);
    var weatherInfo = await getWeatherInfo(coordinates[0], coordinates[1]);

    // date dd/mm/yyyy
    var date = new Date();
    var weatherDescription = (weatherInfo.weather[0].description);
    var temperature = ((weatherInfo.main.temp - 273.15).toFixed(1) + '°C');
    var feelsLike = ((weatherInfo.main.feels_like - 273.15).toFixed(1) + '°C');
    var minTemperature = ((weatherInfo.main.temp_min - 273.15).toFixed(1) + '°C');
    var maxTemperature = ((weatherInfo.main.temp_max - 273.15).toFixed(1) + '°C');
    var humidity = (weatherInfo.main.humidity + '%');
    var windSpeed = (weatherInfo.wind.speed + ' m/s');
    var sunrise = (timestampToTime(weatherInfo.sys.sunrise) + 'h');
    var sunset = (timestampToTime(weatherInfo.sys.sunset) + 'h');

    // Atualize o título do modal
    $('#modalLabel').text('General weather to ' + countryName);

    // Limpe o conteúdo atual do modal
    $('#modal .modal-body').empty();

    // Crie elementos HTML para as informações do tempo
    var weatherElement = $('<p>').append($('<span class="title-info">').text('Weather for today: '), date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear());
    var weatherDescriptionElement = $('<p>').append($('<span class="title-info">').text('Weather description: '), weatherDescription);
    var temperatureElement = $('<p>').append($('<span class="title-info">').text('Temperature: '), temperature);
    var feelsLikeElement = $('<p>').append($('<span class="title-info">').text('Feels like: '), feelsLike);
    var minTemperatureElement = $('<p>').append($('<span class="title-info">').text('Min temperature: '), minTemperature);
    var maxTemperatureElement = $('<p>').append($('<span class="title-info">').text('Max temperature: '), maxTemperature);
    var humidityElement = $('<p>').append($('<span class="title-info">').text('Humidity: '), humidity);
    var windSpeedElement = $('<p>').append($('<span class="title-info">').text('Wind speed: '), windSpeed);
    var sunriseElement = $('<p>').append($('<span class="title-info">').text('Sunrise: '), sunrise);
    var sunsetElement = $('<p>').append($('<span class="title-info">').text('Sunset: '), sunset);

    // Adicione os elementos criados ao modal
    $('#modal .modal-body').append(weatherElement, weatherDescriptionElement, temperatureElement, feelsLikeElement, minTemperatureElement, maxTemperatureElement, humidityElement, windSpeedElement, sunriseElement, sunsetElement);

    hideLoadingModal(); // Hide the loading modal after the information is rendered
}

//! Render wikipedia modal
async function renderWikipediaModal(countryCode) {
    showLoadingModal();

    var countryInfo = await getCountryInfoByCode(countryCode);
    var cardinalCoordinates = await getCountryInfoByCode(countryInfo.countryCode);
    var wikiInfo = await getWikipediaArticle(cardinalCoordinates.north, cardinalCoordinates.south, cardinalCoordinates.east, cardinalCoordinates.west);

    // Atualize o título do modal
    $('#modalLabel').text('Wikipedia insights to ' + countryInfo.countryName);

    // Limpe o conteúdo atual do modal
    $('#modal .modal-body').empty();

    // Crie elementos HTML para as informações da wikipedia
    var wikiSummaryElement = $('<p>').append($('<span class="title-info">').text('Wikipedia Insights: '), wikiInfo.data[0].summary);
    var wikiLinkElement = $('<p>').append(
        $('<span class="title-info">').text('Keep reading at Wikipedia: '),
        $('<a target="blank">').attr('href', 'https://' + wikiInfo.data[0].wikipediaUrl).text(countryInfo.countryName + ' insights at Wikipedia'),
    );

    // Adicione os elementos criados ao modal
    $('#modal .modal-body').append(wikiSummaryElement, wikiLinkElement);

    hideLoadingModal(); // Hide the loading modal after the information is rendered

}

//! Render Currency modal
async function renderCurrencyModal(countryCode) {
    showLoadingModal();

    var countryInfo = await getCountryInfoByCode(countryCode);
    var exchangeRate = await getExchangeRate(countryInfo.currencyCode);

    // Atualize o título do modal
    $('#modalLabel').text('Currency exchange rate to ' + countryInfo.currencyName);

    // Limpe o conteúdo atual do modal
    $('#modal .modal-body').empty();

    // Crie elementos HTML para as informações da conversão de moeda
    var currencyElement = $('<p>').append($('<span class="title-info">').text('Currency: '), countryInfo.currencyCode + ' 1 = ' + exchangeRate + ' USD');

    // Adicione os elementos criados ao modal
    $('#modal .modal-body').append(currencyElement);

    hideLoadingModal(); // Hide the loading modal after the information is rendered
}


function showLoadingModal() {
    $('#modalLabel').text('Loading...');
    $('#modal .modal-body').empty();
    $('#modal').modal('show');

    var loadingDots = ['. ', '.. ', '... '];
    var dotIndex = 0;

    var loadingText = $('<p class="loading-text">').text(loadingDots[dotIndex]);
    $('#modal .modal-body').append(loadingText);

    var intervalId = setInterval(function () {
        dotIndex = (dotIndex + 1) % loadingDots.length;
        loadingText.text(loadingDots[dotIndex]);
    }, 500);

    // Store the interval ID so it can be cleared later
    $('#modal').data('intervalId', intervalId);
}




//* End of Leaflet helper functions

//! Loading overlay
$(window).on('load', function () {
    $('#loading-overlay').fadeOut('slow');
});

// * Leaflet codes

//! Map instance and rendering
// map initialization
var map = L.map('map').setView([51.505, -0.09], 15);

// map layer
var mapLayer = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

var mapSatellite = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

var mapHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

var OpenRailwayMap = L.tileLayer('https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Map style: &copy; <a href="https://www.OpenRailwayMap.org">OpenRailwayMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

mapLayer.addTo(map);

//! End of map instance and rendering

//! Map groups

var mapViews = {
    'street': mapLayer,
    'satellite': mapSatellite,
    'hybrid': mapHybrid,
};

var overlays = {
    'world railway': OpenRailwayMap
};

L.control.layers(mapViews, overlays).addTo(map);

//! End of map groups

//! featureGroup object to store the GeoJSON layers
var featureGroup = L.featureGroup().addTo(map);

//! add layers from GeoJSON data to the featureGroup object
$.getJSON('assets/php/geoJSON.php', function (data) {

    L.geoJSON(data, {
        onEachFeature: function (feature, layer) {
            featureGroup.addLayer(layer);
        }
    }).addTo(map);

});

// control buttons
var earthquakeMarkersControl = L.control({ position: 'topleft' });
var infoControl = L.control({ position: 'topleft' });
var weatherControl = L.control({ position: 'topleft' });
var wikipediaControl = L.control({ position: 'topleft' });
var currencyControl = L.control({ position: 'topleft' });


// button html
earthquakeMarkersControl.onAdd = function (map) {
    var button = L.DomUtil.create('button', 'leaflet-bar leaflet-control');
    button.innerHTML = '<i class="fa-solid fa-house-chimney-crack"></i>';
    button.title = 'Last 20 Earthquake Locations';
    button.classList.add('control-button');
    L.DomEvent.on(button, 'click', function () {
        toggleMarkers();
    });
    return button;
};

infoControl.onAdd = function (map) {
    var button = L.DomUtil.create('button', 'leaflet-bar leaflet-control');
    button.innerHTML = '<i class="fas fa-info"></i>';
    button.title = 'Show Country Info';
    button.classList.add('control-button');
    L.DomEvent.on(button, 'click', function () {
        renderInfoModal(countryCode);
    });
    return button;
};

weatherControl.onAdd = function (map) {
    var button = L.DomUtil.create('button', 'leaflet-bar leaflet-control');
    button.innerHTML = '<i class="fas fa-cloud-sun"></i>';
    button.title = 'Current Weather';
    button.classList.add('control-button');
    L.DomEvent.on(button, 'click', function () {
        renderWeatherModal(selectedCountryName);
    });
    return button;
};

wikipediaControl.onAdd = function (map) {
    var button = L.DomUtil.create('button', 'leaflet-bar leaflet-control');
    button.innerHTML = '<i class="fas fa-wikipedia-w"></i>';
    button.title = 'Wikipedia';
    button.classList.add('control-button');
    L.DomEvent.on(button, 'click', function () {
        renderWikipediaModal(countryCode);
    });
    return button;
};

currencyControl.onAdd = function (map) {
    var button = L.DomUtil.create('button', 'leaflet-bar leaflet-control');
    button.innerHTML = '<i class="fas fa-money-bill-wave"></i>';
    button.title = 'Currency';
    button.classList.add('control-button');
    L.DomEvent.on(button, 'click', function () {
        renderCurrencyModal(countryCode);
    });
    return button;
};

// add controls to map
earthquakeMarkersControl.addTo(map);
infoControl.addTo(map);
weatherControl.addTo(map);
wikipediaControl.addTo(map);
currencyControl.addTo(map);

//* End of Leaflet codes

/**
 * Sets the map view and adds a marker at the current location based on the geolocation data.
 * @param {Object} position - The geolocation position object containing latitude and longitude coordinates.
 */
function handleGeolocation(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;

    // Set map view to current location
    map.setView([latitude, longitude], 12);




    //Retrieve country information based on the current location
    $.getJSON('assets/php/geoJSON.php', function (geoJSONdata) {
        var selectedCountry = getCountryFromCoordinates(latitude, longitude, geoJSONdata);
        var selectedCountryCode = getCountryCodeFromCoordinates(latitude, longitude, geoJSONdata);
        countryCode = selectedCountryCode;

        // Get the country name by the current location
        selectedCountryName = getCountryFromCoordinates(latitude, longitude, geoJSONdata);

        // Remove existing layers from the map
        map.eachLayer(function (layer) {
            if (layer !== featureGroup && layer !== mapLayer) {
                map.removeLayer(layer);
            }
        });

        // Highlight the selected country
        featureGroup.eachLayer(function (layer) {
            if (layer.feature.properties.name === selectedCountry) {
                layer.setStyle({ className: 'selected' });
                map.addLayer(layer);
            } else {
                layer.setStyle({ className: '' });
            }
        });

        // Fit the map to the bounds of the selected country
        var selectedLayer = featureGroup.getLayers().find(function (layer) {
            return layer.feature.properties.name === selectedCountry;
        });
        if (selectedLayer) {
            map.fitBounds(selectedLayer.getBounds());
        }

        map.addLayer(mapLayer);

        if (selectedCountryName !== '') {
            var selectedLayer = featureGroup.getLayers().find(function (layer) {
                return layer.feature.properties.name === selectedCountryName;
            });

            if (selectedLayer) {
                map.fitBounds(selectedLayer.getBounds());
            }
        }
    });
}

/**
 * Handles the change event of the country list select element.
 * It updates the map and selected country based on the selected option.
 */
function handleCountryListChange() {
    var selectedCountryCodeList = $(this).find('option:selected').val();
    var selectedCountryList = $(this).find('option:selected').text();
    countryCode = selectedCountryCodeList;
    selectedCountryName = selectedCountryList;
    markersVisible = false;


    // Remove existing layers from the map
    map.eachLayer(function (layer) {
        if (layer !== featureGroup && layer !== mapLayer) {
            map.removeLayer(layer);
        }
    });

    // Highlight the selected country
    featureGroup.eachLayer(function (layer) {
        if (layer.feature.properties.name === selectedCountryList) {
            layer.setStyle({ className: 'selected' });
            map.addLayer(layer);
        } else {
            layer.setStyle({ className: '' });
        }
    });

    // Fit the map to the bounds of the selected country
    var selectedLayer = featureGroup.getLayers().find(function (layer) {
        return layer.feature.properties.name === selectedCountryList;
    });
    if (selectedLayer) {
        map.fitBounds(selectedLayer.getBounds());
    }

    map.addLayer(mapLayer);
}

//! Loading overlay
$(window).on('load', function () {
    $('#loading-overlay').fadeOut('slow');
});

//! Get the current device location and set the map view to it
if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(handleGeolocation);
} else {
    console.log("Geolocation is not supported by this browser.");
}

//! Runs after the page is loaded
$(document).ready(function () {
    updateCountryList();
});

//! Runs when the element with id="countriesList" is changed
$('#countriesList select').change(handleCountryListChange);

//* End of JQuery codes

window.addEventListener('load', function () {
    hideLoadingCircle();
    hideCoverLayer();
});
