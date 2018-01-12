// Documents

dtableConfig =  {
		ordering: false,
        lengthChange: false,
        //scrollY: '50vh',
        //scrollCollapse: true,
        pageLength: 8,
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
		$("#DocumentsHREF").addClass("active");
	}); 

	preparePage("documents_table","php/getDocs.php");
    requestLinks(php_link);
});