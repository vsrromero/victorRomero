<?php
// Inicialize curl
$ch = curl_init();

// api map endpoint
$url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

// curl options
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// HTTP request
$response = curl_exec($ch);

// close curl session
curl_close($ch);

// Return resposne to js
echo $response;
?>

