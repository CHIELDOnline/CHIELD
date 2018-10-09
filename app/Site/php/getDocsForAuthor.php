<?php

$key = $_POST['key'];

$pdo = new PDO('sqlite:../../data/db/CHIELD.sqlite');

$sql= <<<EOT
SELECT 
  d.citation, d.title, d.year, a.bibref
    FROM authors a
  LEFT JOIN documents d ON a.bibref = d.pk
  WHERE a.name = :key
EOT;

$statement=$pdo->prepare($sql);
$statement->bindParam(':key', $key, PDO::PARAM_STR);
$statement->execute();
$results=$statement->fetchAll(PDO::FETCH_ASSOC);
$json=json_encode($results);
echo $json;

?> 