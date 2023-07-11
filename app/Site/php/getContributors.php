<?php

include_once('setDBLocation.php');
$pdo = new PDO('sqlite:'.$dblocation);

$sql= <<<EOT
SELECT
 username, realname,
 count(*)
FROM
 contributors
GROUP BY
 username;
EOT;

$statement=$pdo->prepare($sql);
$statement->execute();
$results=$statement->fetchAll(PDO::FETCH_ASSOC);
$json=json_encode($results);
echo $json;

?> 