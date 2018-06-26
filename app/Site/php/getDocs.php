<?php

$pdo = new PDO('sqlite:../../data/db/CHIELD.sqlite');

$sql= <<<EOT
SELECT author, year, title, pk, 
	group_concat(c.username,";") as username, 
	group_concat(c.realname,";") as realname
	FROM documents d 
	LEFT JOIN contributors c ON d.pk = c.bibref
	GROUP BY pk
EOT;


$statement=$pdo->prepare($sql);
$statement->execute();
$results=$statement->fetchAll(PDO::FETCH_ASSOC);
$json=json_encode($results);
echo $json;

?> 