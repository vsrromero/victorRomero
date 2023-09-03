<?php

namespace api\controllers;

use api\models\Location;
use api\utilities\HttpStatusHelper as HttpStatus;

/**
 * Controller class for managing locations.
 */
class LocationController extends Controller
{
    public function __construct()
    {
        parent::__construct(new Location());
    }

    /**
     * Retrieve and return all records from the associated model.
     *
     * @return array The JSON response containing the list of locations.
     */
    public function index(): array
    {
        try {
            $results = $this->model->getAll(true);

            // Escape HTML characters - Cross-Site Scripting (XSS) prevention
            foreach ($results as &$result) {
                foreach ($result as &$value) {
                    $value = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
                }
            }

            $statusCode = http_response_code();
            $statusName = HttpStatus::getStatusCodeName($statusCode);

            $response = [
                "status" => [
                    "code" => $statusCode,
                    "name" => $statusName,
                    "description" => $statusCode === 200 ? "success" : "error",
                    "returnedIn" => round(microtime(true) - $_SERVER['REQUEST_TIME_FLOAT'], 2) * 1000 . " ms"
                ],
                "data" => [
                    "locations" => $results
                ]
            ];

            header('Content-Type: application/json');
            return $response;
        } catch (\Exception $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Internal Server Error']);
        }
    }

    /**
     * Retrieve and return a specific record from the associated model.
     *
     * @param int $id The ID of the record to retrieve.
     * @return array The JSON response containing the retrieved location.
     */
    public function show(int $id): array
    {
        try {
            $results = $this->model->getById($id);

            if ($results) {
                http_response_code(200);
                header('Content-Type: application/json');
                return $results;
            } else {
                http_response_code(404);
                header('Content-Type: application/json');
                return ['error' => 'Location not found'];
            }
        } catch (\Exception $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            return ['error' => 'Internal Server Error'];
        }
    }

    /**
     * Store a new record in the associated model.
     * 
     * @param array $data The data to be stored.
     */
    public function store(array $data): array
    {
        try {
            $jsonData = file_get_contents('php://input');
            $dataArray = json_decode($jsonData, true);

            if ($dataArray) {

                if (
                    isset($dataArray['name']) && preg_match('/^[a-zA-ZÀ-ÿ0-9\s-]+$/', $dataArray['name']) && strlen($dataArray['name']) <= 50 &&
                    // Check for SQL keywords
                    !preg_match('/\b(SELECT|UPDATE|DELETE|INSERT|DROP|ALTER|TRUNCATE)\b/i', $jsonData)
                ) {
                    $this->model->setAttributes($dataArray);
                    $this->model->store();
                    http_response_code(201);
                    header('Content-Type: application/json');
                    return ['success' => 'Location added successfully'];
                } else {
                    http_response_code(400);
                    header('Content-Type: application/json');
                    return ['error' => 'Invalid JSON data'];
                }
            } else {
                http_response_code(400);
                header('Content-Type: application/json');
                return ['error' => 'Invalid JSON data'];
            }
        } catch (\Exception $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            return ['error' => 'Internal Server Error'];
        }
    }

    /**
     * Update a specific record in the associated model.
     *
     * @param int $id The ID of the record to update.
     * @param array $data The data to update the record with.
     * @return array The JSON response indicating the success or failure of the operation.
     */
    public function update(int $id, array $data): array
    {
        try {

            $jsonData = file_get_contents('php://input');
            $data = json_decode($jsonData, true);
            if (
                isset($data['name']) && preg_match('/^[a-zA-ZÀ-ÿ0-9\s-]+$/', $data['name']) && strlen($data['name']) <= 50 &&
                // Check for SQL keywords
                !preg_match('/\b(SELECT|UPDATE|DELETE|INSERT|DROP|ALTER|TRUNCATE)\b/i', $jsonData)
            ) {
                $this->model->setAttributes($data);
                $response = $this->model->update($id);

                if ($response === 0) {
                    http_response_code(404);
                    header('Content-Type: application/json');
                    return ['error' => 'Location not found'];
                } elseif ($response === -1) {
                    http_response_code(500);
                    header('Content-Type: application/json');
                    return ['error' => 'Internal Server Error'];
                }

                http_response_code(200);
                header('Content-Type: application/json');
                return ['success' => 'Location updated successfully'];
            } else {
                http_response_code(400);
                header('Content-Type: application/json');
                return ['error' => 'Invalid JSON data'];
            }
        } catch (\Exception $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            return ['error' => 'Internal Server Error'];
        }
    }

    /**
     * Delete a specific record from the associated model.
     *
     * @param int $id The ID of the record to delete.
     * @return array The JSON response indicating the success or failure of the operation.
     */
    public function destroy(int $id): array
    {
        try {
            $response = $this->model->delete($id);
            if ($response === 1) {
                http_response_code(204);
                header('Content-Type: application/json');
                return ['success' => 'Location deleted successfully'];
            } elseif ($response === 0) {
                http_response_code(404);
                header('Content-Type: application/json');
                return ['error' => 'Location not found'];
            } else {
                http_response_code(400);
                header('Content-Type: application/json');
                return ['error' => 'Cannot delete location with associated personnel'];
            }
        } catch (\Exception $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            return ['error' => 'Internal Server Error'];
        }
    }
}
