<?php

namespace api\controllers;

use api\models\Model;

/**
 * Base Controller class that provides common CRUD operations.
 */
abstract class Controller
{
    protected $model;

    /**
     * Constructor for the Controller class.
     *
     * @param Model $model The model associated with this controller.
     */
    public function __construct(Model $model)
    {
        $this->model = $model;
    }

    /**
     * Retrieve all records from the associated model.
     *
     * @return array An array of all records.
     */
    public function index(): array
    {
        return $this->model->getAll();
    }

    /**
     * Store a new record in the associated model.
     *
     * @param array $data The data to be stored.
     * @return mixed The stored record.
     */
    public function store($data): mixed
    {
        $this->model->setAttributes($data);
        $this->model->store();

    }

    /**
     * Retrieve a specific record from the associated model.
     *
     * @param int $id The ID of the record to retrieve.
     * @return mixed The retrieved record.
     */
    public function show($id): mixed
    {
        return $this->model->getById($id);
    }

    /**
     * Update a specific record in the associated model.
     *
     * @param int $id The ID of the record to update.
     * @param array $data The data to update the record with.
     * @return mixed The updated record.
     */
    public function update($id, $data): mixed
    {
        $this->model->setAttributes($data);
        $this->model->update($id);
    }

    /**
     * Delete a specific record from the associated model.
     *
     * @param int $id The ID of the record to delete.
     * @return mixed The deleted record.
     */
    public function destroy($id): mixed
    {
        $this->model->delete($id);
    }
}
