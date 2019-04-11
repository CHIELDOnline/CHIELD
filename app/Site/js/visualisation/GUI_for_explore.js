var currently_selected_node = null;
var currently_selected_edge = null;
var current_selection_mode = "start";

var lastSelectedNodes = [];

var currently_clicked_location = null;

var current_relation_type = ">";

var network_last_click_time = 0;

var network_container = null;

var optionsVisible = false;

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

	   if (params.nodes.length == 1) {
          if (network.isCluster(params.nodes[0]) == true) {
              network.openCluster(params.nodes[0]);
          }
       }

	} else{
	// 	// User didn't click - unselect
	 	lastSelectedNodes = [];
	}

}

function updateRecord(response,type){
	// NEW VERSION THAT USES NETWORK AS CANONICAL DATA SOURCE
	if(type=='links'){
		var obj = JSON.parse(response);
		// TODO: test if obj is correctly parsed.
		console.log("LINKS OBJECT");
		console.log(obj);
		redrawGUIfromObject(obj);
		changeEdgeColourScheme(edge_colour_scheme);
		updateGridFromNetwork();

		// TODO: Check if no new links
		//alert("No new links found");
	}
	if(type=="docs"){
		existingDocuments = [];
		existingDocuments_pk = [];
		var obj = JSON.parse(response);
		for(var i=0;i<obj.length;++i){
			existingDocuments.push(obj[i].citation);
			existingDocuments_pk.push(obj[i].pk);
		}
		
	}
	hideLoader();
}

function updateGridFromNetwork(){
	var edges = network_edges.get();
	var rows = [];

	for(var i=0;i<edges.length;++i){
		var edge = edges[i];
		if((network_nodes.get(edge.from)!=null) && (network_nodes.get(edge.to)!=null)){
			var newRow = [
				null,
				network_nodes.get(edge.from).label,
				edge.causal_relation,
				network_nodes.get(edge.to).label,
				edge.cor,
				edge.stage,
				edge.studyType,
				//'<a href="document.html?key='+ edge.bibref +'">' + edge.citation + "</a>",
				//null,
				//null
				edge.citation,
				edge.bibref,
				edge.confirmed // Confirmed
			];
			rows.push(newRow);
		}
	}
	dtable.clear();
	dtable.rows.add(rows);
	dtable.draw();

}



function expandVariable() {

	var selectedNodes = network.getSelectedNodes();
	var keylist = selectedNodes.join(",");
	showLoader();
	requestRecord(php_link,"keylist="+keylist,'links');
}

function addVar(varname){
	$("#searchVariablesToAdd").hide();
	if(varname===null){
		varname = $("#searchVariablesToAdd").val()
	}
	var pk = findVariablePK(varname);
	if(pk!=null){
		// Check it's not already displayed
		if($.inArray(pk,network_nodes.getIds())==-1){

			var meanPos = getMeanNodePositions();
			// Add node
			var newNode = {
				id:pk,
				label:varname,
				x: meanPos.x,
				y: meanPos.y
				};
			network_nodes.add(newNode);
		}
	}
}

function addDoc(doc_citation){

	if(doc_citation===null){
		doc_citation = $("#searchDocsToAdd").val();
	}
	var docs = doc_citation.split(";");

	for(var i=0;i<docs.length;++i){
		doc_citation = docs[i].trim();
		var doc_index = existingDocuments.indexOf(doc_citation);
		if(doc_index>=0){
			var bibref = existingDocuments_pk[doc_index];
			showLoader();
			requestRecord("php/getLinksForExploreByDocument.php","bibref="+bibref,'links');
		}
	}
}

function bulkOut(){
	showLoader();
	var currentEdgesKeys= network_edges.getIds().join(",");
	requestRecord("php/getBulkOutLinks.php","keylist="+currentEdgesKeys,'links');
}

function getMeanNodePositions(){
	var mean_x_position = 0.0;
	var mean_y_position = 0.0;
	var nodeIds = network_nodes.getIds();
	if(nodeIds.length>0){
		var nodePositions = network.getPositions();
		for(var i=0;i<nodeIds.length;++i){
			mean_x_position += nodePositions[nodeIds[i]].x;
			mean_y_position += nodePositions[nodeIds[i]].y;
		}

		mean_x_position = mean_x_position/nodeIds.length;
		mean_y_position = mean_y_position/nodeIds.length;
	}
	console.log([mean_x_position,mean_y_position]);
	return({x:mean_x_position,y:mean_y_position});
}

function removeVariableViaNetwork(){
	network.deleteSelected();
	//var n = network.getSelectedNodes();
	//for(var i=0;i<n.length;++i){
	//	removeVar(n,false);
	//}
	// Also remove any edges:
	// (selecting a variable will select all connected edges, 
	//	which should be deleted above, but edges may be selected
	//  in addition)
	//var selectedEdges = network.getSelectedEdges();
	//network_edges.remove(selectedEdges);
	updateGridFromNetwork();
}

function removeVar(pk,updateGrid=true){

	network_nodes.remove(pk);
	// Remove from network edges
	// Find edge pks to remove
	var edgePKsToRemove = [];
	for(var i =0;i<network_edges.length;++i){
		var edge = network_edges.get()[i];
		if(edge.from==pk || edge.to==pk){
			edgePKsToRemove.push(edge.id);
		}
	}
	for(var i =0;i<edgePKsToRemove.length;++i){
		network_edges.remove(edgePKsToRemove[i]);
	}
	
	network.redraw();
	// remove from datatable
	if(updateGrid){
		updateGridFromNetwork();
	}

}

function removeVarFromDataTable(varname){
  var table  = $("#links_table").DataTable();
  table.rows().nodes().each(function(a,b) {
    if($(a).children().eq(0).text() == varname ||
       $(a).children().eq(2).text() == varname){
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
		showLoader();
		requestRecord("php/getPaths.php","var1="+var1+"&var2="+var2,'links');
	}

}

function loadCausalLinksFromDocument(bibref){
	requestRecord("php/getLinksForExploreByDocument.php","bibref="+bibref,'links');
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

function zoomInOnNode(nodeId){
	network.focus(nodeId,{animation:true,scale:2})
}

function highlightEdges(edgeIds, hilightColour = "red", nonHilightColour = "gray"){

	var ids = network_edges.getIds();

	for(var i=0;i<ids.length;++i){
		var col = nonHilightColour;
		if($.inArray(ids[i],edgeIds)>=0){
			col = hilightColour;
		}
		network_edges.update({
			id:ids[i], 
			color:{color:col}
		})
	}
	network.redraw();
}

function highlightConflictingEdges(){
	// TODO: Figure out some way of detecting differences in direction of causality


	showLoader();
	// build list of edges between nodes
	var edges = network_edges.get();
	var edgeTypes = {};
	var edgeIds = {};
	for(var i=0;i<edges.length;++i){
		var nodes = [edges[i].to,edges[i].from];
		var edgeLabel = nodes.sort().join(",");
		if (edgeLabel in edgeTypes){
			edgeTypes[edgeLabel].push(edges[i].causal_relation);
			edgeIds[edgeLabel].push(edges[i].id);
		} else{
			edgeTypes[edgeLabel] = [edges[i].causal_relation];
			edgeIds[edgeLabel] = [edges[i].id];
		}
	}

	var edgesToHighlight = [];
	
	for(var i=0;i<Object.keys(edgeTypes).length;++i){
		var key = Object.keys(edgeTypes)[i]
		var et = edgeTypes[key];
		if(et.length > 1){
			var someCausal = $.inArray(">",et)>=0 || 
							 $.inArray("<=>",et)>=0 || 
							 $.inArray(">>",et)>=0;
			var causalAndNonCausal = someCausal && $.inArray("/>",et)>=0;
			var hilight = causalAndNonCausal;
			if(hilight){
				for(var j=0;j<edgeIds[key].length;++j){
					edgesToHighlight.push(edgeIds[key][j]);
				}
			}
		}
	}
	highlightEdges(edgesToHighlight);
	findBoundsForEdges(edgesToHighlight);
	hideLoader();
}

function findBoundsForEdges(edgeIds){

	var nodesForEdges = [];

	for(var i=0;i<edgeIds.length;++i){
		var edge = network_edges.get(edgeIds[i]);
		nodesForEdges.push(edge.from);
		nodesForEdges.push(edge.to);
	}

	network.fit({
		nodes: nodesForEdges,
		animation: true
	});
}

// --------------------------
// Legend and Colour Scheme
// --------------------------
function changeEdgeColourScheme(type){
	applyNetworkColorScheme(type);
	updateLegend();
}

function updateLegend(){
	// from vis_network_utils.js
	var legend = constructEdgeColourLegend(); 
	$("#legendItems").html(legend);
	// showLegend();
}

function showLegend(){
	$("#legend").show();
	$("#legendButton").hide();
}

function hideLegend(){
	$("#legend").hide();
	$("#legendButton").show();
}

// ----------
//   Loader
// ----------

function showLoader(){
	$(".loader").show();
}

function hideLoader(){
	$(".loader").hide();
}
