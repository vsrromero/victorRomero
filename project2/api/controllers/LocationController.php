<?php

namespace api\controllers;

use api\models\Location;
use api\utilities\HttpStatusHelper as HttpStatus;

class LocationController extends Controller
{
    public function __construct()
    {
        parent::__construct(new Location());
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





    public function show($id)
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

    public function store($data)
    {
        try {
            $jsonData = file_get_contents('php://input');
            $dataArray = json_decode($jsonData, true);

            if ($dataArray) {

                if (
                    isset($dataArray['name']) && is_string($dataArray['name']) && strlen($dataArray['name']) <= 50
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

    public function update($id, $data)
    {
        try {

            $jsonData = file_get_contents('php://input');
            $data = json_decode($jsonData, true);
            if (
                isset($data['name']) && is_string($data['name']) && strlen($data['name']) <= 50
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

    public function destroy($id)
    {
        try {
            // Check if any departments are using this location
            $departmentCount = $this->model->countDepartmentsInLocation($id);

            if ($departmentCount > 0) {
                http_response_code(400);
                header('Content-Type: application/json');
                return ['error' => 'Cannot delete location with associated departments'];
            }

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
