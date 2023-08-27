<?php

namespace api\utilities;

use api\database\Database;

class SearchUtility
{
    public static function searchPersonnel($term)
    {
        $db = new Database(); // Criar uma instância da classe Database
        $connection = $db->getConnection(); // Obter a conexão do banco de dados

        $sql = 'SELECT p.lastName, p.firstName, p.jobTitle, p.email, d.name as department, l.name as location
        FROM personnel p
        LEFT JOIN department d ON (d.id = p.departmentID)
        LEFT JOIN location l ON (l.id = d.locationID)
        WHERE p.lastName LIKE ? OR p.firstName LIKE ? OR p.jobTitle LIKE ? OR p.email LIKE ? OR d.name LIKE ? OR l.name LIKE ?
        ORDER BY p.lastName, p.firstName;';

        // get the value of the search term
        $term = $term['term'];

        $searchTerm = '%' . $term . '%'; // Adding % for partial matching
        $statement = $connection->prepare($sql);
        $statement->bind_param('ssssss', $searchTerm, $searchTerm, $searchTerm, $searchTerm, $searchTerm, $searchTerm);
        $statement->execute();

        $result = $statement->get_result();
        $results = [];
        while ($row = $result->fetch_assoc()) {
            $results[] = $row;
        }
        return $results;
    }

    public static function searchDepartment($term)
    {
        $db = new Database();
        $connection = $db->getConnection();

        $sql = 'SELECT d.name as department, l.name as location
        FROM department d
        LEFT JOIN location l ON (l.id = d.locationID)
        WHERE d.name LIKE ? OR l.name LIKE ?
        ORDER BY d.name;';

        // get the value of the search term
        $term = $term['term'];

        $searchTerm = '%' . $term . '%';
        $statement = $connection->prepare($sql);
        $statement->bind_param('ss', $searchTerm, $searchTerm);
        $statement->execute();

        $result = $statement->get_result();
        $results = [];
        while ($row = $result->fetch_assoc()) {
            $results[] = $row;
        }
        return $results;
    }

    public static function searchLocation($term)
    {
        $db = new Database();
        $connection = $db->getConnection();

        $sql = 'SELECT l.name as location
        FROM location l
        WHERE l.name LIKE ?
        ORDER BY l.name;';

        // get the value of the search term
        $term = $term['term'];

        $searchTerm = '%' . $term . '%';
        $statement = $connection->prepare($sql);
        $statement->bind_param('s', $searchTerm);
        $statement->execute();

        $result = $statement->get_result();
        $results = [];
        while ($row = $result->fetch_assoc()) {
            $results[] = $row;
        }
        return $results;
    }
}
