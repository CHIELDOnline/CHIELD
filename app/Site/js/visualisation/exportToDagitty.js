function visGraphToDagitty(network,network_nodes,network_edges,includePos){
	return(
		makeDagittyNodeBlock(network_nodes, includePos) +
		"\n" +
		makeDagittyEdgesBlock(network_edges)
		)
}

function makeDagittyNodeBlock(network_nodes, includePos){

	var pos = network.getPositions()

	var nodeBlock = "";
	var nids = network_nodes.getIds()
	for(var i=0;i<nids.length;++i){
		var n = network_nodes.get(nids[i]);
		nodeBlock += encodeURI(n.label) + " l ";
		if(includePos){
			var thisPos = pos[nids[i]];
			nodeBlock += "@"+thisPos.x+","+thisPos.y;
		}
		nodeBlock += "\n";
	}
	return(nodeBlock);
}

function makeDagittyEdgesBlock(network_edges){
	var edgeBlock = "";
	var edges = network_edges.get();
	for(var i=0;i<edges.length;++i){
		var from = network_nodes.get(edges[i].from).label;
		var to = network_nodes.get(edges[i].to).label;
		edgeBlock += encodeURI(from) + " " + encodeURI(to)+"\n";
	}
	return(edgeBlock);
}