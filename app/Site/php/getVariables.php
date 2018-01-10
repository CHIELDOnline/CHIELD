<?php

$pdo = new PDO('sqlite:../../data/db/CHIELD.sqlite');

$sql= "SELECT name, pk FROM variables";

$statement=$pdo->prepare($sql);
$statement->execute();
$results=$statement->fetchAll(PDO::FETCH_ASSOC);
$json=json_encode($results);
echo $json;

?> 