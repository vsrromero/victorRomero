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

function showLoadingCircle() {
    $('#loading-circle').css('display', 'block');
}

showLoadingCircle();

function hideLoadingCircle() {
    $('#loading-circle').css('display', 'none');
}

function hideCoverLayer() {
    $('#cover-layer').css('display', 'none');
}

/**
 * Retrieves the coordinates (latitude and longitude) of a given country using the OpenCage Geocoding API.
 * 
 * @param {string} countryName - The name of the country for which to fetch the coordinates.
 * @returns {Promise<Array<number>>} A promise that resolves to an array containing the latitude and longitude of the country. If an error occurs, it returns null.
 */
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

/**
 * Retrieves the exchange rate for a given currency code using the Open Exchange API.
 * 
 * @param {string} currencyCode - The currency code for which to fetch the exchange rate.
 * @returns {Promise<number>} A promise that resolves to the exchange rate of the specified currency. If an error occurs, it returns null.
 */
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

/**
 * Retrieves country information for a given country code using the countryInfo.php API.
 * 
 * @param {string} countryCode - The country code for which to fetch the information.
 * @returns {Promise<object|null>} A promise that resolves to an object containing country information. If an error occurs, it returns null.
 */
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

/**
 * Checks if a given point is inside a polygon defined by its coordinates.
 * 
 * @param {number} latitude - The latitude of the point to check.
 * @param {number} longitude - The longitude of the point to check.
 * @param {Array<Array<Array<number>>>} coordinates - The coordinates defining the polygon.
 * @returns {boolean} A boolean indicating whether the point is inside the polygon.
 */
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

/**
 * Retrieves the country name based on given coordinates using a GeoJSON object.
 * 
 * @param {number} latitude - The latitude of the coordinates.
 * @param {number} longitude - The longitude of the coordinates.
 * @param {Object} geoJSON - The GeoJSON object containing country features.
 * @returns {string} The name of the country corresponding to the coordinates.
 */
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

/**
 * Retrieves the country code based on given coordinates using a GeoJSON object.
 * 
 * @param {number} latitude - The latitude of the coordinates.
 * @param {number} longitude - The longitude of the coordinates.
 * @param {Object} geoJSON - The GeoJSON object containing country features.
 * @returns {string} The ISO country code corresponding to the coordinates.
 */
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

/**
 * Updates the country list in the HTML select element with data retrieved from the server.
 */
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

/**
 * Handles the click event of the info button for a selected country.
 *
 * @param {string} selectedCountryName - The name of the selected country.
 */
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

/**
 * Determines the classification of an earthquake based on its magnitude using the Richter scale.
 *
 * @param {number} magnitude - The magnitude of the earthquake.
 * @returns {string} The classification of the earthquake.
 */
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

/**
 * Retrieves Wikipedia article data within the specified geographical boundaries.
 *
 * @param {number} north - The northern boundary latitude.
 * @param {number} south - The southern boundary latitude.
 * @param {number} east - The eastern boundary longitude.
 * @param {number} west - The western boundary longitude.
 * @returns {Object|null} The retrieved Wikipedia article data, or null if an error occurs.
 */
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

/**
 * Retrieves weather information for the specified latitude and longitude.
 *
 * @param {number} latitude - The latitude coordinate.
 * @param {number} longitude - The longitude coordinate.
 * @returns {Object|null} The retrieved weather information, or null if an error occurs.
 */
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

/**
 * Toggles the visibility of markers on the map.
 * If markers are currently visible, they will be removed.
 * If markers are not currently visible, earthquake markers will be added based on the country's cardinal coordinates.
 */
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

/**
 * Handles the click event on an earthquake marker.
 * Displays a popup with information about the earthquake.
 *
 * @param {Object} earthquake - The earthquake object containing information about the earthquake.
 */
function onMarkerClick(earthquake) {

    const datetime = new Date(earthquake.datetime);

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

/**
 * Fetches earthquake data from the server and adds markers for each earthquake within the specified bounding box.
 *
 * @param {number} north - The northern latitude of the bounding box.
 * @param {number} south - The southern latitude of the bounding box.
 * @param {number} east - The eastern longitude of the bounding box.
 * @param {number} west - The western longitude of the bounding box.
 */
async function addEarthquakes(north, south, east, west) {
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

        var marker = L.marker([lat, lng], { icon: earthquakeIcon });

        marker.on('click', function () {
            onMarkerClick(earthquake);
        });

        earthquakeMarkers.push(marker);

        marker.addTo(map);
    });
}

/**
 * Removes all earthquake markers from the map.
 */
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

/**
 * Renders the information modal for a given country.
 * 
 * @param {string} countryCode - The country code of the country.
 */
async function renderInfoModal(countryCode) {
    showLoadingModal();

    var countryInfo = await getCountryInfoByCode(countryCode);

    $('#modalLabel').text(countryInfo.countryName + ' Information');

    $('#modal .modal-body').empty();

    var capitalElement = $('<p>').append($('<span class="title-info">').text('Capital: '), countryInfo.capital);
    var populationElement = $('<p>').append($('<span class="title-info">').text('Population: '), countryInfo.population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
    var areaElement = $('<p>').append($('<span class="title-info">').text('Area: '), countryInfo.areaInSqKm.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' km²');
    var continentElement = $('<p>').append($('<span class="title-info">').text('Continent: '), countryInfo.continentName);

    $('#modal .modal-body').append(capitalElement, populationElement, areaElement, continentElement);

    hideLoadingModal();
}

/**
 * Converts a timestamp to the hh:mm format.
 * 
 * @param {number} timestamp - The timestamp to convert.
 * @returns {string} The time in the hh:mm format.
 */
function timestampToTime(timestamp) {
    var date = new Date(timestamp * 1000);
    var hours = date.getHours();
    var minutes = "0" + date.getMinutes();
    var formattedTime = hours + ':' + minutes.substr(-2);
    return formattedTime;
}


/**
 * Renders the weather modal with weather information for a specific country.
 * 
 * @param {string} countryName - The name of the country.
 */
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

/**
 * Renders the Wikipedia modal with insights for a specific country and neighbourhood.
 * 
 * @param {string} countryCode - The country code.
 */
async function renderWikipediaModal(countryCode) {
    showLoadingModal();

    var countryInfo = await getCountryInfoByCode(countryCode);
    var cardinalCoordinates = await getCountryInfoByCode(countryInfo.countryCode);
    var wikiInfo = await getWikipediaArticle(cardinalCoordinates.north, cardinalCoordinates.south, cardinalCoordinates.east, cardinalCoordinates.west);

    $('#modalLabel').text('Wikipedia insights to ' + countryInfo.countryName);

    $('#modal .modal-body').empty();

    var wikiSummaryElement = $('<p>').append($('<span class="title-info">').text('Wikipedia Insights: '), wikiInfo.data[0].summary);
    var wikiLinkElement = $('<p>').append(
        $('<span class="title-info">').text('Keep reading at Wikipedia: '),
        $('<a target="blank">').attr('href', 'https://' + wikiInfo.data[0].wikipediaUrl).text(countryInfo.countryName + ' insights at Wikipedia'),
    );

    $('#modal .modal-body').append(wikiSummaryElement, wikiLinkElement);

    hideLoadingModal();
}

/**
 * Renders the Currency modal with the exchange rate for a specific country's currency.
 * 
 * @param {string} countryCode - The country code.
 */
async function renderCurrencyModal(countryCode) {
    showLoadingModal();

    var countryInfo = await getCountryInfoByCode(countryCode);
    var exchangeRate = await getExchangeRate(countryInfo.currencyCode);

    $('#modalLabel').text('Currency exchange rate to ' + countryInfo.currencyName);

    $('#modal .modal-body').empty();

    var currencyElement = $('<p>').append($('<span class="title-info">').text('Currency: '), countryInfo.currencyCode + ' 1 = ' + exchangeRate + ' USD');

    $('#modal .modal-body').append(currencyElement);

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

$(window).on('load', function () {
    $('#loading-overlay').fadeOut('slow');
});

// * Leaflet codes

// map initialization
var map = L.map('map').setView([51.505, -0.09], 15);

// map layer
var mapLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var mapSatellite = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});

var OpenRailwayMap = L.tileLayer('https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Map style: &copy; <a href="https://www.OpenRailwayMap.org">OpenRailwayMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

mapLayer.addTo(map);


var mapViews = {
    'street': mapLayer,
    'satellite': mapSatellite,
};

var overlays = {
    'world railway': OpenRailwayMap
};

L.control.layers(mapViews, overlays).addTo(map);

var featureGroup = L.featureGroup().addTo(map);

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

    map.setView([latitude, longitude], 12);

    $.getJSON('assets/php/geoJSON.php', function (geoJSONdata) {
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

window.addEventListener('load', function () {
    hideLoadingCircle();
    hideCoverLayer();
});
