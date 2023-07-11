// Topic page

tableId = "variables_table";
dtableConfig =  {
		ordering: true,
        lengthChange: false,
        order: [[ 1, "desc" ]],
        columns: [
        	// Combine the reference and the citekey to make a link
        	{ data: null, render: function(data,type,row){
        		return '<a href="variable.html?key=' + data[1] +'">'+ data[0] + '</a>';
        	}},
            {data:2}
        	]
        };


dtableConfig_links = {
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

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

function updateRecord(response,type){
    console.log(response);
    if(type=='var'){
        updateLinksTable(response);
    }
    if(type=="links"){
        //updateLinksTable(response);
        redrawGUIfromObject(JSON.parse(response)); //should pass object
        updateLinksTable2(response,"links_table",dtableConfig_links);
        $(".loader").hide();
    }
}

function updateLinksTable2(text,tableIdX,dtableConfigX){

    var links = JSON.parse(text);
    console.log("LINKS");
    // DataTable wants an array of arrays, so convert:
    var links2 = ObjectToArrayOfArrays(links);
    links2 = editData(links2);
    console.log(links2);
    var dtableConfigX = $.extend({data:links2},dtableConfigX);
    
    var dtableX = $('#'+tableIdX).DataTable(dtableConfigX);
    
    // Add column searching
    dtableX.columns().every( function () {
        var that = this;
        if(that.visible()){
            $( 'input', this.footer() ).on( 'keyup change', function () {
                if ( that.search() !== this.value ) {
                    that
                        .search( this.value )
                        .draw();
                }
            } );
        }
    } );
    $('#'+tableIdX+' tfoot tr').appendTo('#'+tableIdX+' thead');
    //document.getElementById(tableIdX+'_filter').style.display = "none";
}


$(document).ready(function(){

	$("#header").load("header.html", function(){
		$("#TopicsHREF").addClass("active");
	}); 

    initialiseNetwork();

    var key = getUrlParameter('topic');
    console.log(key);
    if(key!=''){
        $("#TopicTitle").html("Topic: "+key);
        // Note we're adding the wildcard at this point
        preparePage("variables_table","");
        requestRecord("php/getVariablesForTopic.php", "key="+key,'var');
        

        requestRecord("php/getLinksForTopic.php", "key="+key,'links');
        setupColumnSearching("links_table");

    }
});