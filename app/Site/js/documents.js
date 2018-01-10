// Documents

dtableConfig =  {
		ordering: false,
        lengthChange: false,
        "columnDefs": [
    			{ "targets": 3,
				 // "data": "key",
				  "render": function ( data, type, row, meta ) {
				  if(type === 'display'){
				     data =  '<a href="variable.html?key='+data+'">Open</a>';
				     }
			      return(data);
				  }
			  }
 	 		]
 	 	};


$(document).ready(function(){

	$("#header").load("header.html", function(){
		$("#VariablesHREF").addClass("active");
	}); 

	preparePage("documents_table","php/getVariables.php");
    requestLinks(php_link);
});