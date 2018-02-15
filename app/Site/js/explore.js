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

dtableConfig =  {
		ordering: true,
        lengthChange: false,
        order: [[ 0, "asc" ], [2, "asc"]],
        //scrollY: "300px",
        //scrollCollapse: true,
        paging: false,
        //pageLength: 8,
        columns: [
        		{ data: 0, visible:false},
        		{ data: 1},
        		{ data: 2},
        		{ data: 3},
        		{ data: 4},
        		{ data: 5},
        		{ data: 6},
    			{ data: null, render: function(data,type,row){
        			return '<a href="document.html?key=' + data[8] +'">'+data[7] + '</a>';
        		}},
        		{ data: 8, visible:false}
 	 		]
 	 	};

function toggleTableDisplay(){

	displayDatatable = !displayDatatable;
	if(displayDatatable){
		$("#links_table").show();
		$("#toggleTableButton").html('<span class="glyphicon glyphicon-chevron-down"></span>');
		document.getElementById("links").style.top = "70%";
	} else{
		$("#links_table").hide();
		$("#toggleTableButton").html('<span class="glyphicon glyphicon-chevron-up"></span>');
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

function findVariablePK(varname){
	var foundVar = false;
		for(var i=0; i<existingVariables.length;++i){
			if(existingVariables[i]==varname){
				// TODO: check if network_nodes contains variable already
				// Add pk to network_nodes
				return(existingVariables_pk[i]);
			}
		}
	return(null);
}




$(document).ready(function(){
	// Add the header
	// TODO: Minimise or autohide this?
	$("#header").load("header.html", function(){
		$("#AddDataHREF").addClass("active");
	}); 

	// Request full list of variables to suggest to user
	requestVariablesFromServer("php/getVariables");

	// Prepare links table layout
	preparePage("links_table","php/getLinksForExplore.php");
	dtable = $('#'+tableId).DataTable(dtableConfig);
	

	// Add column searching 
    dtable.columns().every( function () {
        var that = this;
 
        $( 'input', this.footer() ).on( 'keyup change', function () {
            if ( that.search() !== this.value ) {
                that
                    .search( this.value )
                    .draw();
            }
        } );
    } );
    $('#'+tableId+' tfoot tr').appendTo('#'+tableId+' thead');
    document.getElementById(tableId+'_filter').style.display = "none";
	

	// Initialise the visual graph component
	initialiseNetwork();

	// Hide the table
	toggleTableDisplay();
	// Set the button action to show/hide the table
	$("#toggleTableButton").click(toggleTableDisplay);
	$("#links_table").hide();

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
	// If user clicks +, show list of variables to add
	$("#addVariable").click(function(){
		$("#searchVariablesToAdd").show();
		$("#searchVariablesToAdd").focus();
	});
	$("#searchVariablesToAdd").hide();

	$("#searchVariablesToAdd").autocomplete({
			source:filterWithMaxLengthLimit,
			"onSelect": addVar
		});

	$("#explandVariable").click(expandVariable);
	$("#findPaths").click(findPaths);


});