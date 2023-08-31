<?php

namespace api\controllers;

use api\utilities\SearchUtility;
use api\models\Department;

/**
 * Controller class for searching departments.
 */
class SearchDepartmentController extends Controller
{
    public function __construct()
    {
        parent::__construct(new Department());
    }

    /**
     * Retrieve and return a specific record from the associated model.
     *
     * @param array $term The search term.
     * @return array The JSON response containing the list of departments.
     */
    public function searchDepartment($term): array
    {
        try {

            if (!isset($term['term']) || !is_string($term['term']) || trim($term['term']) === '') {
                http_response_code(400);
                header('Content-Type: application/json');
                return ['error' => 'Invalid input'];
            }

            // Trim and sanitize the input
            $searchTerm = trim($term['term']);

            // Disallow "#" symbol and check maximum length (50 characters)
            if (preg_match('/[#]/', $searchTerm) || mb_strlen($searchTerm, 'UTF-8') > 50) {
                http_response_code(400);
                header('Content-Type: application/json');
                return ['error' => 'Invalid input characters or input too long'];
            }

            // Validate against special characters and accents
            if (!preg_match('/^[\p{L}0-9\s]*$/u', $searchTerm)) {
                http_response_code(400);
                header('Content-Type: application/json');
                return ['error' => 'Invalid input characters'];
            }

            $results = SearchUtility::searchDepartment($term);

            // Escape HTML characters - Cross-Site Scripting (XSS) prevention
            foreach ($results as &$result) {
                foreach ($result as &$value) {
                    $value = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
                }
            }

            if (empty($results)) {
                http_response_code(404);
                header('Content-Type: application/json');
                return ['error' => 'No results found'];
            }

            http_response_code(200);
            header('Content-Type: application/json');
            return $results;
        } catch (\Exception $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            return ['error' => 'Internal Server Error'];
        }
    }
}
