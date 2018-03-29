function visGraphToDot(network_nodes,network_edges){
	
	var dot = "digraph chield{

				NODES

                EDGES
        }";
    var edgesArray = network_edges.get(network_edges.getIds());
    var nodeIds = makeNodeDictionary(edgesArray);

    var nodesDot = 

    var edgesDot = edgesToDot(edgesArray,nodeIds);
    dot.replace("EDGES",edges);

    return(dot);	
}

function makeNodeDictionary(edgesArray){
	var nodeIds = {};
	var nodeCounter = 0;
	for(var i=0;i<edgesArray.length;++i){
		if($.inArray(edgesArray[i].from,Object.keys(nodeIds))==-1){
			nodeIds[edgesArray[i].from] = "N"+nodeCounter;
			nodeCounter += 1;
		}
		if($.inArray(edgesArray[i].to,Object.keys(nodeIds))==-1){
			nodeIds[edgesArray[i].to] = "N"+nodeCounter;
			nodeCounter += 1;
		}
	}
	return(nodeIds);
}

function makeNodesDot(nodeIds){
	var nodesDot = "";
	for (var property in nodeIds) {
	    if (object.hasOwnProperty(property)) {
	        nodesDot += makeDotNode(property,nodeIds[property]);
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
		edgesSpec += edgeToDot(edgesArray[i],nodeIds);
	}
}

function edgeToDot(edgeObject,nodeIds){
	var edgeDot = nodeIds[edgeObject.from] + " -> " + nodeIds[edgeObject.to];

}

