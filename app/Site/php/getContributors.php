<?php

$pdo = new PDO('sqlite:../../data/db/CHIELD.sqlite');

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