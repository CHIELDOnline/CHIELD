<?php

$key = $_POST['key'];

$pdo = new PDO('sqlite:../../data/db/CHIELD.sqlite');

$sql= "SELECT username, realname FROM contributors WHERE bibref=:key";
$statement=$pdo->prepare($sql);
$statement->bindParam(':key', $key, PDO::PARAM_STR);
$statement->execute();
$results=$statement->fetchAll(PDO::FETCH_ASSOC);
$json=json_encode($results);
echo $json;

?> 