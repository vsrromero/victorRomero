<?php

namespace api\controllers;

use api\models\Model;

/**
 * Base Controller class that provides common CRUD operations.
 */
abstract class Controller {
    protected $model;

    /**
     * Constructor for the Controller class.
     *
     * @param Model $model The model associated with this controller.
     */
    public function __construct(Model $model) {
        $this->model = $model;
    }

    /**
     * Retrieve all records from the associated model.
     *
     * @return array An array of all records.
     */
    public function index(): array {
        return $this->model->getAll();
    }

    public function store($data) {
        $this->model->setAttributes($data);
        $this->model->store();
    }

    public function show($id) {
        return $this->model->getById($id);
    }

    public function update($id, $data) {
        $this->model->setAttributes($data);
        $this->model->update($id);
    }

    public function destroy($id) {
        $this->model->delete($id);
    }
}

?>
