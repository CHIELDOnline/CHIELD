<?php

$pdo = new PDO('sqlite:../../data/db/CHIELD.sqlite');

$sql= <<<EOT
SELECT 
	Researcher1,
	Researcher2,
	count(distinct node) as numberOfLinks
FROM (
SELECT 
	a1.name Researcher1, 
	a2.name Researcher2,
	l1.Var1 node
FROM causal_links l1 CROSS JOIN causal_links l2
LEFT JOIN authors a1 on l1.bibref = a1.bibref 
LEFT JOIN authors a2 on l2.bibref = a2.bibref
WHERE (l1.Var1 = l2.Var1 OR l1.Var1 = l2.Var2)
	and Researcher1 > Researcher2 -- avoid duplicate pairs
	and a1.bibref != a2.bibref  -- don't count same publication

UNION ALL

SELECT 
	a1.name Researcher1, 
	a2.name Researcher2,
	l1.Var2 node
FROM causal_links l1 CROSS JOIN causal_links l2
LEFT JOIN authors a1 on l1.bibref = a1.bibref 
LEFT JOIN authors a2 on l2.bibref = a2.bibref
WHERE (l1.Var2 = l2.Var1 OR l1.Var2 = l2.Var2)
	and Researcher1 > Researcher2 -- avoid duplicate pairs
	and a1.bibref != a2.bibref  -- don't count same publication
)
GROUP BY 
	Researcher1, Researcher2
ORDER BY
	numberOfLinks DESC
EOT;


$statement=$pdo->prepare($sql);
$statement->execute();
$results=$statement->fetchAll(PDO::FETCH_ASSOC);
$json=json_encode($results);
echo $json;

?> 