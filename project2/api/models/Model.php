<?php

namespace api\models;

use api\database\Database;

abstract class Model
{
    protected $table = '';
    protected $attributes = [];
    protected $db;

    public function __construct()
    {
        $this->db = new Database();
    }

    public function setAttributes(array $attributes)
    {
        foreach ($attributes as $key => $value) {
            $this->attributes[$key] = $value;
        }
    }

    public function getAttributes()
    {
        return $this->attributes;
    }

    public function getAll()
    {
        $sql = "SELECT * FROM {$this->table}";
        $statement = $this->db->getConnection()->prepare($sql);
        $statement->execute();

        $result = $statement->get_result();
        $results = [];
        while ($row = $result->fetch_assoc()) {
            $results[] = $row;
        }
        return $results;
    }

    public function getById($id)
    {
        $sql = "SELECT * FROM {$this->table} WHERE id = ?";
        $statement = $this->db->getConnection()->prepare($sql);
        $statement->bind_param('i', $id);
        $statement->execute();

        $result = $statement->get_result();
        return $result->fetch_assoc();
    }

    public function store()
    {
        $attributes = $this->getAttributes();
        $columns = implode(', ', array_keys($attributes));
        $values = implode(', ', array_fill(0, count($attributes), '?'));

        $sql = "INSERT INTO {$this->table} ($columns) VALUES ($values)";

        $statement = $this->db->getConnection()->prepare($sql);

        $values = array_values($attributes);
        $types = str_repeat('s', count($values));
        $statement->bind_param($types, ...$values);

        $statement->execute();
    }

    public function update($id)
    {
        $attributes = $this->getAttributes();
        $updates = implode(', ', array_map(function ($column) {
            return "$column = ?";
        }, array_keys($attributes)));

        $sql = "UPDATE {$this->table} SET $updates WHERE id = ?";

        $statement = $this->db->getConnection()->prepare($sql);

        $values = array_values($attributes);
        $values[] = $id;

        $types = str_repeat('s', count($values) - 1) . 'i'; // Include the ID data type
        $statement->bind_param($types, ...$values); // Bind all values, including the ID

        if ($statement->execute()) {
            // Check if any rows were affected (updated)
            if ($statement->affected_rows > 0) {
                return 1; // Updated
            } else {
                // No rows were affected, check if the record exists
                $checkExistence = "SELECT id FROM {$this->table} WHERE id = ?";
                $existenceStatement = $this->db->getConnection()->prepare($checkExistence);
                $existenceStatement->bind_param('i', $id);
                $existenceStatement->execute();

                if ($existenceStatement->fetch()) {
                    return 2; // No changes made
                } else {
                    return 0; // Not found
                }
            }
        } else {
            return -1; // Error
        }
    }

    public function delete($id)
    {
        $sql = "DELETE FROM {$this->table} WHERE id = ?";
        $statement = $this->db->getConnection()->prepare($sql);
        $statement->bind_param('i', $id);

        if ($statement->execute()) {
            // Check if any rows were affected (deleted)
            if ($statement->affected_rows > 0) {
                return 1; // Deleted
            } else {
                return 0; // Not found
            }
        } else {
            return -1; // Error
        }
    }

    public function countPersonnelInDepartment($departmentId)
    {
        $sql = "SELECT COUNT(*) AS count FROM personnel WHERE departmentID = ?";
        $statement = $this->db->getConnection()->prepare($sql);
        $statement->bind_param('i', $departmentId);
        $statement->execute();

        $result = $statement->get_result();
        $row = $result->fetch_assoc();

        return $row['count'];
    }

    public function countDepartmentsInLocation($locationId)
    {
        $sql = "SELECT COUNT(*) AS count FROM department WHERE locationID = ?";
        $statement = $this->db->getConnection()->prepare($sql);
        $statement->bind_param('i', $locationId);
        $statement->execute();

        $result = $statement->get_result();
        $row = $result->fetch_assoc();

        return $row['count'];
    }
}
