<?php
header('Content-Type: application/json');

$jsonFilePath = "../json/countryBorders.geo.json";

// read from JSON
$jsonData = file_get_contents($jsonFilePath);

// converter jason into array
$data = json_decode($jsonData, true);

// Convert into JSON
$jsonResponse = json_encode($filteredData);

// Output the results
echo $jsonResponse;
?>