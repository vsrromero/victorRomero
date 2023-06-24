$(document).ready(function() {
    // Event listener streetNameLookup button
    $('#submit-btn-streetName').click(function() {
        var userInput = $('#user-input-streetName').val();
    
        if (userInput !== '') {
            var url = 'libs/php/getStreetName.php?q=' + userInput;
            var resultPromise = performAjaxRequest(url);

            console.log("url: " + url);

                
            
            resultPromise
                .then(function(result) {
                    var output = '';
                    for (var i = 0; i < result.data.length; i++) {
                        var countryCode = result.data[i].countryCode;
                        var street = result.data[i].street;
                        var postalcode = result.data[i].postalcode;
                        var locality = result.data[i].locality;
    
                        output +=   "Country: " + countryCode + "<br>" +
                                    "Street: " + street + "<br>" +
                                    "Postal code: " + postalcode + "<br>" +
                                    "Locality: " + locality + "<br><br>";
                    }
    
                    $('#result').html(output);
                })
                .catch(function(error) {
                    console.error(error);
                });

            resetFields();
            event.preventDefault();

        }
    });

    // Event listener postalCodeSearch button
    $('#submit-btn-postalCode').click(function() {
        var userInput = $('#user-input-postalCode').val();

        if (userInput !== '') {
            var url = 'libs/php/getPostalCode.php?placename=' + userInput;
            var resultPromise = performAjaxRequest(url);
            resultPromise
                .then(function(result) {
                    var output = '';
                    for (var i = 0; i < result.data.length; i++) {
                        var countryCode = result.data[i].countryCode;
                        var placeName = result.data[i].placeName;
                        var postalcode = result.data[i].postalcode;
                        var lat = result.data[i].lat;
                        var lng = result.data[i].lng;

                        output +=   "Country: " + countryCode + "<br>" +
                                    "Place Name: " + placeName + "<br>" +
                                    "Postal code: " + postalcode + "<br>" +
                                    "Latitude: " + lat + "<br>" +
                                    "Longitude: " + lng + "<br><br>";
                    }

                    $('#result').html(output);
                })
                .catch(function(error) {
                    console.error(error);
                });
                
            resetFields();
            event.preventDefault();

        }
    });

    // Event listener findNearby button
    $('#submit-btn-findNearby').click(function() {
        var userInput = $('#user-input-findNearby').val();
        console.log("user input: " + userInput);

        if (userInput !== '') {
            var coords = userInput.split(',');
            if (coords.length === 2) {
                var lat = coords[0].trim();
                var lng = coords[1].trim();

                var url = 'libs/php/findNearby.php?lat=' + lat + '&lng=' + lng;
                console.log("url: " + url);
                var resultPromise = performAjaxRequest(url);

                resultPromise.then(function(result) {
                    console.log("result: " , result);
                });

                resultPromise
                    .then(function(result) {
                        console.log("result promise: check");
                        var output = '';
                        for (var i = 0; i < result.data.length; i++) {
                            var countryCode = result.data[i].countryCode;
                            var counryName = result.data[i].counryName;
                            var name = result.data[i].name;
                            var fclName = result.data[i].fclName;
                            var fcodeName = result.data[i].fcodeName;

                            output +=   "Country: " + countryCode + "<br>" +
                                        "Country Name: " + counryName + "<br>" +
                                        "Name: " + name + "<br>" +
                                        "Fcl Name: " + fclName + "<br>" +
                                        "Fcode Name: " + fcodeName + "<br><br>";
                        }
                        console.log(output);
                        $('#result').html(output);
                    })
                    .catch(function(error) {
                        console.log("deu ruim: " + error);
                        console.error(error);
                    });

                resetFields();
                event.preventDefault();
            }
        }
    });

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

    function resetFields() {
        $('#user-input-streetName').val('');
        $('#user-input-postalCode').val('');
        $('#user-input-findNearby').val('');
    }
    
});