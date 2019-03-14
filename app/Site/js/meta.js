// User makes requests to the server for extra variables
// The server responds with a new set of total links 
//  (it can't know which links to return without knowing which variables to connect)
// So, each call returns the whole network.
// Nodes can be removed without a call to the server.
// And we need to keep track of which edges a user has excluded.
//  (so that they're not added back in on the next call)
//  Edges should be removed from the exclusion list if the variable has been removed.


var displayDatatable = true; // set to false below


dtableConfig =  {
		ordering: true,
		order: [[ 2, "desc" ]],
        lengthChange: false,
        //scrollY: "300px",
        //scrollCollapse: true,
        paging: true,
        pageLength: 20
 	 	};

var numLinksThreshold = 1;

function toggleTableDisplay(){

	displayDatatable = !displayDatatable;
	if(displayDatatable){
		$("#links_table").show();
		$("#toggleTableButton").html('<i class="fas fa-chevron-down"></i>');
		// TODO: Should probably change css style, not just property
		document.getElementById("links").style.top = "50%";
	} else{
		$("#links_table").hide();
		$("#toggleTableButton").html('<i class="fas fa-chevron-up"></i>');
		document.getElementById("links").style.top = "98%";
	}
}


function filterWithMaxLengthLimit(request, response) {
		// return top 8 hits
        var results = $.ui.autocomplete.filter(existingVariables, request.term);
        response(results.slice(0, 8));
    }
function filterDocs(request, response) {
		// return top 4 hits
    	var results = $.ui.autocomplete.filter(existingDocuments, request.term);
    	response(results.slice(0, 4));
    }


function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1));
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

function updateRecord(response, type){
	if(type=="metalinks"){
		var obj = JSON.parse(response);
		//console.log(obj);
		buildMetaNetwork(obj);
		
		var links2 = ObjectToArrayOfArrays(obj);
		var tmpDtable= $("#links_table").dataTable();
		tmpDtable.fnClearTable();
		tmpDtable.fnAddData(links2);
		hideLoader();
	}
}

function buildMetaNetwork(links){
	// receives object

	var nodeName1 = "first_document_links.bibref";
	var nodeLabel1 = "doc1.citation";
	var nodeName2 = "second_document_links.bibref";
	var nodeLabel2 = "doc2.citation";

	var nodes = [];
	var nodeList = [];
	for(var i=0;i<links.length;++i){
		link = links[i];
		if(link["numberOfLinks"]>=numLinksThreshold){
			if($.inArray(link[nodeName1],nodes)==-1){
				newNode = {
					id:link[nodeName1],
					label:reduceCitationLabel(link[nodeLabel1])
					};
				//network_nodes.add(newNode);
				nodeList.push(newNode);
				nodes.push(link[nodeName1]);
			}
			if($.inArray(link[nodeName2],nodes)==-1){
				newNode = {
					id:link[nodeName2],
					label:reduceCitationLabel(link[nodeLabel2])
					};
				//network_nodes.add(newNode);
				nodeList.push(newNode);
				nodes.push(link[nodeName2]);
			}
		}
	}

	var edgeList = [];
	for(var i=0;i<links.length;++i){
		link = links[i];
		if(link["numberOfLinks"]>=numLinksThreshold){
			var newEdge = {
			"from": link[nodeName1],
	    	"to": link[nodeName2],
	    	"color": {color:"black"},
	    	"width":link["numberOfLinks"]
			};
			//network_edges.add(newEdge);
			edgeList.push(newEdge);
		}
	}
	network_nodes.update(nodeList);
	network_edges.update(edgeList);
}

function reduceCitationLabel(citation){
	var authorNames = citation.split(",");
	if(authorNames.length>2){
		return([authorNames[0],
			   ",",
			   authorNames[1],
			   " et al. ",
			   citation.substr(citation.length-6) // year
			   ].join(""))
	}
	return(citation);
}


$(document).ready(function(){

	showLoader();
	

	// Add the header
	// TODO: Minimise or autohide this?
	$("#header").load("header.html", function(){
		$("#ExploreHREF").addClass("active");
	}); 

	// Prepare links table layout
	preparePage("links_table","php/getConnectionsBetweenDocs.php");
	dtable = $('#'+tableId).DataTable(dtableConfig);
	

	// TODO: This is duplicated code
	// Add column searching 
    dtable.columns().every( function () {
        var that = this;
 		if(that.visible()){
	        $( 'input', this.footer() ).on( 'keyup change', function () {
	            if ( that.search() !== this.value.trim() ) {
	                that
	                    .search( this.value.trim() )
	                    .draw();
	            }
	        } );
    	}
    } );
    $('#'+tableId+' tfoot tr').appendTo('#'+tableId+' thead');
    document.getElementById(tableId+'_filter').style.display = "none";
	

	// Initialise the visual graph component
	convert_pks_to_string_ids = false;
	initialiseNetwork();
	network.on("click", network_on_click);

	$("#removeVariable").click(removeVariableViaNetwork);

	// Hide the table
	toggleTableDisplay();
	// Set the button action to show/hide the table
	$("#toggleTableButton").click(toggleTableDisplay);
	$("#links_table").hide();


	hideLegend();

	// Allow manual changes to options

	$("#networkSettingsButton").click(toggleOptions);

	network_options.configure = network_options_configure;
	network_options.interaction.navigationButtons= false;

	network_options.nodes.color = {
		background: "#d3e8ff", //pale blue
		border: "#006de7", // dark blue
		highlight: { border: "#006de7", background: "#d3e8ff" },
		hover: { border: "#006de7", background: "#d3e8ff" }
	};

	network.setOptions(network_options);

	$(".vis-configuration-wrapper").hide();

	requestRecord("php/getConnectionsBetweenDocs.php","",'metalinks');
	

});


function showLoader(){
	$(".loader").show();
}

function hideLoader(){
	$(".loader").hide();
}

function network_on_click(){

}

function showLegend(){
	$("#legend").show();
	$("#legendButton").hide();
}

function hideLegend(){
	$("#legend").hide();
	$("#legendButton").show();
}

function toggleOptions(){

	optionsVisible = !optionsVisible;
	//var configWrapper = document.getElementsByClassName('vis-configuration-wrapper')[0];
	//var nsettings = document.getElementById("networkSettings");
	//nsettings.insertBefore(configWrapper,null);
	if(optionsVisible){
		$("#networkSettings").show()
		$(".vis-configuration-wrapper").show()
		hideLegend();
		$("#legendButton").hide();
	} else{
		$("#networkSettings").hide()
		$(".vis-configuration-wrapper").hide()
		$("#legendButton").show();
	}

}