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
    return ""; 
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
    return ""; 
}

//! update the country list on the select element
function updateCountryList() {
    var selectElement = $('#countriesList select');

    $.getJSON('assets/php/getCountryList.php', function (data) {
        selectElement.empty(); 

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
        const response = await fetch('assets/php/wikipediaSearch.php?north=' + north + '&south=' + south + '&east=' + east + '&west=' + west);
        const data = await response.json();
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
    const response = await fetch('assets/php/earthquakes.php?north=' + north + '&south=' + south + '&east=' + east + '&west=' + west);
    const data = await response.json();
    data.data.forEach(function (earthquake) {
        var lat = earthquake.lat;
        var lng = earthquake.lng;

        var earthquakeIcon = L.divIcon({
            className: 'custom-marker-icon',
            html: '<i class="fa-solid fa-house-chimney-crack"></i>',
            iconSize: [20, 20],
            iconAnchor: [20, 40]
        });

        var marker = L.marker([lat, lng], { icon: earthquakeIcon });

        marker.on('click', function () {
            onMarkerClick(earthquake);
        });

        earthquakeMarkers.push(marker);

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
    $('#modal .loading-text').remove();
}

async function renderInfoModal(countryCode) {
    showLoadingModal();

    var countryInfo = await getCountryInfoByCode(countryCode);
    var exchangeRate = await getExchangeRate(countryInfo.currencyCode);
    var cardinalCoordinates = await getCountryInfoByCode(countryInfo.countryCode);
    var wikiInfo = await getWikipediaArticle(cardinalCoordinates.north, cardinalCoordinates.south, cardinalCoordinates.east, cardinalCoordinates.west);

    $('#modalLabel').text(countryInfo.countryName + ' Information');

    $('#modal .modal-body').empty();

    var capitalElement = $('<p>').append($('<span class="title-info">').text('Capital: '), countryInfo.capital);
    var populationElement = $('<p>').append($('<span class="title-info">').text('Population: '), countryInfo.population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
    var areaElement = $('<p>').append($('<span class="title-info">').text('Area: '), countryInfo.areaInSqKm.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' km²');
    var continentElement = $('<p>').append($('<span class="title-info">').text('Continent: '), countryInfo.continentName);
    var currencyElement = $('<p>').append($('<span class="title-info">').text('Currency: '), countryInfo.currencyCode + ' 1 = ' + exchangeRate + ' USD');
    var wikiSummaryElement = $('<p>').append($('<span class="title-info">').text('Wikipedia Insights: '), wikiInfo.data[0].summary);
    var wikiLinkElement = $('<p>').append(
        $('<span class="title-info">').text('Keep reading at Wikipedia: '),
        $('<a target="blank">').attr('href', 'https://' + wikiInfo.data[0].wikipediaUrl).text(countryInfo.countryName + ' insights at Wikipedia'),
    );

    $('#modal .modal-body').append(capitalElement, populationElement, areaElement, continentElement, currencyElement, wikiSummaryElement, wikiLinkElement);

    hideLoadingModal();
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

    $('#modalLabel').text('General weather to ' + countryName);

    $('#modal .modal-body').empty();

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

    $('#modal .modal-body').append(weatherElement, weatherDescriptionElement, temperatureElement, feelsLikeElement, minTemperatureElement, maxTemperatureElement, humidityElement, windSpeedElement, sunriseElement, sunsetElement);

    hideLoadingModal(); 
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

// map layers
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
$.getJSON('assets/json/countryBorders.geo.json', function (data) {

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

// add controls to map
earthquakeMarkersControl.addTo(map);
infoControl.addTo(map);
weatherControl.addTo(map);

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

    $.getJSON('assets/json/countryBorders.geo.json', function (geoJSONdata) {
        var selectedCountry = getCountryFromCoordinates(latitude, longitude, geoJSONdata);
        var selectedCountryCode = getCountryCodeFromCoordinates(latitude, longitude, geoJSONdata);
        countryCode = selectedCountryCode;
        
        selectedCountryName = getCountryFromCoordinates(latitude, longitude, geoJSONdata);

        map.eachLayer(function (layer) {
            if (layer !== featureGroup && layer !== mapLayer) {
                map.removeLayer(layer);
            }
        });

        featureGroup.eachLayer(function (layer) {
            if (layer.feature.properties.name === selectedCountry) {
                layer.setStyle({ className: 'selected' });
                map.addLayer(layer);
            } else {
                layer.setStyle({ className: '' });
            }
        });

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

    map.eachLayer(function (layer) {
        if (layer !== featureGroup && layer !== mapLayer) {
            map.removeLayer(layer);
        }
    });

    featureGroup.eachLayer(function (layer) {
        if (layer.feature.properties.name === selectedCountryList) {
            layer.setStyle({ className: 'selected' });
            map.addLayer(layer);
        } else {
            layer.setStyle({ className: '' });
        }
    });

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