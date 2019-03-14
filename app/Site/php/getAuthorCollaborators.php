<?php

$key = $_POST['key'];

$pdo = new PDO('sqlite:../../data/db/CHIELD.sqlite');

$sql= <<<EOT
SELECT 
	a3.name Author,
	group_concat(distinct v.name) Var, 
	count(distinct node) NumVar
FROM (
-- Author's nodes
 SELECT distinct l.Var1 node
 FROM causal_links l
 LEFT JOIN authors a2 ON l.bibref = a2.bibref
 WHERE a2.name = :key1
 
 Union
 
 SELECT distinct l2.Var2
 FROM causal_links l2
 LEFT JOIN authors a2 ON l2.bibref = a2.bibref
 WHERE a2.name = :key2
)
LEFT JOIN causal_links l3 ON node = l3.Var1
LEFT JOIN authors a3 ON l3.bibref = a3.bibref
LEFT JOIN variables v ON node = v.pk
WHERE (node = l3.Var1 or node = l3.Var2) and
	Author != :key3 and
	Author not in (
	SELECT 
	  distinct a4.name
    	FROM authors a5
	  LEFT JOIN authors a4 ON a5.bibref=a4.bibref
	  WHERE a5.name = :key4 and a4.name != :key5
	)
GROUP BY a3.name
EOT;


$statement=$pdo->prepare($sql);
$statement->bindParam(':key1', $key, PDO::PARAM_STR);
$statement->bindParam(':key2', $key, PDO::PARAM_STR);
$statement->bindParam(':key3', $key, PDO::PARAM_STR);
$statement->bindParam(':key4', $key, PDO::PARAM_STR);
$statement->bindParam(':key5', $key, PDO::PARAM_STR);
$statement->execute();
$results=$statement->fetchAll(PDO::FETCH_ASSOC);
$json=json_encode($results);
echo $json;

?> 