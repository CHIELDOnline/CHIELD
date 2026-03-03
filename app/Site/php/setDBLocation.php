<?php
$dblocation = '../../data/db/CHIELD.sqlite';
if (!file_exists($dblocation)) {
	$dblocation = '../../../private/db/CHIELD.sqlite';
}
?>