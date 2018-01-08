<?php

// get the text
$data = $_POST['data'];


$base = '../../data/newRecords/';
//if(file_exists ( "/srv/www.excdlab/data" )){
//$base = '/srv/www.excdlab/data/StoryTransmission/';
//}

$fn = microtime()."_".rand(1000,9999).".txt";
$fn = substr($fn,2,strlen($fn));

$filename = $base.$fn;

//echo($filename);

$fp = fopen($filename, 'wb');
fwrite($fp, $data);
fclose($fp);

$command = 'cd ../../data;path_to_python sendToRepo.py';
$output = shell_exec($command);

echo $output;

?>
