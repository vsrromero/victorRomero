<?php

namespace api\models;

use api\database\Database;

/**
 * Abstract model class.
 */
abstract class Model
{
    protected $table = '';
    protected $attributes = [];
    protected $db;

    public function __construct()
    {
        $this->db = new Database();
    }


    /**
     * Set attributes for the model.
     *
     * @param array $attributes The attributes to set.
     * @return void
     */
    public function setAttributes(array $attributes): void
    {
        foreach ($attributes as $key => $value) {
            $this->attributes[$key] = $value;
        }
    }

    /**
     * Get the attributes of the model.
     *
     * @return array The attributes of the model.
     */
    public function getAttributes(): array
    {
        return $this->attributes;
    }

    /**
     * Get all records from the table.
     *
     * @return array An array of records from the table.
     */
    public function getAll(): array
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

    /**
     * Get a record by its ID.
     *
     * @param int $id The ID of the record.
     * @return array|null The record, or null if not found.
     */
    public function getById(int $id): ?array
    {
        $sql = "SELECT * FROM {$this->table} WHERE id = ?";
        $statement = $this->db->getConnection()->prepare($sql);
        $statement->bind_param('i', $id);
        $statement->execute();

        $result = $statement->get_result();
        return $result->fetch_assoc();
    }

    /**
     * Store a new record in the table.
     *
     * @return void
     */
    public function store(): void
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

    /**
     * Update a record by its ID.
     *
     * @param int $id The ID of the record to update.
     * @return int The result code (1 for Updated, 2 for No changes, 0 for Not found, -1 for Error).
     */
    public function update(int $id): int
    {
        $attributes = $this->getAttributes();
        $updates = implode(', ', array_map(function ($column) {
            return "$column = ?";
        }, array_keys($attributes)));

        $sql = "UPDATE {$this->table} SET $updates WHERE id = ?";

        $statement = $this->db->getConnection()->prepare($sql);

        $values = array_values($attributes);
        $values[] = $id;

        $types = str_repeat('s', count($values) - 1) . 'i';
        $statement->bind_param($types, ...$values);

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

    /**
     * Delete a record by its ID.
     *
     * @param int $id The ID of the record to delete.
     * @return int The result code (1 for Deleted, 0 for Not found, -1 for Error).
     */
    public function delete(int $id): int
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

    public function checkDependencies(int $id): mixed
    {
        return 0;
    }

}
