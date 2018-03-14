
var currently_selected_node = null;
var currently_selected_edge = null;
var current_selection_mode = "start";

var currently_clicked_location = null;

var current_relation_type = ">";

var network_last_click_time = 0;

var network_container = null;

var drawLinksWithClicks = true;


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
		network.fit();
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

	var edgeids = network_edges.getIds();
	for(var i=0; i<network_edges.length;++i){
		var e = network_edges.get(edgeids[i]);
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

	}
	currently_selected_node = null;
	current_selection_mode = "start";
	network.selectNodes([]);
	network.selectEdges([]);
	
}

function delNetworkElement(){
	var nodesToDel = network.getSelectedNodes();
	var edgesToDel = network.getSelectedEdges();
	for(var i=0; i< nodesToDel.length; ++i){
		console.log(nodesToDel);
	}
	for(var i=0; i< edgesToDel.length; ++i){
		console.log(edgesToDel);
	}
	// TODO: Delete instances from the grid
}

function network_on_click (params) {
	
	// check that we're not recieving double-click
	var current_time = new Date().getTime();
	var delay = current_time -network_last_click_time;
	network_last_click_time = current_time;
	console.log(delay);
	if(delay >500){
		// User clicked on node - select it
		if(params["nodes"].length > 0){
			user_clicked_node(params["nodes"][0]);
		} else{
			// User didn't click - unselect
			currently_selected_node = null;
			current_selection_mode = "start";
		}
	}

}

function network_on_double_click(params){
	console.log(params);
	
	// Check we're not double-clicking on a node or edge
	if((params["nodes"].length == 0) && (params["edges"].length == 0)){

		currently_selected_node = null;
		current_selection_mode = "start";
		network.selectNodes([]);
		network.selectEdges([]);

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
			if(drawLinksWithClicks){
				addEdgeByVarName(currently_selected_node, node, current_relation_type);
			}
			current_selection_mode = "start";
			currently_selected_node= null;
		}
	}
	

}


function toggleDrawLinks(){
	console.log(drawLinksWithClicks);
	drawLinksWithClicks = !drawLinksWithClicks;
	console.log(drawLinksWithClicks);
	if(drawLinksWithClicks){
		$('#drawLinks').removeClass("btn-secondary").addClass("btn-primary");
	} else{
		$('#drawLinks').removeClass("btn-primary").addClass("btn-secondary");
	}
	if(drawLinksWithClicks){
		currently_selected_node = null;
		current_selection_mode = "start";
		// remove selections
		network.selectNodes([]);
		network.selectEdges([]);
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

function redrawGUIfromGrid(){

	// find unconnected nodes in the GUI
	// (these won't appear yet in the grid)
	// so we can add them back later
	var unconnectedNodes = findUnconnectedNodes();

	network_nodes = new vis.DataSet([]);
  	network_edges = new vis.DataSet([]);


  	// make a list of all nodes and edges in the grid
  	var nodes = [];

	for(var row=0; row < $('#jsGrid').data().JSGrid.data.length; ++row){
		
		var objx = $('#jsGrid').data().JSGrid.data[row]
		var this_var1 = objx.Var1;
		var this_var2 = objx.Var2;
		var this_relation = objx.Relation;
		
		console.log(this_var1 + " " + this_var2);
		if($.inArray(this_var1,nodes)==-1){
			nodes.push(this_var1)
		}
		if($.inArray(this_var2,nodes)==-1){
			nodes.push(this_var2)
		}
		var id = this_var1+"#"+this_relation+"#"+this_var2;
		// check we haven't added this data already
		if($.inArray(id,network_edges.getIds())!=-1){
			// id is already in the list of ids
			alert("Duplicate data at row "+(row+1));
		} else{
			var newEdge = getEdgeSettings(
				id,
				this_var1,
				this_var2,
				this_relation,
				objx.Cor,
		        objx.Type,
		        objx.Stage);
			console.log(newEdge);
			network_edges.add(newEdge);
		}
	}

	for(var i=0; i < nodes.length; ++i){
		var newNode = {
			id:nodes[i],
			label:nodes[i]
		}
		network_nodes.add(newNode);
	}


	// draw the unconnected nodes back in
	for(var i=0;i<unconnectedNodes.length;++i){
		network_nodes.add(unconnectedNodes[i]);
	}

	// redraw network
	initialiseNetwork();
	network.on("click", network_on_click);
    network.on("doubleClick", network_on_double_click);

    // update progress
    saveProgressCookie();
}

function findUnconnectedNodes(){
	// Find nodes in the GUI that are not connected with edges
	var allNodeIds = network_nodes.getIds();
	var nodesWithEdges= [];
	var allEdgeIds = network_edges.getIds();
	for(var i=0;i<allEdgeIds.length;++i){
		nodesWithEdges.push(network_edges.get(allEdgeIds[i]).from);
		nodesWithEdges.push(network_edges.get(allEdgeIds[i]).to);
	}

	// diff now contains what is in allNodeIds that is not in allEdgeIds
	return($(allNodeIds).not(nodesWithEdges).get());
}

