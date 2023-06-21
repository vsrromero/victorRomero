<?php
header('Content-Type: application/json');

$jsonFilePath = "../json/countryBorders.geo.json";

// read from JSON
$jsonData = file_get_contents($jsonFilePath);

// converter jason into array
$data = json_decode($jsonData, true);

// get only (name and iso_a2)
$filteredData = array_map(function ($feature) {
    return array(
        'name' => $feature['properties']['name'],
        'iso_a2' => $feature['properties']['iso_a2']
    );
}, $data['features']);

usort($filteredData, function ($a, $b) {
    return $a['name'] <=> $b['name'];
});

// Convert into JSON
$jsonResponse = json_encode($filteredData);

// Output the results
echo $jsonResponse;
?>
