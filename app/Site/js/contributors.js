// Documents

dtableConfig =  {
		ordering: true,
        lengthChange: false,
        order: [[ 1, "desc" ]],
        //scrollY: '50vh',
        //scrollCollapse: true,
        pageLength: 8,

        columns: [
        	// Combine the reference and the citekey to make a link
        	{ data: null, render: function(data,type,row){
        		return '<a href="https://github.com/' + data[0] +'">'+data[1] + '</a>';
        	}},
        	{data: 2}
        	]
 	 	};


$(document).ready(function(){
	preparePage("contributors_table","php/getContributors.php");
    requestLinks(php_link);
});