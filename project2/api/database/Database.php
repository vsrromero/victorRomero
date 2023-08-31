<?php

namespace api\database;

use Dotenv\Dotenv;

require_once __DIR__ . '/../../vendor/autoload.php';
$dotenv = Dotenv::createImmutable(__DIR__ . '/../config/');
$dotenv->load();

/**
 * Database class.
 */
class Database
{

    private static $instance;
    private $connection;

    public function __construct()
    {

        $host = $_ENV['DB_HOST'];
        $port = $_ENV['DB_PORT'];
        $db   = $_ENV['DB_DATABASE'];
        $user = $_ENV['DB_USERNAME'];
        $pass = $_ENV['DB_PASSWORD'];

        $this->connection = new \mysqli($host, $user, $pass, $db, $port);

        if ($this->connection->connect_error) {
            die("Connection failed: " . $this->connection->connect_error);
        }
    }

    /**
     * Get the singleton instance of the Database class.
     *
     * @return Database The singleton instance of the Database class.
     */
    public static function getInstance(): Database
    {
        if (!self::$instance) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    /**
     * Get the database connection.
     *
     * @return mysqli The database connection.
     */
    public function getConnection()
    {
        return $this->connection;
    }

    /**
     * Close the database connection.
     *
     * @return void
     */
    public function closeConnection(): void
    {
        $this->connection->close();
    }
}
