// Variables

dtableConfig =  {
		ordering: true,
        lengthChange: false,
        order: [[ 0, "asc" ]],
        columns: [
        	//{ data: 0},
        	// Combine the reference and the citekey to make a link
        	{ data: null, render: function(data,type,row){
        		return '<a href="variable.html?key=' + data[1] +'">'+ data[0] + '</a>';
        	}}
        	]
        };


$(document).ready(function(){

	$("#header").load("header.html", function(){
		$("#VariablesHREF").addClass("active");
	}); 

	preparePage("variables_table","php/getVariables.php");
    requestLinks(php_link);
});