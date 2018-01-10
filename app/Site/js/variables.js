// Variables

dtableConfig =  {
		ordering: false,
        lengthChange: false,
        columns: [
        	{ data: 0},
        	// Combine the reference and the citekey to make a link
        	{ data: null, render: function(data,type,row){
        		return '<a href="document.html?key=' + data[1] +'">'+ data[0] + '</a>';
        	}},
        	{ data: 4, visible:false}
        	]
        };


$(document).ready(function(){

	$("#header").load("header.html", function(){
		$("#DocumentsHREF").addClass("active");
	}); 

	preparePage("documents_table","php/getVariables.php");
    requestLinks(php_link);
});