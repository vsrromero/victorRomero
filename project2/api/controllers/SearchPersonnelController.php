<?php

namespace api\controllers;

use api\utilities\SearchUtility;
use api\models\Personnel;

class SearchPersonnelController extends Controller
{
    public function __construct()
    {
        parent::__construct(new Personnel());
    }

    public function searchPersonnel($term)
    {
        try {
            // Validate input: Make sure $term is a non-empty string without special characters
            if (!isset($term['term']) || !is_string($term['term']) || trim($term['term']) === '') {
                http_response_code(400);
                header('Content-Type: application/json');
                return ['error' => 'Invalid input'];
            }

            // Trim and sanitize the input
            $searchTerm = trim($term['term']);

            // Check maximum length (50 characters)
            if (mb_strlen($searchTerm, 'UTF-8') > 50) {
                http_response_code(400);
                header('Content-Type: application/json');
                return ['error' => 'Input too long'];
            }

            // Validate against special characters except @, accents, and ç
            if (!preg_match('/^[\p{L}0-9\s@çáéíóúàèìòùâêîôûãõü]*$/iu', $searchTerm)) {
                http_response_code(400);
                header('Content-Type: application/json');
                return ['error' => 'Invalid input characters'];
            }

            $results = SearchUtility::searchPersonnel(['term' => $searchTerm]);

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

