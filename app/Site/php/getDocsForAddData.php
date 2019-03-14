<?php

$pdo = new PDO('sqlite:../../data/db/CHIELD.sqlite');

$sql= "SELECT title, pk	FROM documents d";


$statement=$pdo->prepare($sql);
$statement->execute();
$results=$statement->fetchAll(PDO::FETCH_ASSOC);
$json=json_encode($results);
echo $json;

?> 