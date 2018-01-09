<?php

// get the text
$data = $_POST['data'];


$base = '../../data/newRecords/';
$base_processed = "../../data/processedRecords/";
//if(file_exists ( "/srv/www.excdlab/data" )){
//$base = '/srv/www.excdlab/data/StoryTransmission/';
//}

$fn = microtime()."_".rand(1000,9999).".txt";
$fn = substr($fn,2,strlen($fn));

$filename = $base.$fn;
$filename_processed = $base_processed.$fn;

//echo($filename);

$fp = fopen($filename, 'wb');
fwrite($fp, $data);
fclose($fp);

// path_to_python below should be replaced with the path 
// to the python executable.  This is done by deploy.sh
$command = 'cd ../../data;path_to_python sendToRepo.py';
$output = shell_exec($command);

// make an archive copy
$fp2 = fopen($filename_processed, 'wb');
fwrite($fp2, $data);
fclose($fp2);

// remove the original file
unlink($filename);



echo $output;

?>
