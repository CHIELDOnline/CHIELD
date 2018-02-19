
var network_nodes = null;
var network_edges = null;
var network = null;

var currently_selected_node = null;
var currently_selected_edge = null;
var current_selection_mode = "start";

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




function addVar(){
	var selectedVar = document.getElementById("searchVariablesToAdd").value.trim();
	if(selectedVar.length>0){
		addVarByVarName(selectedVar);
	}
}

function addVar_dynamic(){
	var selectedVar = document.getElementById("searchVariablesToAdd_dynamic").value.trim();
	$("#searchVariablesToAdd_dynamic").css("display","none");
	$("#searchVariablesToAdd_dynamic").val("");

	var setx = currently_clicked_location.x;
	var sety = currently_clicked_location.y;
	currently_clicked_location = {x:null, y:null};
	if(selectedVar.length>0){
		addVarByVarName(selectedVar, setx, sety);
	}
}

function addVarByVarName(selectedVar,x=null,y=null){
	console.log(selectedVar);
	newNode = {
		id:selectedVar,
		label:selectedVar
		};
	if(x!=null){
		newNode.x = x
	}
	if(y!=null){
		newNode.y = y
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

	if((!edgeExists) && (selectedVar1!=selectedVar2) && (selectedVar1!="") && selectedVar2!=""){
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
  network.on("doubleClick", network_on_double_click);

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

  var dynamicSearchVariables = $("#searchVariablesToAdd_dynamic");
  $( "#searchVariablesToAdd_dynamic" ).keypress(function(event) {
  	if ( event.key == "Enter" || event.which==13 ) {
  		addVar_dynamic();
  		$("#searchVariablesToAdd_dynamic").hide();
	} else{
		if ( event.key == "Escape" || event.which==27 ) {
			$("#searchVariablesToAdd_dynamic").hide();
		}
	}
  });

}

function network_on_click (params) {
	
	// check that we're not recieving double-click
	var current_time = new Date().getTime();
	var delay = current_time -network_last_click_time;
	network_last_click_time = current_time;
	if(delay >500){
		// User clicked on node - select it
		if(params["nodes"].length > 0){
			user_clicked_node(params["nodes"][0]);
		} else{
			// User didn't click - unselect
			currently_selected_node = null;
		}
	}

}

function network_on_double_click(params){
	console.log(params);
	
	// Check we're not double-clicking on a node or edge
	if((params["nodes"].length == 0) && (params["edges"].length == 0)){
		currently_clicked_location = params.pointer.canvas;

		var setx = $("#mynetwork").position().left + params.pointer.DOM.x;
		var sety = $("#mynetwork").position().top + params.pointer.DOM.y

		$("#searchVariablesToAdd_dynamic").css("top",sety);
		$("#searchVariablesToAdd_dynamic").css("left",setx);
		$("#searchVariablesToAdd_dynamic").show();
		$("#searchVariablesToAdd_dynamic").focus();
	}

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

function networkUpdateNodeName(oldNodeName, newNodeName){
	// we can't rely on the id being the original id, 
	// so need to search nodes
	// Find node with the right label
	// use the id of that node to update the label
	console.log("Update node name "+oldNodeName + " / " +newNodeName);
	for(var i=0; i<network_nodes.length;++i){
		var thisNode = network_nodes.get()[i];
		if(thisNode.label==oldNodeName){
			console.log( thisNode.id);
			network_nodes.update({id: thisNode.id, label: newNodeName});
			break;
		}
	}
}

function netwrokUpdateEdgeType(Var1, Var2, Relation){

}

function getEdgeSettings(Var1, Var2, Relation){
	// standard setting: ">"

	var newEdge = {
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

function redrawGUIfromGrid(){
	network_nodes = new vis.DataSet([]);
  	network_edges = new vis.DataSet([]);

  	var nodes = [];

	for(var row=0; row < $('#jsGrid').data().JSGrid.data.length; ++row){
		
		var this_var1 = $('#jsGrid').data().JSGrid.data[row].Var1;
		var this_var2 = $('#jsGrid').data().JSGrid.data[row].Var2;
		var this_relation = $('#jsGrid').data().JSGrid.data[row].Relation;
		console.log(this_var1 + " " + this_var2);
		if($.inArray(this_var1,nodes)==-1){
			nodes.push(this_var1)
		}
		if($.inArray(this_var2,nodes)==-1){
			nodes.push(this_var2)
		}

		var newEdge = getEdgeSettings(this_var1,this_var2,this_relation);
		console.log(newEdge);
		network_edges.add(newEdge);
	}

	for(var i=0; i < nodes.length; ++i){
		var newNode = {
			id:nodes[i],
			label:nodes[i]
		}
		network_nodes.add(newNode);
	}

	// redraw network
	initialiseNetwork();

}

