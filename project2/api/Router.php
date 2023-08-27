<?php

namespace api;

class Router
{
    private $routes = [];

    private function getIdFromPath($routePath, $uriPath) {
        $routeSegments = explode('/', trim($routePath, '/'));
        $uriSegments = explode('/', trim($uriPath, '/'));
        
        for ($i = 0; $i < count($routeSegments); $i++) {
            if ($routeSegments[$i] !== $uriSegments[$i] && strpos($routeSegments[$i], '{') !== false) {
                $idPlaceholder = trim($routeSegments[$i], '{}');
                return $uriSegments[$i + 1]; // Get the next segment after the placeholder
            }
        }
        return null; // Return null if no ID is found
    }
        
    public function addRoute($method, $path, $callback)
    {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'callback' => $callback
        ];
    }

    public function route($httpMethod, $uri)
    {
        $jsonData = file_get_contents('php://input');
        $dataArray = json_decode($jsonData, true);
        
        // Parse the query string parameters from the URI
        $parsedUri = parse_url($uri);
        $queryParams = [];
        if (isset($parsedUri['query'])) {
            parse_str($parsedUri['query'], $queryParams);
        }
        
        foreach ($this->routes as $route) {
            $path = '/api' . $route['path'];
    
            $parsedUri = parse_url($uri);
            $uriPath = $parsedUri['path'];
    
            // Check if the route matches the current request
            if ($route['method'] === $httpMethod && $this->comparePaths($path, $uriPath, $parsedUri)) {
                $callback = $route['callback'];
    
                // Check if the callback is an array in the format [Class, Method]
                if (is_array($callback) && count($callback) == 2) {
                    $controllerClass = $callback[0];
                    $controllerMethod = $callback[1];
    
                    // Create an instance of the controller
                    $controllerInstance = new $controllerClass();
    
                    // Check if the route has an ID placeholder
                    if (strpos($route['path'], '{id}') !== false) {
                        // Get the ID from the URI using the getIdFromPath method
                        $id = $this->getIdFromPath($route['path'], $uriPath);
                        // Call the controller method, passing the ID and query parameters
                        return $controllerInstance->$controllerMethod($id, $queryParams, $dataArray);
                    } else {
                        // Call the controller method, passing the query parameters
                        return $controllerInstance->$controllerMethod($queryParams, $dataArray);
                    }
                }
            }
        }
    
        return ['error' => 'Route not found'];
    }
    

    private function comparePaths($routePath, $uriPath, $parsedUri)
    {
        $routeSegments = explode('/', trim($routePath, '/'));
        $uriSegments = explode('/', trim($uriPath, '/'));

        if (count($routeSegments) !== count($uriSegments)) {
            return false;
        }

        for ($i = 0; $i < count($routeSegments); $i++) {
            if ($routeSegments[$i] !== $uriSegments[$i] && strpos($routeSegments[$i], '{') !== false) {
            } elseif ($routeSegments[$i] !== $uriSegments[$i]) {
                return false;
            }
        }

        return true;
    }
}
?>