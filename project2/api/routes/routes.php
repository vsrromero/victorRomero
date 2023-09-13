<?php

namespace api\routes;

use api\controllers\PersonnelController;
use api\controllers\SearchPersonnelController;
use api\controllers\SearchDepartmentController;
use api\controllers\SearchLocationController;
use api\controllers\DepartmentController;
use api\controllers\LocationController;
use api\Router;

$router = new Router();

// Personnel routes
$router->addRoute('GET', '/personnel', [PersonnelController::class, 'index']);
$router->addRoute('POST', '/personnel', [PersonnelController::class, 'store']);
$router->addRoute('POST', '/personnel/{id}', [PersonnelController::class, 'show']);
$router->addRoute('PUT', '/personnel/{id}', [PersonnelController::class, 'update']);
$router->addRoute('DELETE', '/personnel/{id}', [PersonnelController::class, 'destroy']);

// Department routes
$router->addRoute('GET', '/departments', [DepartmentController::class, 'index']);
$router->addRoute('POST', '/departments', [DepartmentController::class, 'store']);
$router->addRoute('POST', '/departments/{id}', [DepartmentController::class, 'show']);
$router->addRoute('PUT', '/departments/{id}', [DepartmentController::class, 'update']);
$router->addRoute('DELETE', '/departments/{id}', [DepartmentController::class, 'destroy']);
$router->addRoute('POST', '/departments/check-dependencies/{id}', [DepartmentController::class, 'checkDependencies']);

// Location routes
$router->addRoute('GET', '/locations', [LocationController::class, 'index']);
$router->addRoute('POST', '/locations', [LocationController::class, 'store']);
$router->addRoute('POST', '/locations/{id}', [LocationController::class, 'show']);
$router->addRoute('PUT', '/locations/{id}', [LocationController::class, 'update']);
$router->addRoute('DELETE', '/locations/{id}', [LocationController::class, 'destroy']);
$router->addRoute('POST', '/locations/check-dependencies/{id}', [LocationController::class, 'checkDependencies']);

// Search route
$router->addRoute('GET', '/search-personnel', [SearchPersonnelController::class, 'searchPersonnel']);
$router->addRoute('GET', '/search-department', [SearchDepartmentController::class, 'searchDepartment']);
$router->addRoute('GET', '/search-location', [SearchLocationController::class, 'searchLocation']);
