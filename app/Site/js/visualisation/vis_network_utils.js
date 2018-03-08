var network_nodes = null;
var network_edges = null;
var network = null;

var convert_pks_to_string_ids = true;

// Default network options

var network_options = {
  layout:{
    hierarchical: false
  },
  interaction: {
    //zoomView:false, // prevents user from zooming
    multiselect: true
  },
    edges: {
      smooth: false
  },
    physics: {
    stabilization: {
      enabled: true,
      iterations: 1000,
    }
  },
    nodes: {
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

var network_options_configure = {
  filter: function (option, path) {
              if (path.indexOf('hierarchical') !== -1) {
                  return true;
              }
              return false;
          },
          showButton:false
}

function findVariablePK(varname){
  // Return the variable pk given a string name
  if (typeof existingVariables === 'undefined') {
    return(varname);
  }
  var foundVar = false;
    for(var i=0; i<existingVariables.length;++i){
      if(existingVariables[i]==varname){
        // TODO: check if network_nodes contains variable already
        // Add pk to network_nodes
        return(existingVariables_pk[i]);
      }
    }
  return(null);
}

function findVariableName(pk){
  // Return the variable name given a pk
  if (typeof existingVariables === 'undefined') {
    return(pk);
  }
  var foundVar = false;
    for(var i=0; i<existingVariables_pk.length;++i){
      if(existingVariables_pk[i]==pk){
        return(existingVariables[i]);
      }
    }
  return(null);
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

  // After dragging, deselect all nodes
  // This means that the "onclick" method of keeping track of which
  network.on("dragEnd", function(params){
    network.selectNodes([]);
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
  if(Relation=="~=" || Relation =="=~"){
    newEdge.arrows.to["type"] = "circle";
  }
  return(newEdge);
}

function isNumeric(value){
  return !isNaN(value - parseFloat(value));
}

/*function redrawGUIfromObject(obj){
  // obj is a list of edges
  // Note that this adds nodes, it does not clear nodes before adding
    console.log(obj);
    var nodes = [];

    // For each edge
  for(var row=0; row < obj.length; ++row){
    // Get info
    var this_var1 = obj[row].variable1; 
    var this_var2 = obj[row].variable2;
    var this_relation = obj[row].relation;
    var this_edge_id = obj[row].pk;
    
    // If the edge isn't yet part of the network:
    if($.inArray(this_edge_id,network_edges.getIds())==-1){
      // create a new edge

      // Are variables strings or pks?
      if(isNumeric(this_var1) && convert_pks_to_string_ids){
        // if it is a PK, then conver to variable name
        this_var1 = findVariableName(this_var1);
        this_var2 = findVariableName(this_var2);
      }
      var this_var1_pk = findVariablePK(this_var1);
      var this_var2_pk = findVariablePK(this_var2);
      // If not, just keep them as strings

      // Node ids are pks, so 'from' and 'to' need to be pks
      var newEdge = getEdgeSettings(
        this_edge_id,
        this_var1_pk,
        this_var2_pk,
        this_relation);
      // add it to the network
      network_edges.add(newEdge);

      // Add the variable labels to the list of nodes
      if($.inArray(this_var1,nodes)==-1){
        nodes.push(this_var1)
      }
      if($.inArray(this_var2,nodes)==-1){
        nodes.push(this_var2)
      }


    }
  }
  
  // For each node
  for(var i=0; i < nodes.length; ++i){
    var npk = nodes[i];
    if(!isNumeric(npk)){
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

}*/




function redrawGUIfromObject(obj){
  // obj is a list of edges
  // Note that this adds nodes, it does not clear nodes before adding
  console.log(obj);
  var new_nodes_names = [];
  var new_nodes_pk = [];
    // For each edge
  for(var row=0; row < obj.length; ++row){
    // Get info
    var this_var1 = obj[row].variable1; 
    var this_var2 = obj[row].variable2;
    var this_relation = obj[row].relation;
    var this_edge_id = obj[row].pk;

    var this_var1_pk = this_var1;
    var this_var2_pk = this_var2;
    var this_var1_name = this_var1;
    var this_var2_name = this_var2;

    // Check we have the right formats
    if(isNumeric(this_var1_name)){
      this_var1_name = findVariableName(this_var1_name);
    }
    if(isNumeric(this_var2_name)){
      this_var2_name = findVariableName(this_var2_name);
    }

    if(!isNumeric(this_var1_pk)){
      this_var1_pk = findVariablePK(this_var1_pk);
    }
    if(!isNumeric(this_var2_pk)){
      this_var2_pk = findVariablePK(this_var2_pk);
    }
    
    // If the edge isn't yet part of the network:
    if($.inArray(this_edge_id,network_edges.getIds())==-1){
      // create a new edge

      // Node ids are pks, so 'from' and 'to' need to be pks
      var newEdge = getEdgeSettings(
        this_edge_id,
        this_var1_pk,
        this_var2_pk,
        this_relation);
      // add it to the network
      network_edges.add(newEdge);

      if($.inArray(this_var1_pk,new_nodes_pk)==-1){
        new_nodes_names.push(this_var1_name);
        new_nodes_pk.push(this_var1_pk);
      }
      if($.inArray(this_var2_pk,new_nodes_pk)==-1){
        new_nodes_names.push(this_var2_name);
        new_nodes_pk.push(this_var2_pk);
      }
    }
  }
  console.log("PKs");
  console.log(new_nodes_pk);
  console.log(new_nodes_names);
  for(var i=0; i<new_nodes_pk.length;++i){
    if($.inArray(new_nodes_pk[i],network_nodes.getIds())==-1){
      var newNode = {
            id:new_nodes_pk[i],
            label:new_nodes_names[i]
          }
      network_nodes.add(newNode);
    }
  }

  // redraw network
  network.redraw();
  network.fit();

}


//  Network layout

var layoutPresets = {
  hierarchical: {
    layout : { hierarchical: {
      direction: "LR",
      sortMethod: "hubsize",
      levelSeparation: 250
    }
  },
    physics: {
      hierarchicalRepulsion : {
        nodeDistance: 50
    }}
  }
}




function changeNetworkLayout(type){

  preset_options = layoutPresets[type];
  if(Object.keys(preset_options).length>0){
    // User Jquery extend to modify options from defaults
    // Note: this might already happen with just `network.setOptions(preset_options)`
    network.setOptions($.extend( {}, network_options, preset_options ));    
  } else{
    // restore defaults
    network.setOptions(network_options);
  }
}




