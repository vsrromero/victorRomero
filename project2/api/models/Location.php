<?php

namespace api\models;

class Location extends Model
{
    protected $table = 'location';
    
    public function getAll()
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
