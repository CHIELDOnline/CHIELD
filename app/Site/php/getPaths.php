<?php

$var1 = $_POST['var1'];
$var2 = $_POST['var2'];

$command = escapeshellcmd('python ../../data/getPaths.py '.escapeshellarg($var1)." ".escapeshellarg($var2));
$output = exec($command);

$pdo = new PDO('sqlite:../../data/db/CHIELD.sqlite');

$sql= "
SELECT l.pk,
       s.[name] variable1,
       Relation as relation,
       s2.[name] variable2,
       Cor,
       Stage,
       Type,
     d.[citation] bibref,
     bibref as citekey,
     l.Confirmed
  FROM causal_links l 
  LEFT JOIN variables s ON l.Var1 = s.pk 
  LEFT JOIN variables s2 ON l.Var2 = s2.pk
  LEFT JOIN documents d ON l.bibref = d.pk
  WHERE s.[pk] IN (".$output.") AND s2.[pk] IN (".$output.")";

$statement=$pdo->prepare($sql);
#$statement->bindParam(':keylist', $keylist, PDO::PARAM_STR);
$statement->execute();
$results=$statement->fetchAll(PDO::FETCH_ASSOC);
$json=json_encode($results);
echo $json;

?> 