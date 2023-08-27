<?php

namespace api\models;

class Department extends Model
{
    protected $table = 'department';

    public function getAll($includeDetails = false)
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

    public function getById($id, $includeDetails = true)
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
}
