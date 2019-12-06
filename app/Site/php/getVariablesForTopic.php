<?php

$key = "%".$_POST['key']."%";

$pdo = new PDO('sqlite:../../data/db/CHIELD.sqlite');

$sql= <<<EOT
SELECT name, pk, COUNT(name) FROM (
SELECT s.[name],s.[pk]
  FROM causal_links l 
  LEFT JOIN variables s ON l.Var1 = s.pk 
  WHERE l.[topic] LIKE :key1
UNION ALL
SELECT s.[name],s.[pk]
  FROM causal_links l 
  LEFT JOIN variables s ON l.Var2 = s.pk 
  WHERE l.[topic] LIKE :key2
  )
  GROUP BY name ORDER BY COUNT(name) DESC
EOT;

$statement=$pdo->prepare($sql);
$statement->bindParam(':key1', $key, PDO::PARAM_STR);
$statement->bindParam(':key2', $key, PDO::PARAM_STR);
$statement->execute();
$results=$statement->fetchAll(PDO::FETCH_ASSOC);
$json=json_encode($results);
echo $json;


?> 