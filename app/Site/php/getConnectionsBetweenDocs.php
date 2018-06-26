<?php

$pdo = new PDO('sqlite:../../data/db/CHIELD.sqlite');

$sql= <<<EOT
SELECT
  doc1.citation
  ,doc2.citation
  ,first_document_links.bibref
  ,second_document_links.bibref
  ,count(distinct first_document_links.Var1) as numberOfLinks
FROM 
  (
  SELECT 
     causal_links.Var1
    ,causal_links.Var2
    ,causal_links.[pk]
  ,causal_links.bibref
  FROM causal_links
  ) first_document_links

CROSS JOIN

  (
   SELECT 
     causal_links.Var1
    ,causal_links.Var2
    ,causal_links.[pk]
  ,causal_links.bibref
  FROM causal_links
  ) second_document_links
  
LEFT JOIN documents doc1 ON first_document_links.bibref = doc1.pk
LEFT JOIN documents doc2 ON second_document_links.bibref = doc2.pk

WHERE (first_document_links.Var1 = second_document_links.Var1
  OR first_document_links.Var1 = second_document_links.Var2
  OR first_document_links.Var2 = second_document_links.Var1
  OR first_document_links.Var2 = second_document_links.Var2)
  AND first_document_links.[pk] < second_document_links.[pk]
  AND first_document_links.bibref > second_document_links.bibref
  
GROUP BY
  first_document_links.bibref, second_document_links.bibref
EOT;


$statement=$pdo->prepare($sql);
$statement->execute();
$results=$statement->fetchAll(PDO::FETCH_ASSOC);
$json=json_encode($results);
echo $json;

?> 