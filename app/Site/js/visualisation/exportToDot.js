var dotEdgeTypes = {
		">": 'arrowhead="normal",arrowtail="none"',
		"<=>": 'dir="both"',
		"<": 'arrowhead="none",dir="back"',
		"~": 'arrowhead="none",arrowtail="none",style="dashed"',
		"/>":'arrowhead="tee",arrowtail="none"',
		"/=":'arrowhead="tee",arrowtail="none"',
		">>":'arrowhead="normal",arrowtail="none"',
		"~=":'arrowhead="dot",arrowtail="none"',
		"^":'arrowhead="normal",arrowtail="none",style="dashed"'
	}


function visGraphToDot(network,network_nodes,network_edges,includePos,directed){
	
	var graphType = "digraph";
	var edgeConnector = " -> ";
	if(!directed){
		graphType = "graph";
		edgeConnector = " -- ";
	}

	var dot = graphType + ' chield{\nnode [color="#e92b2b", style=filled, fillcolor="#ffd2d2"]';
	if(includePos){
		// Positions will only be rendered if the dot file is displayed with the Neato layout
		dot += '\ngraph [layout="neato"]';
	}
	dot += '\n__NODES__\n\n__EDGES__\n}';
    var nodesArray = network_nodes.get(network_nodes.getIds());
    var nodeIds = makeNodeDictionary(nodesArray,network);
    var nodesDot = makeNodesDot(nodeIds,includePos);

	var edgesArray = network_edges.get(network_edges.getIds());
    var edgesDot = edgesToDot(edgesArray,nodeIds,edgeConnector);
    
    dot = dot.replace("__NODES__",nodesDot);
    dot = dot.replace("__EDGES__",edgesDot);

    return(dot);	
}

function makeNodeDictionary(nodesArray,network){
	var nodeIds = {};
	var nodeCounter = 0;

	// make list of current node positions
	var net_positions = network.getPositions();
	// Positions in Dot have an inverse y axis to vis.js
	// so we invert them here
	// First, find maximum y
	var maxy = 0;
	for (var property in net_positions) {
	    if (net_positions.hasOwnProperty(property)) {
	    	if(net_positions[property].y > maxy){
	    		maxy = net_positions[property].y
	    	}
	   	}
	}
	// Now invert y axis
	for (var property in net_positions) {
	    if (net_positions.hasOwnProperty(property)) {
	    	net_positions[property].y = maxy - net_positions[property].y;
	    }
	}

	// Make an array of node objects
	for(var i=0;i<nodesArray.length;++i){
		if($.inArray(nodesArray[i].id,Object.keys(nodeIds))==-1){

			nodeIds[nodesArray[i].id] = {
				label: nodesArray[i].label,
				id: "N" + nodeCounter,
				pos: net_positions[nodesArray[i].id]
				}
			nodeCounter += 1;
		}
	}
	return(nodeIds);
}

function makeNodesDot(nodeIds,includePos){
	var nodesDot = "";
	for (var property in nodeIds) {
	    if (nodeIds.hasOwnProperty(property)) {
	        nodesDot += makeDotNode(
	        	nodeIds[property].id,
	        	nodeIds[property].label,
	        	nodeIds[property].pos,
	        	includePos) + "\n";
	    }
	}
	return(nodesDot);
}

function makeDotNode(id,label,pos,includePos){
	var node = id + " " + '[label="'+label+'"';
	if(includePos){
		//DOT format: 'pos="3,5!"'
		node += ',pos="'+pos.x+","+pos.y+'!"';
	}
	// zero margin makes the dot file look more like the on-screen vis.js network
	node += ",margin=0]";
	return(node);
}

function edgesToDot(edgesArray,nodeIds,edgeConnector){
	var edgesSpec = "";

	for(var i=0; i < edgesArray.length; ++i){
		edgesSpec += edgeToDot(edgesArray[i],nodeIds,edgeConnector) + "\n";
	}
	return(edgesSpec)
}

function edgeToDot(edgeObject,nodeIds,edgeConnector){
	var edgeDot = nodeIds[edgeObject.from].id + edgeConnector + nodeIds[edgeObject.to].id;
	var col = edgeObject.color;
	if(col.hasOwnProperty("color")){
		col = edgeObject.color.color;
	}
	edgeDot  += " " + edgeProperties(edgeObject.causal_relation, col);
	return(edgeDot);
}

function edgeProperties(causal_relation,color){
	var edgeProperty=  "[";
	var det = dotEdgeTypes[causal_relation];
	if(det==undefined){
		det = 'arrowhead="none",arrowtail="none"';
	}
	edgeProperty += det;
	edgeProperty += ',color="'+color+'"';
	edgeProperty += "]"
	return(edgeProperty);
}






