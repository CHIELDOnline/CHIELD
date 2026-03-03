<?php

include_once('setDBLocation.php');
$pdo = new PDO('sqlite:'.$dblocation);

$sql= "SELECT pk, citation FROM documents";

$statement=$pdo->prepare($sql);
$statement->execute();
$results=$statement->fetchAll(PDO::FETCH_ASSOC);
$json=json_encode($results);
echo $json;

?> 