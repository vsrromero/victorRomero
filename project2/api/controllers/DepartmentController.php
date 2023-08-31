<?php

namespace api\controllers;

use api\models\Department;
use api\utilities\HttpStatusHelper as HttpStatus;

/**
 * Controller class for managing departments.
 */
class DepartmentController extends Controller
{
    public function __construct()
    {
        parent::__construct(new Department());
    }

    /**
     * Retrieve and return all records from the associated model.
     *
     * @return array The JSON response containing the list of departments.
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
                    "departments" => $results
                ]
            ];

            header('Content-Type: application/json');
            return $response;
        } catch (\Exception $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            return ['error' => 'Internal Server Error'];
        }
    }

    /**
     * Retrieve and return a specific record from the associated model.
     *
     * @param int $id The ID of the department to retrieve.
     * @return array The JSON response containing the department data.
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
                    "department" => $results
                ]
            ];

            if ($results) {
                // Escape HTML characters - Cross-Site Scripting (XSS) prevention
                foreach ($results as &$value) {
                    $value = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
                }

                header('Content-Type: application/json');
                return $results;
            } else {
                http_response_code(404);
                header('Content-Type: application/json');
                return ['error' => 'Department not found'];
            }
        } catch (\Exception $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            return ['error' => 'Internal Server Error'];
        }
    }

    /**
     * Store a new department record in the associated model.
     *
     * @param array $data The data of the new department.
     * @return array The JSON response indicating the success or failure of the operation.
     */
    public function store(array $data): array
    {
        try {
            $jsonData = file_get_contents('php://input');
            $dataArray = json_decode($jsonData, true);

            if ($dataArray) {

                if (
                    isset($dataArray['name']) && is_string($dataArray['name']) && strlen($dataArray['name']) <= 50 &&
                    isset($dataArray['locationID']) && filter_var($dataArray['locationID'], FILTER_VALIDATE_INT)
                ) {
                    $this->model->setAttributes($dataArray);
                    $this->model->store();
                    http_response_code(201);
                    header('Content-Type: application/json');
                    return ['success' => 'Department added successfully'];
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
     * Update a department record in the associated model.
     *
     * @param int $id The ID of the department to update.
     * @param array $data The updated data for the department.
     * @return array The JSON response indicating the success or failure of the operation.
     */
    public function update(int $id, array $data): array
    {
        try {
            $jsonData = file_get_contents('php://input');
            $data = json_decode($jsonData, true);
            if (
                isset($data['name']) && is_string($data['name']) && strlen($data['name']) <= 50 &&
                isset($data['locationID']) && filter_var($data['locationID'], FILTER_VALIDATE_INT)
            ) {
                $this->model->setAttributes($data);
                $response = $this->model->update($id);

                if ($response === 0) {
                    http_response_code(404);
                    header('Content-Type: application/json');
                    return ['error' => 'Department not found'];
                } elseif ($response === -1) {
                    http_response_code(500);
                    header('Content-Type: application/json');
                    return ['error' => 'Internal Server Error'];
                }

                http_response_code(200);
                header('Content-Type: application/json');
                return ['success' => 'Department updated successfully'];
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
     * Delete a department record from the associated model.
     *
     * @param int $id The ID of the department to delete.
     * @return array The JSON response indicating the success or failure of the operation.
     */
    public function destroy(int $id): array
    {
        try {
            // Check if any personnel records are using this department
            $personnelCount = $this->model->countPersonnelInDepartment($id);

            if ($personnelCount > 0) {
                http_response_code(400); // Bad Request
                header('Content-Type: application/json');
                return ['error' => 'Cannot delete department with associated personnel records'];
            }

            $response = $this->model->delete($id);
            if ($response === 1) {
                http_response_code(204);
                header('Content-Type: application/json');
                return ['success' => 'Department deleted successfully'];
            } elseif ($response === 0) {
                http_response_code(404);
                header('Content-Type: application/json');
                return ['error' => 'Department not found'];
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
