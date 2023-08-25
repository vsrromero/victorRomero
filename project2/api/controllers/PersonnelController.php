<?php

namespace api\controllers;

use api\models\Personnel;

class PersonnelController extends Controller
{
    public function __construct()
    {
        parent::__construct(new Personnel());
    }

    public function index()
    {
        $results = $this->model->getAll(true);
        header('Content-Type: application/json');
    
        echo json_encode($results);
    }

    public function store($data)
    {
        
        $jsonData = file_get_contents('php://input');
        echo "jsonData: ";
        var_dump($jsonData);
        $dataArray = json_decode($jsonData, true);
        
        if ($dataArray) {
            $this->model->setAttributes($dataArray);
            $this->model->store();
            return ['success' => 'Personnel added successfully'];
        } else {
            return ['error' => 'Invalid JSON data'];
        }
    }
    
    

    public function show($id)
    {
        header('Content-Type: application/json');
        return $this->model->getById($id);
    }

    public function update($id, $data)
    {
        var_dump($data);
        return;
        $jsonData = file_get_contents('php://input');
        $dataArray = json_decode($jsonData, true);
    
        if ($dataArray) {
            $this->model->setAttributes($dataArray);
            $this->model->update($id, $dataArray);
            return ['success' => 'Personnel updated successfully'];
        } else {
            return ['error' => 'Invalid JSON data'];
        }
    }

    public function destroy($id)
    {
        $this->model->delete($id);
    }
}
