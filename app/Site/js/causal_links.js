// Causal links

$(document).ready(function(){

	$("#header").load("header.html", function(){
		$("#CausalLinksHREF").addClass("active");
	}); 
	

	console.log("Start");
	
	dtableConfig =  {
		ordering: true,
        lengthChange: false,
        order: [[ 3, "asc" ]],
        columns: [
        	{ data: 0},
        	{ data: 1},
        	{ data: 2},
        	// Combine the reference and the citekey to make a link
        	{ data: null, render: function(data,type,row){
        		return '<a href="document.html?key=' + data[4] +'">'+data[3] + '</a>';
        	}},
        	{ data: 4, visible:false}
        	]
        };

        //{ data: null, render: function ( data, type, row ) {
      //          // Combine the first and last names into a single table field
        //        return data.citekey+'++';//+data.Reference;
          //  } }]
	
	preparePage("links_table","php/getLinks.php");
    requestLinks(php_link);
});