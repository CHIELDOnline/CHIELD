<?php

$key = $_POST['key'];

$pdo = new PDO('sqlite:../../data/db/CHIELD.sqlite');

$sql= "SELECT record FROM documents	WHERE pk='".$key."'";

$statement=$pdo->prepare($sql);
$statement->execute();
$results=$statement->fetchAll(PDO::FETCH_ASSOC);
$json=json_encode($results);
echo $json;

?> 