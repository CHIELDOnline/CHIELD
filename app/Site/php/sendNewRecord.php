<?php

$base = '../../data/newRecords/';
$base_processed = "../../data/processedRecords/";

// get the text
$data = json_decode($_POST['json']);

var_dump($data);

$csv_data = $data->{'csv'};
$bib_data = $data->{"bibtex"};
$con_data = $data->{"contributor"};

// Escape < and >
$csv_data = htmlentities($csv_data);
$bib_data = htmlentities($bib_data);
$con_data = htmlentities($con_data);

// Write data to files

$csv_filename = tempnam($base,'CSV');
$bib_filename = tempnam($base,'BIB');
$con_filename = tempnam($base,'CON');

chmod($csv_filename, 0644);
chmod($bib_filename, 0644);
chmod($con_filename, 0644);

$fpcsv = fopen($csv_filename, 'wb');
fwrite($fpcsv, $csv_data);
fclose($fpcsv);
$fpbib = fopen($bib_filename, 'wb');
fwrite($fpbib, $bib_data);
fclose($fpbib);
$fpcon = fopen($con_filename, 'wb');
fwrite($fpcon, $con_data);
fclose($fpcon);

// path_to_python below should be replaced with the path 
// to the python executable.  This is done by deploy.sh
$command = 'cd ../../data;path_to_python sendToRepo.py '.$csv_filename.' '.$bib_filename.' '.$con_filename;
$output = shell_exec($command);

// make an archive copy
//$fp2 = fopen($filename_processed, 'wb');
//fwrite($fp2, $data);
//fclose($fp2);

// remove the original file
//unlink($filename);


echo $output;

?>
