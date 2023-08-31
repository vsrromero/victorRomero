<?php

namespace api\models;

/**
 * Personnel model class.
 */
class Personnel extends Model
{
    protected $table = 'personnel';

    /**
     * Get all personnel records.
     *
     * @param bool $includeDetails Whether to include additional details like department and location.
     * @return array An array of personnel records.
     */
    public function getAll(bool $includeDetails = false): array
    {
        if ($includeDetails) {
            $sql = 'SELECT p.id, p.lastName, p.firstName, p.jobTitle, p.email, p.departmentID, d.name as department, d.locationID, l.id as locationID, l.name as location
                FROM personnel p
                LEFT JOIN department d ON (d.id = p.departmentID)
                LEFT JOIN location l ON (l.id = d.locationID)
                ORDER BY p.lastName, p.firstName;';
        } else {
            $sql = "SELECT p.id, p.lastName, p.firstName, p.jobTitle, p.email FROM {$this->table} p";
        }

        $result = $this->db->getConnection()->query($sql);

        $results = [];
        while ($row = $result->fetch_assoc()) {
            $results[] = $row;
        }

        return $results;
    }

    /**
     * Get a personnel record by its ID.
     *
     * @param int $id The ID of the personnel record.
     * @param bool $includeDetails Whether to include additional details like department and location.
     * @return array|null The personnel record, or null if not found.
     */
    public function getById(int $id, bool $includeDetails = true): ?array
    {
        if ($includeDetails) {
            $sql = 'SELECT p.id, p.lastName, p.firstName, p.jobTitle, p.email, p.departmentID, d.name as department, d.locationID, l.id as locationID, l.name as location
            FROM personnel p
            LEFT JOIN department d ON (d.id = p.departmentID)
            LEFT JOIN location l ON (l.id = d.locationID)
            WHERE p.id = ?';
        } else {
            $sql = "SELECT * FROM {$this->table} WHERE id = ?";
        }

        $statement = $this->db->getConnection()->prepare($sql);
        $statement->bind_param('i', $id);
        $statement->execute();

        $result = $statement->get_result();
        return $result->fetch_assoc();
    }

    /**
     * Get a personnel record by its ID and return as JSON.
     *
     * @param int $id The ID of the personnel record.
     * @return string|null The personnel record as JSON, or null if not found.
     */
    public function getJsonById(int $id): ?string
    {
        $data = $this->getById($id);
        return json_encode($data);
    }
}
