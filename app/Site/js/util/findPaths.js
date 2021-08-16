// # Take two target nodes,
// # Find all paths that connect them
// # Return a list of node ids to add to the user's visualisation
// #  (this will be used in an SQL statement that finds links between these nodes)
// # This is based on Dijkstra's algorithm. However, we don't need to find all
// #  possible paths, only the set of nodes along all possible paths.
// #  The SQL search will find all paths connecting these nodes later.
// #  So we can keep track of edges traversed, and only follow each edge once.
// 
// # Maybe what we really want to do is this: https://stackoverflow.com/questions/25813635/efficiently-finding-all-nodes-on-some-path-between-two-nodes-in-a-directed-graph
// # Do a breadth-first search from start node, do breadth-first-search from end node, 
// #  then take the intersection between the two sets of nodes.
// # Or even faster: make a dictionary of all nodes accessible from each node
// #   Then just look up the intersection between start and end.
// # However, the "backwards" search from the end variable needs to follow links 'backwards'
// # So you need two dictionaries: Forwards and backwards.

var pathData = null;
var pathStartNode = null;
var pathEndNode = null;
var pathVisitedEdges = null;
var pathVisitedNodes = [];

function loadPathData(){
	if(pathData == null){
		// Load graph data
		$.getJSON("json/CausalLinks.json", function(result){
			console.log(result)
			pathData = result;	
			if((pathStartNode!=null) && (pathEndNode!=null)){
				launchGetPaths();
			}
		});
	} else{
		launchGetPaths();
	}
}

function requestGetPaths(v1, v2){
	pathStartNode = v1;
	pathEndNode = v2;
	pathVisitedEdges = [];
	loadPathData();
}

function launchGetPaths(){
	showLoader();
	console.log("GET PATHS " + pathStartNode + ", " + pathEndNode);
	var uniqueNodes = getPaths(pathStartNode,pathEndNode);
	// console.log(paths);
// 	uniqueNodes = [];
// 	for(var i=0;i<paths.length;++i){
// 		subpath = paths[i];
// 		for(var j=0;j<subpath.length;++j){
// 			if(!uniqueNodes.includes(subpath[j])){
// 				uniqueNodes.push(subpath[j])
// 			}
// 		}
// 	}
	// Request extra nodes from the server
	if(uniqueNodes.length >0){
		$.ajax({
			type: 'POST',
			url: 'php/getPaths.php',
			data: {json: JSON.stringify({uniqueNodes : uniqueNodes})},
			dataType: 'json'
			}). done(
				function(data){
					updateRecord(data, "links");
					hideLoader();
				}).fail(function(data){
					// TODO
			});
	} else{
		hideLoader();
	}
}

function arraysEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function inVisitedEdges(x){
	for(var i=0;i<pathVisitedEdges.length; ++ i){
		if(arraysEqual(x,pathVisitedEdges[i])){
			return(true)
		}
	}
	return(false);
}

function walkPath(start, end, type){
	pathVisitedNodes.push(start);
	if(start==end){
		return(null)
	}
	if(! (start in pathData[type])){
		return(null)
	}
	var nextNodes = pathData[type][start];
	for(var i=0;i<nextNodes.length;++i){
		if(!(pathVisitedNodes.includes(nextNodes[i]))){		
			walkPath(nextNodes[i],end,type);
		}
	}
}

function getPaths(start,end){
	pathVisitedNodes = [];
	walkPath(start,end, "forwards");
	var forwards = pathVisitedNodes.slice();
	console.log("FORWARDS")
	console.log(forwards);
	pathVisitedNodes = [];
	walkPath(end,start,"backwards");
	console.log("BACKWARDS")
	console.log(pathVisitedNodes);
	var intersection = forwards.filter(x => pathVisitedNodes.includes(x));
	console.log(intersection);
	return(intersection)
}

function getPathsAStar(start,end,path=[]){
	path.push(start);
	if(start==end){
		// TODO: include end?
		return([path]);
	}
	if(!(start in pathData)){
		console.log("Start not in path data");
		return([]);
	}
	
	paths = []
	console.log("--")
	console.log(start);
	console.log(pathData[start])
	for(var nodei=0;nodei<pathData[start].length;++nodei){
		node =pathData[start][nodei];
		if((!path.includes(node)) && (!inVisitedEdges([start,node]))){
			var newpaths = getPaths(node,end,path) // should this be 'path'?
			for(var i=0;i<newpaths.length;++i){
				paths.push(newpaths[i])
			}
		}
		pathVisitedEdges.push([start,node])	
	}
	return(paths);
}



