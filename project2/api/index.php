<?php

require '../vendor/autoload.php'; // Load Composer's autoloader
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/config');
$dotenv->load();

// Autoloader to load classes automatically
spl_autoload_register(function ($className) {
    $className = str_replace('api\\', '', $className);
    require_once __DIR__ . '/' . $className . '.php';
});

// Configurations to allow CORS
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Router instance
$router = new api\Router(); // Root path is /api

// Including routes passing the router instance
require 'routes/routes.php';

// Set the HTTP method and the request path
$httpMethod = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

// Routing the request
$response = $router->route($httpMethod, $uri);

// Sending the response
echo json_encode($response);
?>