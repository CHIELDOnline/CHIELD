// User makes requests to the server for extra variables
// The server responds with a new set of total links 
//  (it can't know which links to return without knowing which variables to connect)
// So, each call returns the whole network.
// Nodes can be removed without a call to the server.
// And we need to keep track of which edges a user has excluded.
//  (so that they're not added back in on the next call)
//  Edges should be removed from the exclusion list if the variable has been removed.


var displayDatatable = true; // set to false below

var existingVariables = [];
var existingVariables_pk = [];

var existingDocuments = [];
var existingDocuments_pk = [];

dtableConfig =  {
		ordering: true,
        lengthChange: false,
        order: [[7, "asc"], [ 0, "asc" ], [2, "asc"]],
        //scrollY: "300px",
        //scrollCollapse: true,
        paging: true,
        pageLength: 20,
        columns: [
        		{ data: 0, visible:false},
        		{ data: 1},
        		{ data: 2},
        		{ data: 3},
        		{ data: 4},
        		{ data: 5},
        		{ data: 6},
    			{ data: null, render: function(data,type,row){
        			return '<a href="document.html?key=' + data[8] +'" target="_blank">'+data[7] + '</a>';
        		}},
        		{ data: 8, visible:false},
        		{ data: 9, visible:false}
 	 		]
 	 	};

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


function recieveVariablesFromServer(response){
	// Decode json format from server
	var varObj = JSON.parse(response);
	// load variable names into existingVariables dropdown
	existingVariables = [];
	existingVariables_pk = [];
	for(var i = 0; i < varObj.length;++i){
		existingVariables.push(varObj[i].name);
		existingVariables_pk.push(varObj[i].pk);
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

$(document).ready(function(){
	// Add the header
	// TODO: Minimise or autohide this?
	$("#header").load("header.html", function(){
		$("#ExploreHREF").addClass("active");
	}); 

	// Request full list of variables to suggest to user
	requestVariablesFromServer("php/getVariables.php");
	// Request list of documents
	requestRecord("php/getDocsForHome.php","",'docs');

	// Prepare links table layout
	preparePage("links_table","php/getLinksForExplore.php");
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

	// Hide the table
	toggleTableDisplay();
	// Set the button action to show/hide the table
	$("#toggleTableButton").click(toggleTableDisplay);
	$("#links_table").hide();


	// If user clicks +, show list of variables to add
	$("#addVariable").click(function(){
		$("#searchVariablesToAdd").show();
		$("#searchVariablesToAdd").focus();
	});
	// Set up searchable list of variables
	// If user presses enter, add variable to network
	$("#searchVariablesToAdd").keypress(function(event) {
	  	if ( event.key == "Enter" || event.which==13 ) {
	  		addVar($("#searchVariablesToAdd").val());
	  		$("#searchVariablesToAdd").val("");
	  		$("#searchVariablesToAdd").hide();
		} else{
			// If user presses escape, hide the search bar
			if ( event.key == "Escape" || event.which==27 ) {
				$("#searchVariablesToAdd").val("");
				$("#searchVariablesToAdd").hide();
			}
		}
	  });
	$("#searchVariablesToAdd").hide();
	$("#searchVariablesToAdd").blur(function(){
		$("#searchVariablesToAdd").hide();
	});
	$("#searchVariablesToAdd").autocomplete({
			source:filterWithMaxLengthLimit,
			"onSelect": addVar
		});

	$("#removeVariable").click(removeVariableViaNetwork);

	$("#expandVariable").click(expandVariable);
	$("#findPaths").click(findPaths);
	$("#fit").click(function(){
		network.fit()
	})
	$("#bulkOut").click(bulkOut);

	/*$("#viewAll").click(function(){
		showLoader();
		requestRecord(php_link,"keylist=ALL",'links');
	})*/

	// Add links by document ---------//
	$("#addDoc").click(function(){
		$("#searchDocsToAdd").show();
		$("#searchDocsToAdd").focus();
	});
	$("#searchDocsToAdd").hide();
	$("#searchDocsToAdd").blur(function(){
		$("#searchDocsToAdd").hide();
	});
	$("#searchDocsToAdd").val("");
	$("#searchDocsToAdd").keypress(function(event) {
	  	if ( event.key == "Enter" || event.which==13 ) {
	  		addDoc($("#searchDocsToAdd").val());
	  		$("#searchDocsToAdd").val("");
	  		$("#searchDocsToAdd").hide();
		} else{
			// If user presses escape, hide the search bar
			if ( event.key == "Escape" || event.which==27 ) {
				$("#searchDocsToAdd").val("");
				$("#searchDocsToAdd").hide();
			}
		}
	  });
	$( "#searchDocsToAdd" ).autocomplete({
      		source: filterDocs,
      		onSelect: addDoc
    	});


	hideLegend();

	// Allow manual changes to options

	$("#networkSettingsButton").click(toggleOptions);

	network_options.configure = network_options_configure;
	network_options.interaction.navigationButtons= false;
	network.setOptions(network_options);

	$(".vis-configuration-wrapper").hide();


	hideLoader();

	var edgesToLoad = getUrlParameter("links");
	if(edgesToLoad!==undefined && edgesToLoad!=""){
		showLoader();
		// This calls the php script, and is handled by GUI_for_explore.js:updateRecord()
		requestRecord("php/getLinksForExploreByPk.php","keylist="+edgesToLoad,'links');
	}

});