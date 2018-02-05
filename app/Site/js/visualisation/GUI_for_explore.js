var php_link = "php/getLinksForExplore.php";

var database_records = null;

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
	
	// // User clicked on node - select it
	// if(params["nodes"].length > 0){
	// 	user_clicked_node(params["nodes"][0]);
	// } else{
	// 	// User didn't click - unselect
	// 	currently_selected_node = null;
	// }

}

function redrawGUIfromObject(obj){
	network_nodes = new vis.DataSet([]);
  	network_edges = new vis.DataSet([]);

  	var nodes = [];

	for(var row=0; row < obj.length; ++row){
		
		var this_var1 = obj[row].variable1;
		var this_var2 = obj[row].variable2;
		var this_relation = obj[row].relation;
		console.log(this_var1 + " " + this_var2);
		if($.inArray(this_var1,nodes)==-1){
			nodes.push(this_var1)
		}
		if($.inArray(this_var2,nodes)==-1){
			nodes.push(this_var2)
		}
		// TODO:
		// At the moment we're just adding lots of edges.
		// We could add a single edge that has a list of references to the edges
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

function updateRecord(response, type){
	var obj = JSON.parse(response);
	// TODO: test if obj is correctly parsed.
	database_records = obj;
	console.log(database_records);
	redrawGUIfromObject(database_records);
}

function getExploreLinks(){
	// construct an SQL list
	var keylist = network_nodes.join(",");
	requestRecord(php_link,"keylist="+keylist,'links');
}

//network_nodes = ['1184704463','614912974'];
//getExploreLinks()
// 0: {…}
// Cor: "pos"
// Stage: "language change"
// Type: "review"
// bibref: "Lupyan & Dale (2010)"
// citekey: "lupyan2010language"
// relation: ">"
// variable1: "proportion of adult learners"
// variable2: "learning cost: morphology"