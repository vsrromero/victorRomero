// //* Helper functions

// async function getCoordinatesFromCountry(countryName) {
//     try {
//         const response = await fetch('assets/php/openCage.php?countryName=' + countryName);
//         const data = await response.json();
//         const country = data.results[0].geometry;
//         return [country.lat, country.lng];
//     } catch (error) {
//         console.log(error);
//         return null;
//     }
// }



// //! Check if a point is inside a polygon
// function pointInPolygon(latitude, longitude, coordinates) {
//     var isInPolygon = false;

//     for (var i = 0; i < coordinates.length; i++) {
//         var polygon = coordinates[i];

//         for (var j = 0; j < polygon.length; j++) {
//             var ring = polygon[j];

//             var intersect = false;
//             for (var k = 0, l = ring.length - 1; k < ring.length; l = k++) {
//                 var xi = ring[k][0];
//                 var yi = ring[k][1];
//                 var xj = ring[l][0];
//                 var yj = ring[l][1];

//                 if (((yi > latitude) !== (yj > latitude)) && (longitude < (xj - xi) * (latitude - yi) / (yj - yi) + xi)) {
//                     intersect = !intersect;
//                 }
//             }

//             if (intersect) {
//                 isInPolygon = !isInPolygon;
//             }
//         }
//     }

//     return isInPolygon;
// }

// //! Get the country name by latitude and longitude

// function getCountryFromCoordinates(latitude, longitude, geoJSON) {
//     for (var i = 0; i < geoJSON.features.length; i++) {
//         var feature = geoJSON.features[i];
//         if (pointInPolygon(latitude, longitude, feature.geometry.coordinates)) {
//             updateCountryList();
//             return feature.properties.name;
//         }
//     }
//     console.log('No country found');
//     return ""; // Retorna uma string vazia se nenhum país for encontrado
// }

// function getCountryCodeFromCoordinates(latitude, longitude, geoJSON) {
//     for (var i = 0; i < geoJSON.features.length; i++) {
//         var feature = geoJSON.features[i];
//         if (pointInPolygon(latitude, longitude, feature.geometry.coordinates)) {
//             return feature.properties.iso_a2;
//         }
//     }
//     console.log('No country found');
//     return ""; // Retorna uma string vazia se nenhum país for encontrado
// }

// function updateCountryList() {
//     var selectElement = $('#countriesList select');

//     $.getJSON('assets/php/getCountryList.php', function (data) {
//         selectElement.empty(); // Limpa a lista antes de atualizá-la

//         $.each(data, function (index, country) {
//             var option = $('<option>').val(country.iso_a2).text(country.name);

//             if (country.name === selectedCountryName) {
//                 option.attr('selected', 'selected');
//             }

//             selectElement.append(option);
//         });
//     });
// }