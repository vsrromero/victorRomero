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

    public function delete(int $id): int
    {
        // Verifique as dependências
        $checkDependencies = "SELECT COUNT(*) as locationCount
    FROM department
    WHERE locationID = ?";
        $statement = $this->db->getConnection()->prepare($checkDependencies);
        $statement->bind_param('i', $id);
        $statement->execute();

        $result = $statement->get_result();
        $row = $result->fetch_assoc();
        $locationCount = $row['locationCount'];

        if ($locationCount < 1) {
            $sql = "DELETE FROM location WHERE id = ?";
            $statement = $this->db->getConnection()->prepare($sql);
            $statement->bind_param('i', $id);

            if ($statement->execute()) {
                // Verifique se alguma linha foi afetada (excluída)
                if ($statement->affected_rows > 0) {
                    $debug = ['msg' => 'Location model::delete() returning 1'];
                    var_dump($debug);
                    return 1; // Excluído
                } else {
                    $debug = ['msg' => 'Location model::delete() returning 0'];
                    var_dump($debug);
                    return 0; // Não encontrado
                }
            } else {
                $debug = ['msg' => 'Location model::delete() returning -1'];
                var_dump($debug);
                return -1; // Erro
            }
        } else {
            return -2;
        }
    }
}
