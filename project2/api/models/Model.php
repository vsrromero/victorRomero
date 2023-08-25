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
        $result = $this->db->getConnection()->query($sql);

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

        $types = str_repeat('s', count($values));
        $statement->bind_param($types . 'i', ...$values);

        $statement->execute();
    }

    public function delete($id)
    {
        $sql = "DELETE FROM {$this->table} WHERE id = ?";
        $statement = $this->db->getConnection()->prepare($sql);
        $statement->bind_param('i', $id);
        $statement->execute();
    }
}
