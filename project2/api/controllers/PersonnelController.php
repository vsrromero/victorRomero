<?php

namespace api\controllers;

use api\models\Personnel;
use api\utilities\HttpStatusHelper as HttpStatus;

class PersonnelController extends Controller
{
    public function __construct()
    {
        parent::__construct(new Personnel());
    }

    public function index()
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
            http_response_code(500); // Internal Server Error
            header('Content-Type: application/json');
            return ['error' => 'Internal Server Error'];
        }
    }

    public function store($data)
    {
        try {
            $jsonData = file_get_contents('php://input');
            $dataArray = json_decode($jsonData, true);
    
            if ($dataArray) {
                // Validating data
                if (
                    isset($dataArray['firstName']) && is_string($dataArray['firstName']) && strlen($dataArray['firstName']) <= 50 &&
                    isset($dataArray['lastName']) && is_string($dataArray['lastName']) && strlen($dataArray['lastName']) <= 50 &&
                    isset($dataArray['jobTitle']) && is_string($dataArray['jobTitle']) && strlen($dataArray['jobTitle']) <= 50 &&
                    isset($dataArray['email']) && filter_var($dataArray['email'], FILTER_VALIDATE_EMAIL) &&
                    isset($dataArray['departmentID']) && filter_var($dataArray['departmentID'], FILTER_VALIDATE_INT)
                ) {
                    $this->model->setAttributes($dataArray);
                    $this->model->store();
                    http_response_code(201); // Created
                    header('Content-Type: application/json');
                    return ['success' => 'Personnel added successfully'];
                } else {
                    http_response_code(400); // Bad Request
                    header('Content-Type: application/json');
                    return ['error' => 'Invalid JSON data'];
                }
            } else {
                http_response_code(400); // Bad Request
                header('Content-Type: application/json');
                return ['error' => 'Invalid JSON data'];
            }
        } catch (\Exception $e) {
            http_response_code(500); // Internal Server Error
            header('Content-Type: application/json');
            return ['error' => 'Internal Server Error'];
        }
    }

    public function show($id)
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
                http_response_code(404); // Not Found
                header('Content-Type: application/json');
                return ['error' => 'Personnel not found'];
            }
        } catch (\Exception $e) {
            http_response_code(500); // Internal Server Error
            header('Content-Type: application/json');
            return ['error' => 'Internal Server Error'];
        }
    }

    public function update($id, $data)
    {
        try {
            // Validating data before setting attributes
            $jsonData = file_get_contents('php://input');
            $data = json_decode($jsonData, true);
            if (
                isset($data['firstName']) && is_string($data['firstName']) && strlen($data['firstName']) <= 50 &&
                isset($data['lastName']) && is_string($data['lastName']) && strlen($data['lastName']) <= 50 &&
                isset($data['jobTitle']) && is_string($data['jobTitle']) && strlen($data['jobTitle']) <= 50 &&
                isset($data['email']) && filter_var($data['email'], FILTER_VALIDATE_EMAIL) &&
                isset($data['departmentID']) && filter_var($data['departmentID'], FILTER_VALIDATE_INT)
            ) {
                $this->model->setAttributes($data);
                $response = $this->model->update($id);
    
                if ($response === 0) {
                    http_response_code(404); // Not Found
                    header('Content-Type: application/json');
                    return ['error' => 'Personnel not found'];
                } elseif ($response === -1) {
                    http_response_code(500); // Internal Server Error
                    header('Content-Type: application/json');
                    return ['error' => 'Internal Server Error'];
                }
    
                http_response_code(200); // OK
                header('Content-Type: application/json');
                return ['success' => 'Personnel updated successfully'];
            } else {
                http_response_code(400); // Bad Request
                header('Content-Type: application/json');
                return ['error' => 'Invalid JSON data'];
            }
        } catch (\Exception $e) {
            http_response_code(500); // Internal Server Error
            header('Content-Type: application/json');
            return ['error' => 'Internal Server Error'];
        }
    }
    
    public function destroy($id)
    {
        try {
            $response = $this->model->delete($id);
            if ($response === 1) {
                http_response_code(204); // No Content
                header('Content-Type: application/json');
                return ['success' => 'Personnel deleted successfully'];
            } elseif ($response === 0) {
                http_response_code(404); // Not Found
                header('Content-Type: application/json');
                return ['error' => 'Personnel not found'];
            } else {
                http_response_code(500); // Internal Server Error
                header('Content-Type: application/json');
                return ['error' => 'Internal Server Error'];
            }
        } catch (\Exception $e) {
            http_response_code(500); // Internal Server Error
            header('Content-Type: application/json');
            return ['error' => 'Internal Server Error'];
        }
    }
}