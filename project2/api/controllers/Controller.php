<?php

namespace api\controllers;

use api\models\Model;

abstract class Controller {
    protected $model;

    public function __construct(Model $model) {
        $this->model = $model;
    }

    public function index() {
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
