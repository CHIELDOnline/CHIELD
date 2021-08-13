<?php

include_once('setDBLocation.php');
$pdo = new PDO('sqlite:'.$dblocation);

$sql= <<<EOT
SELECT l.pk,
	   l.bibref,
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
  WHERE Notes IS NOT NULL AND Notes != ""
  ORDER BY RANDOM() LIMIT 1;
EOT;



$statement=$pdo->prepare($sql);
$statement->execute();
$results=$statement->fetchAll(PDO::FETCH_ASSOC);
$json=json_encode($results);
echo $json;

?> 