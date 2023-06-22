//* global variables

var selectedCountryName = '';

//* End of global variables

//* general functions 
/*
!when using the function away from the methods of select change and geolocation in navigator, sometims the modals are not rendered, so I had to put the function inside the methods
async function renderInfoModal(selectedCountry, selectedCountryCode) {
}
*/

async function getCoordinatesFromCountry(countryName) {
    try {
        const response = await fetch('assets/php/openCage.php?countryName=' + countryName);
        const data = await response.json();
        const country = data.results[0].geometry;
        return [country.lat, country.lng];
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

//* End of general functions

//! Loading overlay
$(window).on('load', function () {
    $('#loading-overlay').fadeOut('slow');
});

// * Leaflet codes

//! Map instance and rendering
// map initialization
var map = L.map('map').setView([51.505, -0.09], 15);

// map layer
var mapLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 16,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

mapLayer.addTo(map);
//! End of map instance and rendering

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
var markerControl = L.control();
var infoControl = L.control();
var weatherControl = L.control();

// button html
markerControl.onAdd = function (map) {
    var button = L.DomUtil.create('button', 'leaflet-bar leaflet-control');
    button.innerHTML = '<i class="fas fa-map-marker-alt"></i>';
    button.title = 'Toggle Markers';
    button.classList.add('control-button');
    L.DomEvent.on(button, 'click', function () {
        toggleMarkers();
    });
    return button;
};

infoControl.onAdd = function (map) {
    var button = L.DomUtil.create('button', 'leaflet-bar leaflet-control');
    button.innerHTML = '<i class="fas fa-info"></i>';
    button.title = 'Show Info';
    button.classList.add('control-button');
    L.DomEvent.on(button, 'click', function () {
        $('#modal').modal('show')
    });
    return button;
};

weatherControl.onAdd = function (map) {
    var button = L.DomUtil.create('button', 'leaflet-bar leaflet-control');
    button.innerHTML = '<i class="fas fa-cloud-sun"></i>';
    button.title = 'Show Weather';
    button.classList.add('control-button');
    L.DomEvent.on(button, 'click', function () {
        $('#weatherModal').modal('show')
    });
    return button;
};

// add controls to map
markerControl.addTo(map);
infoControl.addTo(map);
weatherControl.addTo(map);

//* End of Leaflet codes

//* JQuery codes

//! Get the current device location and set the map view to it
if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(function (position) {
        var latitude = position.coords.latitude;
        var longitude = position.coords.longitude;

        // Set map view to current location
        map.setView([latitude, longitude], 12);

        // Add a marker at the current location
        L.marker([latitude, longitude]).addTo(map);

        $.getJSON('assets/json/countryBorders.geo.json', function (geoJSONdata) {

            var selectedCountry = getCountryFromCoordinates(latitude, longitude, geoJSONdata);
            var selectedCountryCode = getCountryCodeFromCoordinates(latitude, longitude, geoJSONdata);

            // Get the country name by the current location
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
    });
} else {
    console.log("Geolocation is not supported by this browser.");
}

//! Get the country list from the database and populate the select element
$(document).ready(function () {
    var selectElement = $('#countriesList select');

    $.getJSON('assets/php/getCountryList.php', function (data) {
        $.each(data, function (index, country) {
            var option = $('<option>').val(country.iso_a2).text(country.name);

            if (country.name === selectedCountryName) {
                option.attr('selected', 'selected');
            }

            selectElement.append(option);
        });
    });
});

//! 
$('#countriesList select').change(function () {
    var selectedCountryCodeList = $(this).find('option:selected').val();
    var selectedCountryList = $(this).find('option:selected').text();

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

});
