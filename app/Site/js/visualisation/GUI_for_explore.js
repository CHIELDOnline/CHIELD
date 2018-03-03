var database_records = null;

var currently_selected_node = null;
var currently_selected_edge = null;
var current_selection_mode = "start";

var lastSelectedNodes = [];

var currently_clicked_location = null;

var current_relation_type = ">";

var network_last_click_time = 0;

var network_container = null;



function network_on_click (params) {
	console.log("CLICK");
	console.log(params);
	// // User clicked on node - select it
	if(params["nodes"].length > 0){
	// 	user_clicked_node(params["nodes"][0]);
		console.log(lastSelectedNodes);
	   if(lastSelectedNodes.length >=2){
	   	lastSelectedNodes.shift();
	   }
	   // Find the new node
	   for(var i=0;i<params["nodes"].length;++i){
	   	 if($.inArray(params["nodes"][i], lastSelectedNodes)==-1){
			lastSelectedNodes.push(params["nodes"][i]);
	   	 }
	   }
	} else{
	// 	// User didn't click - unselect
	 	lastSelectedNodes = [];
	}

}

function updateRecord(response, type){

	var obj = JSON.parse(response);
	// TODO: test if obj is correctly parsed.

	if(database_records===null){
		database_records = [];
	}
	// In explore, this can recieve multiple updates,
	// So need to check we're not adding stuff twice
	var newRecords = false;
	var currentIds = network_edges.getIds();
	for(var i=0; i<obj.length;++i){
		if($.inArray(obj[i].pk,currentIds)==-1){
			database_records.push(obj[i]);
			newRecords = true;
		}
	}

	if(newRecords){
		//console.log(database_records);
		network_nodes.clear();
		network_edges.clear();
		redrawGUIfromObject(database_records);
		updateGrid(database_records);
	} else{
		alert("No new links found");
	}
}


function updateGrid(links){

	// Go through each row and check that the pk
	// isn't already included in the table

	var links2 = [];
	for(i in links){
		links2.push(Object.values(links[i]));
	}

	if(links2.length>0){
		dtable.rows.add(links2);
		
		// Redraw the table to show the new data
		dtable.draw();
		$("#links_table").show();
	} else{
		alert("No causal links found");
		$("#links_table").hide();
	}
}


function expandVariable() {

	var selectedNodes = network.getSelectedNodes();
	var keylist = selectedNodes.join(",");
	requestRecord(php_link,"keylist="+keylist,'links');
}

function addVar(varname){
	$("#searchVariablesToAdd").hide();
	var pk = findVariablePK(varname);
	if(pk!=null){
		// Check it's not already displayed
		if($.inArray(pk,network_nodes.getIds())==-1){
			// Add node
			var newNode = {
				id:pk,
				label:varname
				};
			network_nodes.add(newNode);
		}
	}
}

function removeVar(pk){

	// TODO: TEST
	network_nodes.remove(pk);
	for(i =0;i<network_edges.length;++i){
		var edge = network_edges.get()[i]
		if(edge.from==pk || edge.to==pk){
			network_edges.remove(edge.id);
		}
	}
	network.redraw();
	var varName = findVariableName(pk);
	removeVarFromDataTable(varname);

}

function removeVarFromDataTable(varname){
  table.rows().nodes().each(function(a,b) {
    if($(a).children().eq(0).text() == varname){
       table.rows(a).remove();
     }
  } );
  table.rows().invalidate();
  table.draw();
}

function findPaths(){
	var selectedNodes = network.getSelectedNodes();
	// selectedNodes returns the nodes that are currently selected,
	// but not the order that the user selected them in
	// so we keep track of order in lastSelectedNodes

	// If we've only selected 2 nodes
	// And there are 2 nodes in lastSelectedNodes
	// And the nodes in lastSelectedNodes are in the set of selected nodes ...
	if(selectedNodes.length==2 & 
		lastSelectedNodes.length==2 & 
		($.inArray(lastSelectedNodes[0], selectedNodes)>=0) &
		($.inArray(lastSelectedNodes[1], selectedNodes)>=0)){
		// ... then request the links between them.
		var var1 = lastSelectedNodes[0];
		var var2 = lastSelectedNodes[1];
		requestRecord("php/getPaths.php","var1="+var1+"&var2="+var2,'links');
	}

}

