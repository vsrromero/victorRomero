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
}
