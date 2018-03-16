<?php

$base = '../../data/newRecords/';
$base_processed = "../../data/processedRecords/";

// get the text
$data = json_decode($_POST['json']);


$csv_data = $data->{'csv'};
$bib_data = $data->{"bibtex"};
$con_data = $data->{"contributor"};

// Escape < and >
/*function escapeBrackets($text) {
	$text = str_replace("<","&lt;",$text);
	$text = str_replace(">","&gt;",$text);
    return $text;
}
$csv_data = escapeBrackets($csv_data);
$bib_data = escapeBrackets($bib_data);
$con_data = escapeBrackets($con_data);
*/

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
echo $output;

// make an archive copy
$csv_filename2 = tempnam($base_processed,'CSV');
$bib_filename2 = tempnam($base_processed,'BIB');
$con_filename2 = tempnam($base_processed,'CON');

copy($csv_filename,$csv_filename2);
copy($bib_filename,$bib_filename2);
copy($con_filename,$con_filename2);

// remove the original file
unlink($csv_filename);
unlink($bib_filename);
unlink($con_filename);

?>
