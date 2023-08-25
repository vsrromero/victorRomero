<?php

require '../vendor/autoload.php'; // Carrega o autoload do Composer
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/config');
$dotenv->load();

// Autoloader para carregar classes automaticamente
spl_autoload_register(function ($className) {
    $className = str_replace('api\\', '', $className);
    require_once __DIR__ . '/' . $className . '.php';
});

// Configuração de cabeçalhos para permitir CORS
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Instancie o roteador
$router = new api\Router(); // O namespace raiz é "api"

// Inclua as rotas passando a instância do roteador
require 'routes/routes.php';

// Defina o método HTTP e o caminho da requisição
$httpMethod = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

// Roteamento da requisição
$response = $router->route($httpMethod, $uri);
// Envie a resposta
echo json_encode($response);
?>