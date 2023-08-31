<?php

namespace api;

/**
 * Router class for mapping HTTP routes to controller methods.
 */
class Router
{
    private $routes = [];

    /**
     * Get the ID from the URI path.
     *
     * @param string $routePath The route path with placeholders.
     * @param string $uriPath The URI path to extract ID from.
     * @return string|null The extracted ID or null if not found.
     */
    private function getIdFromPath(string $routePath, string $uriPath): ?string
    {
        $routeSegments = explode('/', trim($routePath, '/'));
        $uriSegments = explode('/', trim($uriPath, '/'));

        for ($i = 0; $i < count($routeSegments); $i++) {
            if ($routeSegments[$i] !== $uriSegments[$i] && strpos($routeSegments[$i], '{') !== false) {
                $idPlaceholder = trim($routeSegments[$i], '{}');
                return $uriSegments[$i + 1]; // Get the next segment after the placeholder
            }
        }
        return null;
    }

    /**
     * Add a new route to the router.
     *
     * @param string $method The HTTP method of the route.
     * @param string $path The path of the route.
     * @param array $callback The callback array [Class, Method].
     * @return void
     */
    public function addRoute(string $method, string $path, array $callback): void
    {
        $this->routes[] = [
            'method' => $method,
            'path' => $path,
            'callback' => $callback
        ];
    }

    /**
     * Route the incoming HTTP request to the appropriate controller method.
     *
     * @param string $httpMethod The HTTP method of the request.
     * @param string $uri The URI of the request.
     * @return array The response data or an error message.
     */
    public function route(string $httpMethod, string $uri): array
    {
        $jsonData = file_get_contents('php://input'); //get id from uri
        $dataArray = json_decode($jsonData, true);

        // Parse the query string parameters from the URI
        $parsedUri = parse_url($uri);
        $queryParams = [];
        if (isset($parsedUri['query'])) {
            parse_str($parsedUri['query'], $queryParams);
        }

        foreach ($this->routes as $route) {
            //$path = '/portfolio/cdirectory/api' . $route['path']; // production
            $path = '/api' . $route['path']; // development

            $parsedUri = parse_url($uri);
            $uriPath = $parsedUri['path'];

            // Check if the route matches the current request
            if ($route['method'] === $httpMethod && $this->comparePaths($path, $uriPath, $parsedUri)) {
                $callback = $route['callback'];

                // Check if the callback is an array in the format [Class, Method]
                if (is_array($callback) && count($callback) == 2) {
                    $controllerClass = $callback[0];
                    $controllerMethod = $callback[1];

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

    /**
     * Compare route path and URI path to check for a match.
     *
     * @param string $routePath The route path.
     * @param string $uriPath The URI path.
     * @return bool Whether the paths match.
     */
    private function comparePaths(string $routePath, string $uriPath)
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
