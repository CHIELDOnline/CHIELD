<?php

$key = $_POST['key'];

$pdo = new PDO('sqlite:../../data/db/CHIELD.sqlite');

$sql= <<<EOT
SELECT 
  a2.name, count(*)
    FROM authors a
  LEFT JOIN authors a2 ON a.bibref=a2.bibref
  WHERE a.name = :key1 and a2.name != :key2
GROUP BY a2.name
EOT;

$statement=$pdo->prepare($sql);
$statement->bindParam(':key1', $key, PDO::PARAM_STR);
$statement->bindParam(':key2', $key, PDO::PARAM_STR);
$statement->execute();
$results=$statement->fetchAll(PDO::FETCH_ASSOC);
$json=json_encode($results);
echo $json;

?> 