<?php

namespace api\controllers;

use api\models\Personnel;
use api\utilities\HttpStatusHelper as HttpStatus;

/**
 * Controller class for managing personnel.
 */
class PersonnelController extends Controller
{
    public function __construct()
    {
        parent::__construct(new Personnel());
    }

    /**
     * Retrieve and return all records from the associated model.
     *
     * @return array The JSON response containing the list of personnel.
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
                    "returnedIn" => round(microtime(true) - $_SERVER['REQUEST_TIME_FLOAT'], 2) * 1000
                ],
                "data" => [
                    "personnel" => $results
                ]
            ];

            http_response_code(200);
            header('Content-Type: application/json');
            return $response;
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
     * @return mixed The stored record.
     */
    public function store(array $data): array
    {
        try {
            $jsonData = file_get_contents('php://input');
            $dataArray = json_decode($jsonData, true);
    
            if ($dataArray) {

                if (
                    isset($dataArray['firstName']) && is_string($dataArray['firstName']) && strlen($dataArray['firstName']) <= 50 &&
                    isset($dataArray['lastName']) && is_string($dataArray['lastName']) && strlen($dataArray['lastName']) <= 50 &&
                    isset($dataArray['jobTitle']) && is_string($dataArray['jobTitle']) && strlen($dataArray['jobTitle']) <= 50 &&
                    isset($dataArray['email']) && filter_var($dataArray['email'], FILTER_VALIDATE_EMAIL) &&
                    isset($dataArray['departmentID']) && filter_var($dataArray['departmentID'], FILTER_VALIDATE_INT)
                ) {
                    $this->model->setAttributes($dataArray);
                    $this->model->store();
                    http_response_code(201);
                    header('Content-Type: application/json');
                    return ['success' => 'Personnel added successfully'];
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
     * Retrieve a specific record from the associated model.
     *
     * @param int $id The ID of the record to retrieve.
     * @return mixed The retrieved record.
     */
    public function show(int $id): array
    {
        try {
            $results = $this->model->getById($id);
            
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
                    "personnel" => $results
                    ]
                ];
                
                if ($results) {
                // Escape HTML characters - Cross-Site Scripting (XSS) prevention
                foreach ($results as &$value) {
                    $value = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
                }
                
                header('Content-Type: application/json');
                return $response;
            } else {
                http_response_code(404); 
                header('Content-Type: application/json');
                return ['error' => 'Personnel id ' . $id . ' not found'];
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
     * @return mixed The updated record.
     */
    public function update(int $id, array $data): array
    {
        try {
            
            $jsonData = file_get_contents('php://input');
            $data = json_decode($jsonData, true);
    
            // Regular expressions for allowed patterns
            $namePattern = '/^[a-zA-ZÀ-ÿ\-ç\s]+$/'; // Only letters with accents, hyphen, and ç
            $emailPattern = '/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/'; // Valid email pattern
    
            if (
                isset($data['firstName']) && preg_match($namePattern, $data['firstName']) &&
                isset($data['lastName']) && preg_match($namePattern, $data['lastName']) &&
                isset($data['jobTitle']) && preg_match($namePattern, $data['jobTitle']) &&
                isset($data['email']) && preg_match($emailPattern, $data['email']) &&
                isset($data['departmentID']) && filter_var($data['departmentID'], FILTER_VALIDATE_INT)
            ) {
                $this->model->setAttributes($data);
                $response = $this->model->update($id);
    
                if ($response === 0) {
                    http_response_code(404); 
                    header('Content-Type: application/json');
                    return ['error' => 'Personnel not found'];
                } elseif ($response === -1) {
                    http_response_code(500); 
                    header('Content-Type: application/json');
                    return ['error' => 'Internal Server Error'];
                }
    
                http_response_code(200); 
                header('Content-Type: application/json');
                return ['success' => 'Personnel updated successfully'];
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
     * @return mixed The deleted record.
     */
    public function destroy(int $id): array
    {
        try {
            $response = $this->model->delete($id);
            if ($response === 1) {
                http_response_code(204); 
                header('Content-Type: application/json');
                return ['success' => 'Personnel deleted successfully'];
            } elseif ($response === 0) {
                http_response_code(404); 
                header('Content-Type: application/json');
                return ['error' => 'Personnel not found'];
            } else {
                http_response_code(500); 
                header('Content-Type: application/json');
                return ['error' => 'Internal Server Error'];
            }
        } catch (\Exception $e) {
            http_response_code(500); 
            header('Content-Type: application/json');
            return ['error' => 'Internal Server Error'];
        }
    }
}
