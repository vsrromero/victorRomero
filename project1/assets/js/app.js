//* global variables

let selectedCountryName = '';
let earthquakeMarkers = [];
let markersVisible = false;
let countryCode = '';
let markerCluster;
const popup = L.popup();



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



function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { weekday: 'short', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-GB', options);
    
    const day = date.getDate();
    let daySuffix;
    if (day === 1 || day === 21 || day === 31) {
      daySuffix = 'st';
    } else if (day === 2 || day === 22) {
      daySuffix = 'nd';
    } else if (day === 3 || day === 23) {
      daySuffix = 'rd';
    } else {
      daySuffix = 'th';
    }
    
    return formattedDate + daySuffix;
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
async function getExchangeRate() {
    try {
        const response = await fetch('assets/php/getExchangeRates.php');
        const data = await response.json();
        return data.rates;
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
function isInPolygon(latitude, longitude, coordinates) {
    let isInPolygon = false;

    for (let i = 0; i < coordinates.length; i++) {
        let polygon = coordinates[i];

        for (let j = 0; j < polygon.length; j++) {
            let ring = polygon[j];

            let intersect = false;
            for (let k = 0, l = ring.length - 1; k < ring.length; l = k++) {
                let xi = ring[k][0];
                let yi = ring[k][1];
                let xj = ring[l][0];
                let yj = ring[l][1];

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
    for (let i = 0; i < geoJSON.features.length; i++) {
        let feature = geoJSON.features[i];
        if (isInPolygon(latitude, longitude, feature.geometry.coordinates)) {
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
    for (let i = 0; i < geoJSON.features.length; i++) {
        let feature = geoJSON.features[i];
        if (isInPolygon(latitude, longitude, feature.geometry.coordinates)) {
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
    let selectElement = $('#selectContainer select');

    $.getJSON('assets/php/getCountryList.php', function (data) {
        selectElement.empty();

        $.each(data, function (index, country) {
            let option = $('<option>').val(country.iso_a2).text(country.name);

            if (country.name === selectedCountryName) {
                option.attr('selected', 'selected');
            }

            selectElement.append(option);
        });
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
        const response = await fetch('assets/php/getWeather.php?lat=' + latitude + '&lng=' + longitude);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
        return null;
    }
}

async function getNews(countryCode) {
    try {
        const response = await fetch('assets/php/getNews.php?countryCode=' + countryCode);
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
        let cardinalCoordinates = await getCountryInfoByCode(countryCode);
        let north = cardinalCoordinates.north;
        let south = cardinalCoordinates.south;
        let east = cardinalCoordinates.east;
        let west = cardinalCoordinates.west;

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

    // Create a marker cluster group
    markerCluster = L.markerClusterGroup({
        showCoverageOnHover: true,
        polygonOptions: {
            fillColor: '#fff',
            color: '#050',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.5
        }
    });

    data.data.forEach(function (earthquake) {
        let lat = earthquake.lat;
        let lng = earthquake.lng;

        // Customize the marker with the ExtraMarkers plugin
        const earthquakeIcon = L.ExtraMarkers.icon({
            icon: 'fa-house-chimney-crack',
            markerColor: 'red',
            shape: 'circle',
            prefix: 'fa'
        });

        const marker = L.marker([lat, lng], { icon: earthquakeIcon });

        marker.on('click', function () {
            onMarkerClick(earthquake);
        });

        markerCluster.addLayer(marker); // Add the marker to the marker cluster group

        earthquakeMarkers.push(marker);
    });

    map.addLayer(markerCluster); // Add the marker cluster group to the map
}

/**
 * Removes all earthquake markers from the map.
 */
function removeMarkers() {
    if (earthquakeMarkers.length > 0) {
        earthquakeMarkers.forEach(function (marker) {
            marker.removeFrom(map); // Remove the marker from the map
        });
        earthquakeMarkers = [];
    }

    if (markerCluster) {
        map.removeLayer(markerCluster); // Remove the marker cluster group from the map
        markerCluster.clearLayers(); // Clear all markers inside the marker cluster group
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

    const modalId = 'infoModal';
    const modalLabelId = 'infoModalLabel';
    const modalBodyId = 'infoModalBody';

    showLoadingModal(modalId, modalLabelId, modalBodyId);

    let countryInfo = await getCountryInfoByCode(countryCode);

    $('#' + modalId +' .' + modalBodyId).empty();

    $('#' + modalLabelId).text(countryInfo.countryName + ' Information');
    $('#countryCapital').text(countryInfo.capital);
    $('#countryPopulation').text(countryInfo.population.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','));
    $('#countryArea').html(countryInfo.areaInSqKm.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' km<sup>2');
    $('#countryRegion').text(countryInfo.continentName);

    hideLoadingModal();
}

/**
 * Converts a timestamp to the hh:mm format.
 * 
 * @param {number} timestamp - The timestamp to convert.
 * @returns {string} The time in the hh:mm format.
 */
function timestampToTime(timestamp) {
    let date = new Date(timestamp * 1000);
    let hours = date.getHours();
    let minutes = "0" + date.getMinutes();
    let formattedTime = hours + ':' + minutes.substr(-2);
    return formattedTime;
}


/**
 * Renders the weather modal with weather information for a specific country.
 * 
 * @param {string} countryName - The name of the country.
 */
async function renderWeatherModal(countryName) {
    
    
    const modalId = 'weatherModal';
    const modalLabelId = 'weatherModalLabel';
    const modalBodyId = 'weatherModalBody';
    
    showLoadingModal(modalId, modalLabelId, modalBodyId);
    
    
    let coordinates = await getCoordinatesFromCountry(countryName);
    let weatherInfo = await getWeatherInfo(coordinates[0], coordinates[1]);

    const lastUpdated = new Date(weatherInfo.current.last_updated_epoch);
    let formattedDate = ('0' + lastUpdated.getDate()).slice(-2) + '/' + ('0' + (lastUpdated.getMonth() + 1)).slice(-2) + '/' + lastUpdated.getFullYear();
    let formattedTime = ('0' + lastUpdated.getHours()).slice(-2) + ':' + ('0' + lastUpdated.getMinutes()).slice(-2);
    let formattedDateTime = formattedDate + ' ' + formattedTime;

    $('#' + modalLabelId).text('General weather to ' + countryName);

    $('#' + modalId +' .' + modalBodyId).empty();
    console.log(weatherInfo);
    $('#todayConditions').text(weatherInfo.current.condition.text);
    $('#todayIcon').attr('src', 'https:' + weatherInfo.current.condition.icon);
    $('#todayMaxTemp').text(weatherInfo.forecast.forecastday[0].day.maxtemp_c);
    $('#todayMinTemp').text(weatherInfo.forecast.forecastday[0].day.mintemp_c);
    $('#day1Date').text(formatDate(weatherInfo.forecast.forecastday[0].date));
    $('#day1MaxTemp').text(weatherInfo.forecast.forecastday[1].day.maxtemp_c);
    $('#day1MinTemp').text(weatherInfo.forecast.forecastday[1].day.mintemp_c);
    $('#day2Date').text(formatDate(weatherInfo.forecast.forecastday[1].date));
    $('#day2MaxTemp').text(weatherInfo.forecast.forecastday[2].day.maxtemp_c);
    $('#day2MinTemp').text(weatherInfo.forecast.forecastday[2].day.mintemp_c);
    $('#lastUpdated').text(formattedDateTime);

    hideLoadingModal();
}

/**
 * Renders the Wikipedia modal with insights for a specific country and neighbourhood.
 * 
 * @param {string} countryCode - The country code.
 */
async function renderWikipediaModal(countryCode) {

    const modalId = 'wikiModal';
    const modalLabelId = 'wikiModalLabel';
    const modalBodyId = 'wikiModalBody';
    const modalLinkId = 'wikiModalLink';

    showLoadingModal(modalId, modalLabelId, modalBodyId);

    let countryInfo = await getCountryInfoByCode(countryCode);
    let cardinalCoordinates = await getCountryInfoByCode(countryInfo.countryCode);
    let wikiInfo = await getWikipediaArticle(cardinalCoordinates.north, cardinalCoordinates.south, cardinalCoordinates.east, cardinalCoordinates.west);

    $('#' + modalLabelId).text(countryInfo.countryName);

    $('#' + modalId +' .' + modalBodyId).empty();
    $('#' + modalBodyId).text(wikiInfo.data[0].summary);
    $('#' + modalLinkId).attr('href', 'https://' + wikiInfo.data[0].wikipediaUrl).text(countryInfo.countryName );

    hideLoadingModal();
}

/**
 * Renders the Currency modal with the exchange rate for a specific country's currency and allows user to input a value to convert.
 * 
 * @param {string} countryCode - The country code.
 */
async function renderCurrencyModal() {
    const modalId = 'currencyModal';
    const fromAmountInput = $('#fromAmount');
    const toAmountInput = $('#toAmount');
    const exchangeRateSelect = $('#exchangeRate');

    showLoadingModal(modalId);

    const exchangeRate = await getExchangeRate();

    exchangeRateSelect.empty();

    for (const currency in exchangeRate) {
        const option = $('<option></option>');
        option.val(exchangeRate[currency]);
        option.text(currency);
        exchangeRateSelect.append(option);
    }

    fromAmountInput.on('input', updateToAmount);
    exchangeRateSelect.on('change', updateToAmount);

    updateToAmount();

    hideLoadingModal(modalId);
}

async function renderNewsModal(countryCode) {
    const modalId = 'newsModal';
    const modalLabelId = 'newsModalLabel';
    const modalBodyId = 'newsModalBody';

    showLoadingModal(modalId, modalLabelId, modalBodyId);

    $('#' + modalBodyId).empty();

    // update country name in modal
    let countryInfo = await getCountryInfoByCode(countryCode);
    $('#' + modalLabelId).text(countryInfo.countryName);

    let articles = await getNews(countryCode);

    console.log(articles);

    if (articles.news.length === 0) {
        $('#' + modalBodyId).append(
            $('<p class="text-center">').text('No news found for this country.')
        );
    } else {
    articles.news.forEach(article => {
            $('#' + modalBodyId).append(
                $('<table class="table table-borderless">').append(
                    $('<tbody>').append(
                        $('<tr>').append(
                            $('<td rowspan="2" width="50%">').append(
                                $('<img  class="img-fluid rounded">').attr('src', article.image)
                            )
                        ).append(
                            $('<td>').append(
                                $('<a class="fw-bold fs-6 text-black">').attr('href', article.url).text(article.title).attr('target', '_blank')
                            )
                        )
                    ).append(
                        $('<tr>').append(
                            $('<td>').text('Author: ' + article.author)
                        )
                    )
                )
            );
        });
    }

    hideLoadingModal();
}


function updateToAmount() {
    const fromAmountInput = $('#fromAmount');
    const toAmountInput = $('#toAmount');
    const exchangeRateSelect = $('#exchangeRate');

    const fromAmount = parseFloat(fromAmountInput.val());
    const exchangeRate = parseFloat(exchangeRateSelect.val());

    const toAmount = fromAmount * exchangeRate;
    toAmountInput.val(toAmount.toFixed(2));
}


function showLoadingModal(modalId, modalLabelId, modalBodyId) {
    $('#' + modalLabelId).text('Loading...');
    $('#' + modalId + ' .' + modalBodyId).empty();
    $('#' + modalId).modal('show');

    const loadingDots = ['. ', '.. ', '... '];
    let dotIndex = 0;

    const loadingText = $('<p class="loading-text">').text(loadingDots[dotIndex]);
    $('#' + modalId + ' .' + modalBodyId).append(loadingText);

    const intervalId = setInterval(function () {
        dotIndex = (dotIndex + 1) % loadingDots.length;
        loadingText.text(loadingDots[dotIndex]);
    }, 500);

    $('#' + modalId).data('intervalId', intervalId);
}




//* End of Leaflet helper functions

$(window).on('load', function () {
    $('#loading-overlay').fadeOut('slow');
});

// * Leaflet codes

// map initialization
const map = L.map('map').setView([51.505, -0.09], 15);

// map layer
const mapLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

const mapSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

const OpenRailwayMap = L.tileLayer('https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Map style: &copy; <a href="https://www.OpenRailwayMap.org">OpenRailwayMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

mapLayer.addTo(map);


const mapViews = {
    'street': mapLayer,
    'satellite': mapSatellite,
};

const overlays = {
    'world railway': OpenRailwayMap
};

L.control.layers(mapViews, overlays).addTo(map);

const featureGroup = L.featureGroup().addTo(map);

$.getJSON('assets/php/geoJSON.php', function (data) {

    L.geoJSON(data, {
        onEachFeature: function (feature, layer) {
            featureGroup.addLayer(layer);
        },
        style: function (feature) {
            return {
                color: '#585',
                fillColor: '#585',
                fillOpacity: 0.1,
                weight: 2
            }
        }
    }).addTo(map);

});



// control buttons
const earthquakeMarkersControl = L.control({ position: 'topleft' });
const infoControl = L.control({ position: 'topleft' });
const weatherControl = L.control({ position: 'topleft' });
const wikipediaControl = L.control({ position: 'topleft' });
const currencyControl = L.control({ position: 'topleft' });
const newsControl = L.control({ position: 'topleft' });


// button html
earthquakeMarkersControl.onAdd = function (map) {
    const button = L.DomUtil.create('button', 'leaflet-bar leaflet-control');
    button.innerHTML = '<i class="fa-solid fa-house-chimney-crack"></i>';
    button.title = 'Last 20 Nearby Earthquake Locations';
    button.classList.add('control-button');
    L.DomEvent.on(button, 'click', function () {
        toggleMarkers();
    });
    return button;
};

infoControl.onAdd = function (map) {
    const button = L.DomUtil.create('button', 'leaflet-bar leaflet-control');
    button.innerHTML = '<i class="fas fa-info"></i>';
    button.title = 'Show Country Info';
    button.classList.add('control-button');
    L.DomEvent.on(button, 'click', function () {
        renderInfoModal(countryCode);
    });
    return button;
};

weatherControl.onAdd = function (map) {
    const button = L.DomUtil.create('button', 'leaflet-bar leaflet-control');
    button.innerHTML = '<i class="fas fa-cloud-sun"></i>';
    button.title = 'Current Weather';
    button.classList.add('control-button');
    L.DomEvent.on(button, 'click', function () {
        renderWeatherModal(selectedCountryName);
    });
    return button;
};

wikipediaControl.onAdd = function (map) {
    const button = L.DomUtil.create('button', 'leaflet-bar leaflet-control');
    button.innerHTML = '<i class="fa-brands fa-wikipedia-w"></i>';
    button.title = 'Wikipedia';
    button.classList.add('control-button');
    L.DomEvent.on(button, 'click', function () {
        renderWikipediaModal(countryCode);
    });
    return button;
};

currencyControl.onAdd = function (map) {
    const button = L.DomUtil.create('button', 'leaflet-bar leaflet-control');
    button.innerHTML = '<i class="fas fa-money-bill-wave"></i>';
    button.title = 'Currency';
    button.classList.add('control-button');
    L.DomEvent.on(button, 'click', function () {
        renderCurrencyModal();
    });
    return button;
};

newsControl.onAdd = function (map) {
    const button = L.DomUtil.create('button', 'leaflet-bar leaflet-control');
    button.innerHTML = '<i class="fas fa-newspaper"></i>';
    button.title = 'News';
    button.classList.add('control-button');
    L.DomEvent.on(button, 'click', function () {
        renderNewsModal(countryCode);
    });
    return button;
};

// add controls to map
earthquakeMarkersControl.addTo(map);
infoControl.addTo(map);
weatherControl.addTo(map);
wikipediaControl.addTo(map);
currencyControl.addTo(map);
newsControl.addTo(map);

//* End of Leaflet codes

/**
 * Sets the map view and adds a marker at the current location based on the geolocation data.
 * @param {Object} position - The geolocation position object containing latitude and longitude coordinates.
 */
function handleGeolocation(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    map.setView([latitude, longitude], 12);

    $.getJSON('assets/php/geoJSON.php', function (geoJSONdata) {
        const selectedCountry = getCountryFromCoordinates(latitude, longitude, geoJSONdata);
        const selectedCountryCode = getCountryCodeFromCoordinates(latitude, longitude, geoJSONdata);
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

        const selectedLayer = featureGroup.getLayers().find(function (layer) {
            return layer.feature.properties.name === selectedCountry;
        });
        if (selectedLayer) {
            map.fitBounds(selectedLayer.getBounds());
        }

        map.addLayer(mapLayer);

        if (selectedCountryName !== '') {
            const selectedLayer = featureGroup.getLayers().find(function (layer) {
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
    const selectedCountryCodeList = $(this).find('option:selected').val();
    const selectedCountryList = $(this).find('option:selected').text();
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

    const selectedLayer = featureGroup.getLayers().find(function (layer) {
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

//! Runs when the element with id="selectContainer" is changed
$('#selectContainer select').change(handleCountryListChange);

//* End of JQuery codes

window.addEventListener('load', function () {
    hideLoadingCircle();
    hideCoverLayer();
});
