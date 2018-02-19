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
	database_records = obj;
	//console.log(database_records);
	redrawGUIfromObject(database_records);
	updateGrid(obj);
}


function updateGrid(links){


	var links2 = [];
	for(i in links){
		links2.push(Object.values(links[i]));
	}

	if(links2.length>0){

		// TODO: go through each row and check that the pk
		// isn't already included in the table
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
		var newNode = {
			id:pk,
			label:varname
			};
		network_nodes.add(newNode);
	}
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
		$.inArray(lastSelectedNodes[0], selectedNodes)>=0 &
		$.inArray(lastSelectedNodes[1], selectedNodes)>=0){
		// ... then request the links between them.
		var var1 = lastSelectedNodes[0];
		var var2 = lastSelectedNodes[1];
		requestRecord("php/getPaths.php","var1="+var1+"&var2="+var2,'links');
	}

}

