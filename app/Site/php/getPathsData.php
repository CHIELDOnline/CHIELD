<?php

$cllocation = '../../data/db/CausalLinksCHIELD.json';
if (!file_exists($cllocation)) {
	$cllocation = '../../../private/db/CausalLinksCHIELD.json';
}

$string = file_get_contents($cllocation);
$json = json_decode($string, true);

echo $json;

?> 