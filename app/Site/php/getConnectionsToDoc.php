<?php

$key = $_POST['key'];

$pdo = new PDO('sqlite:../../data/db/CHIELD.sqlite');

$sql = <<<EOT
select d.[citation] as Document, bibref, s.[name], s.[pk] as Variable from(
select c.bibref, c.Var1 from causal_links c where c.Var1 in 
  (select Var1 from causal_links where bibref=:key1
union
select Var2 from causal_links where bibref=:key2)
  AND c.bibref !=:key3
union
select c2.bibref, c2.Var2 from causal_links c2 where c2.Var2 in 
  (select Var1 from causal_links where bibref=:key4
  union
  select Var2 from causal_links where bibref=:key5)
   AND c2.bibref !=:key6)
   left join variables s ON Var1 = s.pk
   left join documents d ON bibref = d.pk
EOT;


$statement=$pdo->prepare($sql);
$statement->bindParam(':key1', $key);
$statement->bindParam(':key2', $key);
$statement->bindParam(':key3', $key);
$statement->bindParam(':key4', $key);
$statement->bindParam(':key5', $key);
$statement->bindParam(':key6', $key);
$statement->execute();
$results=$statement->fetchAll(PDO::FETCH_ASSOC);
$json=json_encode($results);
echo $json;

?> 