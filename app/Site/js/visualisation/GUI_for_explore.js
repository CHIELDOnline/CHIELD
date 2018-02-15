var database_records = null;

var network_nodes = null;
var network_edges = null;
var network = null;

var currently_selected_node = null;
var currently_selected_edge = null;
var current_selection_mode = "start";

var lastSelectedNodes = [];

var currently_clicked_location = null;

var current_relation_type = ">";

var network_last_click_time = 0;

var network_container = null;
var network_options = {
	//layout:{
	//	hierarchical: true
	//  }
	interaction: {
 		//zoomView:false, // prevents user from zooming
 		multiselect: true
 	},
  	edges: {
    	smooth: false
	},
		physics: {
// 			forceAtlas2Based: {
// 				gravitationalConstant: -26,
// 				centralGravity: 0.005,
// 				springLength: 230,
// 				springConstant: 0.18,
// 				avoidOverlap: 1.5
// 			},
// 			maxVelocity: 146,
// 			solver: 'forceAtlas2Based',
// 			timestep: 0.35,
		stabilization: {
			enabled: true,
			iterations: 1000,
			//updateInterval: 25
		}
		}
};


function getEdgeSettings(edge_id, Var1, Var2, Relation){
	// standard setting: ">"

	var newEdge = {
			id: edge_id,
			from: Var1,
	    	to: Var2,
	    	arrows: {
	    		to: {
	    			enabled:true,
	    			type: "arrow"
	    		},
	    		from: {
	    			enabled:false,
	    			type: "arrow"
	    		}
	    	},
	    	color: "black",
	    	causal_relation: Relation
		};

	if(Relation=="<"){
		newEdge.arrows.to.enabled = false;
		newEdge.arrows.from.enabled  = true;
	}
	if(Relation==">>"){
		newEdge.color = "red";
	}
	if(Relation=="<=>"){
		//newEdge.arrows = "to;from";
		newEdge.arrows.from.enabled  = true;
	}
	if(Relation=="~="){
		newEdge.arrows.to["type"] = "circle";
	}
	return(newEdge);
}



function initialiseNetwork(){
  if(network_nodes==null){
  	// create empty network
  	network_nodes = new vis.DataSet([]);
  	network_edges = new vis.DataSet([]);
  }

  var data = {
	nodes: network_nodes,
	edges: network_edges
  };

  network_container = document.getElementById('mynetwork')

  network = new vis.Network(network_container, data, network_options);
  network.on("click", network_on_click);

  // After initial layout, turn off the physics for nodes so that 
  // the user can drag things to custom places
  network.on("stabilizationIterationsDone", function () {
  		console.log("stabilization finished");
        network.setOptions({
//			nodes: {physics: false},
            physics: {
            	enabled: false,
      //      	stabilization: {
    //        		onlyDynamicEdges: true
  //          	}
            }
        });
    });


}

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

function redrawGUIfromObject(obj){
	// obj is a list of edges
  	console.log(obj);
  	var nodes = [];

  	// For each edge
	for(var row=0; row < obj.length; ++row){
		// Get info
		var this_var1 = obj[row].variable1;	
		var this_var2 = obj[row].variable2;
		var this_relation = obj[row].relation;
		var this_edge_id = obj[row].pk;
		
		// Add the variables to the list of nodes
		if($.inArray(this_var1,nodes)==-1){
			nodes.push(this_var1)
		}
		if($.inArray(this_var2,nodes)==-1){
			nodes.push(this_var2)
		}
		
		// If the edge isn't yet part of the network:
		if($.inArray(this_edge_id,network_edges.getIds())==-1){
			// create a new edge
			var newEdge = getEdgeSettings(
			    this_edge_id,
				findVariablePK(this_var1),
				findVariablePK(this_var2),
				this_relation);
			// add it to the network
			network_edges.add(newEdge);
		}
	}
	
	// For each node
	for(var i=0; i < nodes.length; ++i){
		var npk = findVariablePK(nodes[i]);
		// If the node is not yet in the network:
		if($.inArray(npk,network_nodes.getIds())==-1){
			// create a new node
			var newNode = {
				id:npk,
				label:nodes[i]
			}
			// add it to the network
			network_nodes.add(newNode);
		}
	}

	// redraw network
	//network.redraw();
	network.fit();

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

