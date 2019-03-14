<?php

$keylist = $_POST['keylist'];

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
  LEFT JOIN documents d ON l.bibref = d.pk";


// If we've been passed keys, then filter the list
// Add all variables in the array to the IN statement
$keylist = explode(",",$keylist);
$inQuery = implode(',', array_fill(0, count($keylist), '?'));
$sql = $sql." WHERE l.pk IN (". $inQuery.")";
$statement=$pdo->prepare($sql);

foreach ($keylist as $k => $id){
    $statement->bindValue(($k+1), strval($id), PDO::PARAM_STR);
}


$statement->execute();
$results=$statement->fetchAll(PDO::FETCH_ASSOC);
$json=json_encode($results);
echo $json;

?> 