<?php

include_once('setDBLocation.php');
$pdo = new PDO('sqlite:'.$dblocation);

$sql= <<<EOT
SELECT
name,
 count(*)
FROM
 authors
GROUP BY
 name;
EOT;

$statement=$pdo->prepare($sql);
$statement->execute();
$results=$statement->fetchAll(PDO::FETCH_ASSOC);
$json=json_encode($results);
echo $json;

?> 