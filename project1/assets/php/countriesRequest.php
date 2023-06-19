<?php

require_once __DIR__ . '/../../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

$geonamesUser = $_ENV['GEONAMES_API_USER'];

function getAllCountries($geonamesUser) {
    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    if(isset($_REQUEST['countryCode'])) {
        $url = 'http://api.geonames.org/countryInfoJSON?username=' . $geonamesUser . '&country=' . $_REQUEST['countryCode'];
    } else {
        $url='http://api.geonames.org/countryInfoJSON?username=' . $geonamesUser;
    }


    $ch = curl_init();
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_URL,$url);

    $result=curl_exec($ch);

    curl_close($ch);

    $decode = json_decode($result,true);

    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    $output['data'] = $decode['geonames'];
    
    usort($output['data'], function ($a, $b) {
        return strcmp($a['countryName'], $b['countryName']);
    });
    
    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output); 
}

getAllCountries($geonamesUser);