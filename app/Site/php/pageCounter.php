<?php

$page = $_POST['page'];
$pdo = new PDO('sqlite:../../data/db/counter.sqlite');

$insert_sql = "INSERT OR IGNORE INTO counts VALUES (:page, 0)";
$insert_statement=$pdo->prepare($insert_sql);
$insert_statement->bindParam(':page', $page, PDO::PARAM_STR);
$insert_statement->execute();

$update_sql = "UPDATE counts SET count = count + 1 WHERE page = :page";
$update_statement=$pdo->prepare($update_sql);
$update_statement->bindParam(':page', $page, PDO::PARAM_STR);
$update_statement->execute();

echo("DONE");
?> 