<?php

$key = $_POST['key'];

include_once('setDBLocation.php');
$pdo = new PDO('sqlite:'.$dblocation);

$sql= "SELECT name FROM variables WHERE pk=:key";

$statement=$pdo->prepare($sql);
$statement->bindParam(':key', $key, PDO::PARAM_STR);
$statement->execute();
$results=$statement->fetchAll(PDO::FETCH_ASSOC);
$json=json_encode($results);
echo $json;

?> 