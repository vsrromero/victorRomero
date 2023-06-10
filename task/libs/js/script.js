$(document).ready(function() {
    // Event listener streetNameLookup button
    $('#submit-btn-streetName').click(function() {
        var userInput = $('#user-input-streetName').val();
    
        if (userInput !== '') {
            var url = 'libs/php/getStreetName.php?q=' + userInput;
            var resultPromise = performAjaxRequest(url);
            
            resultPromise
                .then(function(result) {
                    var output = '';
                    for (var i = 0; i < result.data.length; i++) {
                        var countryCode = result.data[i].countryCode;
                        var street = result.data[i].street;
                        var postalcode = result.data[i].postalcode;
                        var locality = result.data[i].locality;
    
                        output += "Country: " + countryCode + "<br>" +
                                  "Street: " + street + "<br>" +
                                  "Postal code: " + postalcode + "<br>" +
                                  "Locality: " + locality + "<br><br>";
                    }
    
                    console.log(output);
                    $('#result').html(output);
                })
                .catch(function(error) {
                    console.error(error);
                });
            event.preventDefault();

        }
    });

    // // Event listener postalCodeSearch button
    // $('#submit-btn-postalCode').click(function() {
    //     var userInput = $('#user-input-postalCode').val();

    //     if (userInput !== '') {
    //         var url = 'libs/php/getPostalCodeSearch.php?postalcode=' + userInput;
    //         var result = performAjaxRequest(url);

    //         displayResult(result);
    //     }
    // });

    // // Event listener findNearby button
    // $('#submit-btn-findNearby').click(function() {
    //     var userInput = $('#user-input-findNearby').val();

    //     if (userInput !== '') {
    //         var coords = userInput.split(',');

    //         if (coords.length === 2) {
    //             var lat = coords[0].trim();
    //             var lng = coords[1].trim();

    //             var url = 'libs/php/getFindNearby.php?lat=' + lat + '&lng=' + lng;

    //             performAjaxRequest(url);
    //         }
    //     }
    // });

    // Função para executar a requisição AJAX
    function performAjaxRequest(url) {
        return new Promise(function(resolve, reject) {
            $.ajax({
                url: url,
                type: 'POST',
                dataType: 'json',
                success: function(result) {
                    resolve(result);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    reject('Error: ' + errorThrown);
                }
            });
        });
    }

    // Função para exibir o resultado na página
    // function displayResult(resultPromise) {
    //     resultPromise
    //         .then(function(result) {
    //             console.log(result);
    //             $('#result').text(JSON.stringify(result));
    //         })
    //         .catch(function(error) {
    //             console.error(error);
    //         });
    // }
    
});