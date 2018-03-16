<?php

$key = $_POST['key'];

$pdo = new PDO('sqlite:../../data/db/CHIELD.sqlite');

$sql= <<<EOT
SELECT l.pk,
     s.[name] variable1,
	   Relation as relation,
       s2.[name] variable2,
       Cor,
       Topic,
       Stage,
       Type,
       Confirmed,
       Notes
  FROM causal_links l
    LEFT JOIN variables s ON l.Var1 = s.pk 
    LEFT JOIN variables s2 ON l.Var2 = s2.pk
  WHERE l.bibref=:key
EOT;



$statement=$pdo->prepare($sql);
$statement->bindParam(':key', $key);
$statement->execute();
$results=$statement->fetchAll(PDO::FETCH_ASSOC);
$json=json_encode($results);
echo $json;

?> 