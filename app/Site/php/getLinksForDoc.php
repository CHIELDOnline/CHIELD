<?php

$key = $_POST['key'];

$pdo = new PDO('sqlite:../../data/db/CHIELD.sqlite');

$sql= "
SELECT s.[name] variable1,
	   Relation as relation,
       s2.[name] variable2
  FROM causal_links l LEFT JOIN variables s 
    ON l.Var1 = s.pk LEFT JOIN variables s2 
    ON l.Var2 = s2.pk
  WHERE l.bibref='".$key."'";

$statement=$pdo->prepare($sql);
$statement->execute();
$results=$statement->fetchAll(PDO::FETCH_ASSOC);
$json=json_encode($results);
echo $json;

?> 