<?php

namespace api\models;

use Exception;

/**
 * Department model class.
 */
class Department extends Model
{
    protected $table = 'department';

    /**
     * Get all department records.
     *
     * @param bool $includeDetails Whether to include additional details.
     * @return array An array of department records.
     */
    public function getAll(bool $includeDetails = false): array
    {
        if ($includeDetails) {
            $sql = 'SELECT d.id, d.name, d.locationID, l.name as location
                FROM department d
                LEFT JOIN location l ON (l.id = d.locationID)
                ORDER BY d.name;';
        } else {
            $sql = "SELECT id, name FROM {$this->table}";
        }

        $result = $this->db->getConnection()->query($sql);

        $results = [];
        while ($row = $result->fetch_assoc()) {
            $results[] = $row;
        }

        return $results;
    }

    /**
     * Get a record by its ID.
     *
     * @param int $id The ID of the record.
     * @param bool $includeDetails Whether to include additional details.
     * @return array|null The record, or null if not found.
     */
    public function getById(int $id, bool $includeDetails = true): ?array
    {
        if ($includeDetails) {
            $sql = 'SELECT d.id, d.name, d.locationID, l.name as location
            FROM department d
            LEFT JOIN location l ON (l.id = d.locationID)
            WHERE d.id = ?';
        } else {
            $sql = "SELECT * FROM {$this->table} WHERE id = ?";
        }

        $statement = $this->db->getConnection()->prepare($sql);
        $statement->bind_param('i', $id);
        $statement->execute();

        $result = $statement->get_result();
        return $result->fetch_assoc();
    }

    public function checkDependencies(int $id): mixed
    {
        $sql = 'SELECT COUNT(p.id) as personnelCount, d.name as departmentName
        FROM personnel p LEFT JOIN department d ON (d.id = p.departmentID)
        WHERE d.id = ?';
    
        try {
            $statement = $this->db->getConnection()->prepare($sql);
            $statement->bind_param('i', $id);
            $statement->execute();
    
            $result = $statement->get_result();
            $data = $result->fetch_assoc();
            
            if ($data['personnelCount'] != 0) {
                return $data;
            } else {
                return null;
            }
        } catch (Exception $e) {
            echo 'Error: ' . $e->getMessage();
            return [];
        }
    }
}
