<?php
header('Content-Type: application/json');

$jsonFilePath = "../data/personel.json";

// read from JSON
$jsonData = file_get_contents($jsonFilePath);

// converter jason into array
$data = json_decode($jsonData, true);

// Convert into JSON
$jsonResponse = json_encode($data);

// Output the results
echo $jsonResponse;
?>