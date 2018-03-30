var dotEdgeTypes = {
		">": 'arrowhead="normal",arrowtail="none"',
		"<=>": 'arrowhead="normal",arrowtail="normal"',
		"<": 'arrowhead="none",arrowtail="normal"',
		"~": 'arrowhead="none",arrowtail="none",style="dashed"',
		"/>":'arrowhead="tee",arrowtail="none"',
		">>":'arrowhead="normal",arrowtail="none"',
		"~=":'arrowhead="dot",arrowtail="none"',
		"^":'arrowhead="normal",arrowtail="none",style="dashed"'
	}


function visGraphToDot(network_nodes,network_edges){
	
	var dot = 'digraph chield{\nnode [color="#e92b2b", style=filled, fillcolor="#ffd2d2"]\n__NODES__\n\n__EDGES__\n}';
    var nodesArray = network_nodes.get(network_nodes.getIds());
    var nodeIds = makeNodeDictionary(nodesArray);
    var nodesDot = makeNodesDot(nodeIds);

	var edgesArray = network_edges.get(network_edges.getIds());
    var edgesDot = edgesToDot(edgesArray,nodeIds);
    
    dot = dot.replace("__NODES__",nodesDot);
    dot = dot.replace("__EDGES__",edgesDot);

    return(dot);	
}

function makeNodeDictionary(nodesArray){
	var nodeIds = {};
	var nodeCounter = 0;

	for(var i=0;i<nodesArray.length;++i){
		if($.inArray(nodesArray[i].id,Object.keys(nodeIds))==-1){
			nodeIds[nodesArray[i].id] = {
				label: nodesArray[i].label,
				id: "N" + nodeCounter
				}
			nodeCounter += 1;
		}
	}
	return(nodeIds);
}

function makeNodesDot(nodeIds){
	var nodesDot = "";
	for (var property in nodeIds) {
	    if (nodeIds.hasOwnProperty(property)) {
	        nodesDot += makeDotNode(nodeIds[property].id,nodeIds[property].label) + "\n";
	    }
	}
	return(nodesDot);
}

function makeDotNode(id,label){
	return(id + " " + '[label="'+label+'"]');
}

function edgesToDot(edgesArray,nodeIds){
	var edgesSpec = "";

	for(var i=0; i < edgesArray.length; ++i){
		edgesSpec += edgeToDot(edgesArray[i],nodeIds) + "\n";
	}
	return(edgesSpec)
}

function edgeToDot(edgeObject,nodeIds){
	var edgeDot = nodeIds[edgeObject.from].id + " -> " + nodeIds[edgeObject.to].id;
	edgeDot  += " " + edgeProperties(edgeObject.causal_relation, edgeObject.color);
	return(edgeDot);
}

function edgeProperties(causal_relation,color){
	var edgeProperty=  "[";
	edgeProperty += dotEdgeTypes[causal_relation];
	edgeProperty += ',color="'+color+'"';
	edgeProperty += "]"
	return(edgeProperty);
}






