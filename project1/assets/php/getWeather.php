<?php
$weatherapi = '2afcb1eb4a8c47e9973133447230707';

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$url = 'http://api.weatherapi.com/v1/forecast.json?key=' . $weatherapi . '&q=' . $_REQUEST['lat'] . ',' . $_REQUEST['lng'] . '&days=3&aqi=no&hour=00';

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);

curl_close($ch);

$decode = json_decode($result, true);

$output = array(
    'current' => array(
        'last_updated_epoch' => $decode['current']['last_updated'],
        'condition' => array(
            'text' => $decode['current']['condition']['text'],
            'icon' => $decode['current']['condition']['icon']
        )
    ),
    'forecast' => array(
        'forecastday' => array(
            array(
                'day' => array(
                    'maxtemp_c' => $decode['forecast']['forecastday'][0]['day']['maxtemp_c'],
                    'mintemp_c' => $decode['forecast']['forecastday'][0]['day']['mintemp_c']
                ),
                'date' => $decode['forecast']['forecastday'][1]['date']
            ),
            array(
                'day' => array(
                    'maxtemp_c' => $decode['forecast']['forecastday'][1]['day']['maxtemp_c'],
                    'mintemp_c' => $decode['forecast']['forecastday'][1]['day']['mintemp_c']
                ),
                'date' => $decode['forecast']['forecastday'][2]['date']
            ),
            array(
                'day' => array(
                    'maxtemp_c' => $decode['forecast']['forecastday'][2]['day']['maxtemp_c'],
                    'mintemp_c' => $decode['forecast']['forecastday'][2]['day']['mintemp_c']
                )
            )
        )
    )
);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);
