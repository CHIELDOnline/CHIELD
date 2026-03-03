<?php

$base = '../../data/issues/';

// get the text
$data = json_decode($_POST['json']);

$text_data = $data->{'text'};
$label_data = $data->{"label"};
$title_data = $data->{"title"};

// Escape < and >
function escapeBrackets($text) {
	$text = str_replace("<","&lt;",$text);
	$text = str_replace(">","&gt;",$text);
    return $text;
}
$text_data = escapeBrackets($text_data);
$label_data = escapeBrackets($label_data);
$title_data = escapeBrackets($title_data);


// Write data to files

$text_filename = tempnam($base,'TXT');
chmod($text_filename, 0644);
$fptext = fopen($text_filename, 'wb');
fwrite($fptext, $text_data);
fclose($fptext);

$label_filename = tempnam($base,'LAB');
chmod($label_filename, 0644);
$fplabel = fopen($label_filename, 'wb');
fwrite($fplabel, $label_data);
fclose($fplabel);

$title_filename = tempnam($base,'TIT');
chmod($title_filename, 0644);
$fptitle = fopen($title_filename, 'wb');
fwrite($fptitle, $title_data);
fclose($fptitle);

// path_to_python below should be replaced with the path 
// to the python executable.  This is done by deploy.sh
$command = 'cd ../../data;path_to_python createIssue.py '.$text_filename.' '.$label_filename.' '.$title_filename;
$output = shell_exec($command);
echo $output;

// remove the original file
//unlink($text_filename);
//unlink($label_filename);
//unlink($title_filename);


?>
