var countryName;
var markersVisible = true;
var zoomLevel = 6;
var countryCode;
var countries;
var adminName1; // State/Province/Region
var coordinatesToTravel = null; // Coordinates to travel to

async function getCountryByLocation(lat, lng) {
    try {
        const response = await axios.get('../assets/php/getPlaceByPosition.php?lat=' + lat + '&lng=' + lng);
        countryName = response.data.data[0].countryName;
        countryCode = response.data.data[0].countryCode;
        adminName1 = response.data.data[0].adminName1;
    } catch (error) {
        console.log(error);
    }
}



function handleLocationCoordinates(lat, lng) {
    //Map initialization
    var map = L.map('map').setView([lat, lng], zoomLevel);

    //OpenStreetMap Layer
    var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    osm.addTo(map);

    //Marker initial state
    var marker = null;

    function addMarker() {
        if (!marker) {
            marker = L.marker([lat, lng], { icon: standardLocationPin }).addTo(map);
        }
    }

    function removeMarker() {
        if (marker) {
            map.removeLayer(marker);
            marker = null;
        }
    }

    getCountryByLocation(lat, lng);

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

    function toggleMarkers() {
        if (markersVisible) {
            removeMarker();
        } else {
            addMarker();
        }
        markersVisible = !markersVisible;
    }

    //add coutnry name and data to the modal
    $('#modal').on('show.bs.modal', function (event) {
        var modal = $(this);
        modal.find('.modal-title').text(countryName);
        modal.find('.modal-body').html('<div class="spinner-border text-primary" role="status"><span class="sr-only">Loading...</span></div>');
        axios.get('../assets/php/countriesRequest.php?countryCode=' + countryCode)
            .then(function (response) {
                var countryInfo = response.data.data[0];
                var modalBody = modal.find('.modal-body');
                modalBody.html('');
                modalBody.append('<p><strong>Capital:</strong> ' + countryInfo.capital + '</p>');
                modalBody.append('<p><strong>Population:</strong> ' + countryInfo.population + '</p>');
                modalBody.append('<p><strong>Area:</strong> ' + countryInfo.areaInSqKm + ' km²</p>');
                modalBody.append('<p><strong>Continent:</strong> ' + countryInfo.continentName + '</p>');
                modalBody.append('<p><strong>Languages:</strong> ' + countryInfo.languages + '</p>');
                modalBody.append('<p><strong>Currency:</strong> ' + countryInfo.currencyCode + '</p>');
            })
    });

    //add weather to the #weatherModal
    $('#weatherModal').on('show.bs.modal', function (event) {
        console.log(adminName1);
        var modal = $(this);
        modal.find('.modal-title').text(countryName);
        modal.find('.modal-body').html('<div class="spinner-border text-primary" role="status"><span class="sr-only">Loading...</span></div>');
        axios.get('../assets/php/getWeatherInfo.php?adminName1=' + adminName1)
            .then(function (response) {
                var weatherInfo = response.data.current;
                var modalBody = modal.find('.modal-body');
                modalBody.html('');
                modalBody.append('<p><strong>Temperature:</strong> ' + weatherInfo.temperature + '°C</p>');
                modalBody.append('<p><strong>Humidity:</strong> ' + weatherInfo.humidity + '%</p>');
                modalBody.append('<p><strong>Wind:</strong> ' + weatherInfo.wind_speed + 'km/h</p>');
                modalBody.append('<p><strong>Weather:</strong> ' + weatherInfo.weather_descriptions[0] + '</p>');
            })
            .catch(function (error) {
                console.log(error);
            });
    });

    //get list of countries
    $(document).ready(function () {
        $('#loading-overlay').fadeOut('slow');

        axios.get('../assets/php/countriesRequest.php')
            .then(function (response) {
                countries = response.data.data;

                var selectElement = $('#countriesList select');

                // Make the first option selected as "select a country"
                var option = $('<option>').attr('value', '').text('Countries list');
                selectElement.append(option);

                // Renders the <select><option> elements with all countries
                countries.forEach(function (country) {
                    var option = $('<option>').attr('value', country.countryName).text(country.countryName);
                    selectElement.append(option);
                });

                // Get the country coordinates and set map view when the user selects a country
                selectElement.change(function () {
                    var selectedCountry = $(this).val();
                    axios.get('../assets/php/getCountryByName.php?countryName=' + selectedCountry)
                        .then(function (response) {
                            var country = response.data.results[0].geometry;
                            coordinatesToTravel = [country.lat, country.lng];

                            console.log(coordinatesToTravel);

                            // Set the map view to the selected country
                            map.setView(coordinatesToTravel, 5);
                            getCountryByLocation(coordinatesToTravel[0], coordinatesToTravel[1])

                        })
                        .catch(function (error) {
                            console.log(error);
                        });
                });
            })
            .catch(function (error) {
                console.log(error);
            });
    });

}

//Renders map into the screen
$(document).ready(function () {
    $('#loading-overlay').fadeOut('slow');
});

axios.get('../php/mapRequest.php')
    .then(function (response) {
        $('#map').html(response.data);
    })
    .catch(function (error) {
        console.log(error);
    });