<?php

namespace api\models;

class Personnel extends Model
{
    protected $table = 'personnel';

    public function getAll($includeDetails = false)
    {
        if ($includeDetails) {
            $sql = 'SELECT p.id, p.lastName, p.firstName, p.jobTitle, p.email, p.departmentID, d.name as department, l.name as location
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
    

    public function getById($id, $includeDetails = true)
    {
        if ($includeDetails) {
            $sql = 'SELECT p.id, p.lastName, p.firstName, p.jobTitle, p.email, p.departmentID, d.name as department, l.name as location
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
}
