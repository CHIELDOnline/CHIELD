// Documents

dtableConfig =  {
		ordering: true,
        lengthChange: false,
        order: [[ 1, "desc" ], [0, "asc"]],
        //scrollY: '50vh',
        //scrollCollapse: true,
        pageLength: 8,
        columns: [
        	{ data: 0}, // authors
        	{ data: 1}, // year
        	// Combine the title and the citekey to make a link
        	{ data: null, render: function(data,type,row){
        		return '<a href="document.html?key=' + data[3] +'">'+data[2] + '</a>';
        	}},
        	{ data: null, render: function(data,type,row){
        		var usernames = data[4].split(";");
        		var realnames = data[5].split(";");
        		var ret = [];
        		for(var i=0;i<usernames.length; ++i){
                    if(usernames[i]!=null && usernames[i].length>1){
                        if(usernames[i].startsWith("http")){
                            ret.push('<a href="' + usernames[i] +'">'+realnames[i] + '</a>');
                        } else{
                            ret.push('<a href="https://github.com/' + usernames[i] +'">'+realnames[i] + '</a>');
                        }
                    } else{
                        ret.push(realnames[i]);
                    }
        		}
        		return ret.join(", ");
        	}},
        	]
 	 	};


$(document).ready(function(){

	$("#header").load("header.html", function(){
		$("#DocumentsHREF").addClass("active");
	}); 

	preparePage("documents_table","php/getDocs.php");
    requestLinks(php_link);

});