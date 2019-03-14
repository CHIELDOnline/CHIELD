<?php

$key = $_POST['key'];

$pdo = new PDO('sqlite:../../data/db/CHIELD.sqlite');

$sql= <<<EOT
SELECT s.[name] variable1,
     Relation as relation,
       s2.[name] variable2,
       Cor,
       Topic,
       Stage,
       Type,
       Notes,
       d.[citation] bibref,
       bibref as citekey,
       l.Confirmed
  FROM causal_links l 
  LEFT JOIN variables s ON l.Var1 = s.pk 
  LEFT JOIN variables s2 ON l.Var2 = s2.pk
  LEFT JOIN documents d ON l.bibref = d.pk
  WHERE s.[pk]=:key1 or s2.[pk]=:key2
EOT;

$statement=$pdo->prepare($sql);
$statement->bindParam(':key1', $key, PDO::PARAM_STR);
$statement->bindParam(':key2', $key, PDO::PARAM_STR);
$statement->execute();
$results=$statement->fetchAll(PDO::FETCH_ASSOC);
$json=json_encode($results);
echo $json;

?> 