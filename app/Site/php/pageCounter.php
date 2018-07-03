<?php

$page = $_POST['page'];
$pdo = new PDO('sqlite:../../data/db/counter.sqlite');


$sql= "INSERT OR IGNORE INTO counts VALUES (:page1, 0); UPDATE counts SET count = count + 1 WHERE page LIKE :page2";
$statement=$pdo->prepare($sql);
$statement->bindParam(':page1', $page, PDO::PARAM_STR);
$statement->bindParam(':page2', $page, PDO::PARAM_STR);
$statement->execute();
echo("DONE");

?> 