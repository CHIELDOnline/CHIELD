// Causal links

$(document).ready(function(){
	console.log("Start");
	
	dtableConfig =  {
		ordering: false,
        lengthChange: false};
	
	preparePage("links_table","php/getLinks.php");
    requestLinks(php_link);
});