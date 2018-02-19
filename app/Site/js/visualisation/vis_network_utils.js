var network_nodes = null;
var network_edges = null;
var network = null;

var network_options = {
  //layout:{
  //  hierarchical: true
  //  }
  interaction: {
    //zoomView:false, // prevents user from zooming
    multiselect: true
  },
    edges: {
      smooth: false
  },
    physics: {
//      forceAtlas2Based: {
//        gravitationalConstant: -26,
//        centralGravity: 0.005,
//        springLength: 230,
//        springConstant: 0.18,
//        avoidOverlap: 1.5
//      },
//      maxVelocity: 146,
//      solver: 'forceAtlas2Based',
//      timestep: 0.35,
    stabilization: {
      enabled: true,
      iterations: 1000,
      //updateInterval: 25
    }
  },
    nodes: {
      fixed: {
          y: false,
          x: false
        },
       color: {
        border: "#e92b2b",
        background: "#ffd2d2",
        highlight:{
          border: "#e92b2b",
          background: "#ffd2d2"},
        hover: {
          border: "#e92b2b",
          background: "#ffd2d2"}
       }
    }
};


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

  // After initial layout, turn off the physics for nodes so that 
  // the user can drag things to custom places
  network.on("stabilizationIterationsDone", function (params) {
  		console.log("stabilization finished");
        network.setOptions({
//			nodes: {physics: false},
            nodes: {fixed: {
                      y: false,
                      x: false
                    }},
            physics: {
            	enabled: false,
      //      	stabilization: {
    //        		onlyDynamicEdges: true
  //          	}
            }
        });
        network.fit();
    });


}

function getEdgeSettings(edge_id, Var1, Var2, Relation){
  // standard setting: ">"

  var newEdge = {
      id: edge_id,
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

function isNumeric(value){
  return !isNaN(value - parseFloat(value));
}

function redrawGUIfromObject(obj){
  // obj is a list of edges
    console.log(obj);
    var nodes = [];

    // For each edge
  for(var row=0; row < obj.length; ++row){
    // Get info
    var this_var1 = obj[row].variable1; 
    var this_var2 = obj[row].variable2;
    var this_relation = obj[row].relation;
    var this_edge_id = obj[row].pk;
    
    // Add the variables to the list of nodes
    if($.inArray(this_var1,nodes)==-1){
      nodes.push(this_var1)
    }
    if($.inArray(this_var2,nodes)==-1){
      nodes.push(this_var2)
    }
    
    // If the edge isn't yet part of the network:
    if($.inArray(this_edge_id,network_edges.getIds())==-1){
      // create a new edge

      // Are variables strings or pks?
      if(isNumeric(this_var1)){
        // if it is a PK, then conver to variable name
        // (we assume that findVariablePK() is implemented, as in explore.js)
        this_var1 = findVariablePK(this_var1);
        this_var2 = findVariablePK(this_var2);
      }
      // If not, just keep them as strings

      var newEdge = getEdgeSettings(
        this_edge_id,
        this_var1,
        this_var2,
        this_relation);
      // add it to the network
      network_edges.add(newEdge);
    }
  }
  
  // For each node
  for(var i=0; i < nodes.length; ++i){
    var npk = nodes[i];
    if(isNumeric(npk)){
      npk = findVariablePK(npk);
    }
    // If the node is not yet in the network:
    if($.inArray(npk,network_nodes.getIds())==-1){
      // create a new node
      var newNode = {
        id:npk,
        label:nodes[i]
      }
      // add it to the network
      network_nodes.add(newNode);
    }
  }

  // redraw network
  network.redraw();
  network.fit();

}

