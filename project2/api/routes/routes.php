<?php

namespace api\routes;

use api\controllers\PersonnelController;
use api\Router;

$router = new Router();

$router->addRoute('GET', '/personnel', [PersonnelController::class, 'index']);
$router->addRoute('POST', '/personnel', [PersonnelController::class, 'store']);
$router->addRoute('GET', '/personnel/{id}', [PersonnelController::class, 'show']);
$router->addRoute('PUT', '/personnel/{id}', [PersonnelController::class, 'update']);
$router->addRoute('DELETE', '/personnel/{id}', [PersonnelController::class, 'destroy']);
