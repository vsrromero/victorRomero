<?php
ini_set('display_errors', 1);
require '../vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/config');
$dotenv->load();

spl_autoload_register(function ($className) {
    $className = str_replace('api\\', '', $className);
    require_once __DIR__ . '/' . $className . '.php';
});

// Configurations to allow CORS
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$router = new api\Router();

require 'routes/routes.php';

// Set the HTTP method and the request path
$httpMethod = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

// Routing the request
$response = $router->route($httpMethod, $uri);

echo json_encode($response);
?>