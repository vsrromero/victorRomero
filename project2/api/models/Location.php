<?php

namespace api\models;

/**
 * Location model class.
 */
class Location extends Model
{
    protected $table = 'location';

    /**
     * Get all location records.
     *
     * @return array An array of location records.
     */
    public function getAll(): array
    {
        $sql = 'SELECT id, name FROM location ORDER BY name;';

        $result = $this->db->getConnection()->query($sql);

        $results = [];
        while ($row = $result->fetch_assoc()) {
            $results[] = $row;
        }

        return $results;
    }

    public function checkDependencies(int $id): mixed
    {
        $sql = 'SELECT COUNT(d.id) as departmentCount, l.name as locationName
        FROM department d LEFT JOIN location l ON (l.id = d.locationID)
        WHERE l.id = ?';

        try {
            $statement = $this->db->getConnection()->prepare($sql);
            $statement->bind_param('i', $id);
            $statement->execute();

            $result = $statement->get_result();
            $data = $result->fetch_assoc();

            if ($data['departmentCount'] != 0) {
                return $data;
            } else {
                return null;
            }
        } catch (\Exception $e) {
            echo 'Error: ' . $e->getMessage();
            return null;
        }

    }
}
