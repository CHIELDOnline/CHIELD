
var network_nodes, network_edges, network;

var currently_selected_node = null;
var currently_selected_edge = null;
var current_selection_mode = "start";

var current_relation_type = ">";

var network_container = null;
var network_options = {
	//layout:{
	//	hierarchical: true
	//  }
	interaction: {
 		//zoomView:false, // prevents user from zooming
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
			updateInterval: 25
		}
		}
};




function addVar(){
	var selectedVar = document.getElementById("searchVariablesToAdd").value.trim();
	if(selectedVar.length>0){
		addVarByVarName(selectedVar);
	}
}

function addVarByVarName(selectedVar){
	console.log(selectedVar);
	newNode = {
		id:selectedVar,
		label:selectedVar
		}
	// If not already in currently_added_nodes
	if(network_nodes.get(selectedVar)==null){
		console.log("Add node to network");
		console.log(newNode);
		network_nodes.add(newNode);
		//network.redraw();
		network.fit(animation=true)
	}
}

function addEdgeByVarName(selectedVar1, selectedVar2, causal_relation=">"){
	console.log("Add edge"+selectedVar1+" "+causal_relation+" "+selectedVar2);
	var newEdge = {
		"from": selectedVar1,
    	"to": selectedVar2,
    	"arrows": "to",
    	"color": "black",
    	"causal_relation":causal_relation
	};

	// TODO: warn if adding edge back the other way?
	var edgeExists = false;

	for(var i=0; i<network_edges.length;++i){
		var e = network_edges.get(network_edges.getIds[i]);
		if(e.from==selectedVar1 && e.to==selectedVar2){
			edgeExists = true;
		}
	}
	console.log(edgeExists);
	console.log(selectedVar1!=selectedVar2);
	console.log((!edgeExists) && selectedVar1!=selectedVar2)

	if((!edgeExists) && (selectedVar1!=selectedVar2)){
		console.log("HERE");
		network_edges.add(newEdge);
		network.fit();

		// add data to grid
		addEdgeToGrid(selectedVar1,causal_relation,selectedVar2);		

	} else{
		currently_selected_node = null;
	}
}

function addEdgeToGrid(selectedVar1,causal_relation,selectedVar2){


	var rowData = {
		Var1: selectedVar1,
		Relation: causal_relation,
		Var2: selectedVar2
	};

	var fieldNames = [];
	var fields = $("#jsGrid").jsGrid().data().JSGrid.fields;
	for(var i=3;i<fields.length;++i){
		var fieldName = fields[i].name;
		rowData[fieldName] = "";
	}
	
	

	$("#jsGrid").jsGrid("insertItem", rowData).done(function() {
   			 console.log("insertion completed");
		});

}

function delNetworkElement(){
	var nodesToDel = network.getSelectedNodes();
	var edgesToDel = network.getSelectedEdges();
	for(var i=0; i< nodesToDel.length; ++i){
		network_nodes.remove(nodesToDel[i]);
	}
	for(var i=0; i< edgesToDel.length; ++i){
		network_edges.remove(edgesToDel[i])
	}
}

function initialiseNetwork(){
  // create empty network
  network_nodes = new vis.DataSet([]);
  network_edges = new vis.DataSet([]);

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
	console.log("NETWORK CLICK");
	console.log(params);
	params.event = "[original event]";

	if(params["nodes"].length > 0){
		user_clicked_node(params["nodes"][0]);
	} else{
		currently_selected_node = null;
	}

	// var text = "";
	// if(params["edges"].length > 0){
	// 	for(var i=0; i< params["edges"].length; ++i){
	// 		text += edges.get(params["edges"][i]).hypothesis  + "<br />"|| null;
	// 	}
	// } 
	// console.log(text);
}

function user_clicked_node(node){
	console.log("CLICKED NODE");
	console.log(node);

	if(current_selection_mode=="start"){
		currently_selected_node = node;
		current_selection_mode = "end"
	} else{
		if(current_selection_mode=="end"){
			addEdgeByVarName(currently_selected_node, node, current_relation_type);
			current_selection_mode = "start"
			currently_selected_node= null;
		}
	}
	

}

