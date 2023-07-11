// Documents

dtableConfig =  {
		ordering: true,
        lengthChange: false,
        order: [[ 0, "asc" ]],
        //scrollY: '50vh',
        //scrollCollapse: true,
        pageLength: 10,

        columns: [
        	// Combine the reference and the citekey to make a link
        	{ data: null, render: function(data,type,row){
                var uriName = encodeURI(data[0]);
                return('<a href="author.html?author='+uriName+'">'+data[0]+'</a>');
        	}},
        	{data: 1}
        	]
 	 	};


$(document).ready(function(){

    $("#header").load("header.html", function(){
        $("#AuthorsHREF").addClass("active");
    }); 

    
	preparePage("authors_table","php/getAuthors.php");
    requestLinks(php_link);
});