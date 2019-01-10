<?php

// Accepts list of causal_link.pk
// Returns links from other papers that connect the same variables

$keylist = $_POST['keylist'];

$pdo = new PDO('sqlite:../../data/db/CHIELD.sqlite');

$sql= "
SELECT
       l2.pk,
       s.[name] variable1,
       l2.Relation as relation,
       s2.[name] variable2,
       l2.Cor,
       l2.Stage,
       l2.Type,
     d.[citation] bibref,
     l2.bibref as citekey,
     l2.Confirmed
FROM causal_links l
LEFT JOIN causal_links l2 ON
  (l.Var1 = l2.Var1 AND l.Var2 = l2.Var2) OR
  (l.Var2 = l2.Var1 AND l.Var1 = l2.Var2)
LEFT JOIN variables s ON l2.Var1 = s.pk 
LEFT JOIN variables s2 ON l2.Var2 = s2.pk
LEFT JOIN documents d ON l2.bibref = d.pk
WHERE l2.bibref != l.bibref ";

// If we've been passed keys, then filter the list
// Add all variables in the array to the IN statement
$keylist = explode(",",$keylist);
$inQuery = implode(',', array_fill(0, count($keylist), '?'));
$sql = $sql." AND l.pk IN (". $inQuery.")";
$statement=$pdo->prepare($sql);

foreach ($keylist as $k => $id){
    $statement->bindValue(($k+1), strval($id), PDO::PARAM_STR);
}


$statement->execute();
$results=$statement->fetchAll(PDO::FETCH_ASSOC);
$json=json_encode($results);
echo $json;

?> 