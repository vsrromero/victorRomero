//* global variables

var selectedCountryName = '';

//* End of global variables

//* general functions 

//! Check if a point is inside a polygon
function pointInPolygon(latitude, longitude, coordinates) {
    console.log('pointInPolygon');
    var isInPolygon = false;

    for (var i = 0, j = coordinates.length - 1; i < coordinates.length; j = i++) {
        var xi = coordinates[i][0][0];
        var yi = coordinates[i][0][1];
        var xj = coordinates[j][0][0];
        var yj = coordinates[j][0][1];

        var intersect = ((yi > latitude) != (yj > latitude)) &&
            (longitude < (xj - xi) * (latitude - yi) / (yj - yi) + xi);

        if (intersect) {
            isInPolygon = !isInPolygon;
        }
    }

    return isInPolygon;
}

//! Get the country name by latitude and longitude

function getCountryFromCoordinates(latitude, longitude, geoJSON) {
    console.log('getCountryFromCoordinates');
    for (var i = 0; i < geoJSON.features.length; i++) {
        var feature = geoJSON.features[i];
        if (pointInPolygon(latitude, longitude, feature.geometry.coordinates)) {
            return feature.properties.name;
        }
    }
    console.log('No country found');
    return ""; // Retorna uma string vazia se nenhum país for encontrado
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
            console.log(selectedCountryName);
        
        console.log(getCountryFromCoordinates(latitude, longitude, geoJSONdata));

        // Get the country name by the current location
        selectedCountryName = getCountryFromCoordinates(latitude, longitude, geoJSONdata);
        });
    });
} else {
    console.log("Geolocation is not supported by this browser.");
}

//! Get the country list from the database and populate the select element
$(document).ready(function () {
    var selectElement = $('#countriesList select');

    // Fazer a requisição fetch para obter os dados do arquivo PHP
    $.getJSON('assets/php/getCountryList.php', function (data) {

        // var option = $('<option>').attr('value', '').text('Countries list');
        // selectElement.append(option);

        // Iterar pelos dados e criar as opções do <select>
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
    var selectedCountry = $(this).find('option:selected').text();

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

});