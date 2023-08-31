<?php

namespace api\utilities;

use api\controllers\PersonnelController as Personnel;

$personnelController = new Personnel();
$personnelData = $personnelController->index();
$response = $personnelData;


header('Content-Type: application/json; charset=UTF-8');
echo json_encode($response);
