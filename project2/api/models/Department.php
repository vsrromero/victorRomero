<?php

namespace api\models;

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

    public function delete(int $id): int 
    {
        // Verifique as dependências
        $checkDependencies = "SELECT COUNT(*) as departmentCount
        FROM personnel
        WHERE departmentID = ?";
        $statement = $this->db->getConnection()->prepare($checkDependencies);
        $statement->bind_param('i', $id);
        $statement->execute();

        $result = $statement->get_result();
        $row = $result->fetch_assoc();
        $departmentCount = $row['departmentCount'];

        if ($departmentCount < 1) {
            $sql = "DELETE FROM {$this->table} WHERE id = ?";
            $statement = $this->db->getConnection()->prepare($sql);
            $statement->bind_param('i', $id);
    
            if ($statement->execute()) {
                // Check if any rows were affected (deleted)
                if ($statement->affected_rows > 0) {
                    $debug = ['msg' => 'Department model::delete() returning 1'];
                    var_dump($debug);
                    return 1; // Deleted
                } else {
                    $debug = ['msg' => 'Department model::delete() returning 0'];
                    var_dump($debug);
                    return 0; // Not found
                }
            } else {
                $debug = ['msg' => 'Department model::delete() returning -1'];
                var_dump($debug);
                return -1; // Error
            }
        } else {
            return -2;
        }
    }
}
