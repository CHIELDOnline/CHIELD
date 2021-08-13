<?php

$uniqueNodes = $_POST['uniqueNodes'];

include_once('setDBLocation.php');
$pdo = new PDO('sqlite:'.$dblocation);

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
  WHERE s.[pk] IN (".$uniqueNodes.") AND s2.[pk] IN (".$uniqueNodes.")";

$statement=$pdo->prepare($sql);
#$statement->bindParam(':keylist', $keylist, PDO::PARAM_STR);
$statement->execute();
$results=$statement->fetchAll(PDO::FETCH_ASSOC);
$json=json_encode($results);
echo $json;

?> 