// Documents

dtableConfig =  {
		ordering: false,
        lengthChange: false,
        "columnDefs": [
    			{ "targets": 3,
				 // "data": "key",
				  "render": function ( data, type, row, meta ) {
				  if(type === 'display'){
				     data =  '<a href="document.html?key='+data+'">Open</a>';
				     }
			      return(data);
				  }
			  }
 	 		]
 	 	};


$(document).ready(function(){

	$("#header").load("header.html", function(){
		$("#DocumentsHREF").addClass("active");
	}); 

	preparePage("documents_table","php/getDocs.php");
    requestLinks(php_link);
});