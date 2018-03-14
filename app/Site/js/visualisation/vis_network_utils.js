var network_nodes = null;
var network_edges = null;
var network = null;

var convert_pks_to_string_ids = true;

// Default network options


// Edge colour scheme
// Currently supports causal, cor, type, stage
var edge_colour_scheme = "causal";

var network_options = {
  layout:{
    hierarchical: false
  },
  interaction: {
    //zoomView:false, // prevents user from zooming
    multiselect: true
  },
    edges: {
      smooth: true
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

studyTypeColours = {
  simulation: "#00e7d9", // light blue
  model:      "#006de7", // dark blue
  review:     "#a300e7", // purple
  hypothesis: "#00e752", // green
  statistical:"#e78900", // orange
  experiment: "#e70000", // red
  qualitative:"#bce700", // yellow
  logical:    "#e700a3", // pink
  other:      "#000000"  // black
};

stageColours = {
  "language change":'#28A745',
  "cultural evolution":'#FFC107',
  "coevolution":'#FFAF00',
  "preadaptation":'#DC3545'
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

function getEdgeSettings(edge_id, Var1, Var2, Relation, Cor, Type, Stage){
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
        causal_relation: Relation,
        cor: Cor,
        studyType: Type,
        stage: Stage
    };

  if(Relation=="<"){
    newEdge.arrows.to.enabled = false;
    newEdge.arrows.from.enabled  = true;
  }
  if(Relation==">>"){
    if(edge_colour_scheme=="causal"){
      newEdge.color = "red";
    }
  }
  if(Relation=="<=>"){
    //newEdge.arrows = "to;from";
    newEdge.arrows.from.enabled  = true;
  }
  if(Relation=="~=" || Relation =="=~"){
    newEdge.arrows.to["type"] = "circle";
  }
  if(Relation=="^"){
      // Swap order
      var tmp = newEdge.from
      newEdge.from = newEdge.to;
      newEdge.to = tmp;
      newEdge.arrows.to.enabled = false;
      newEdge.arrows.from.enabled  = true;
      newEdge.dashes = true;
      if(edge_colour_scheme=="causal"){
        newEdge.color = "green";
      }
      newEdge.smooth = true;
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
        this_relation,
        obj[row].Cor,
        obj[row].Type,
        obj[row].Stage);
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
        this_relation,
        obj[row].Cor,
        obj[row].Type,
        obj[row].Stage); 
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
            label:new_nodes_names[i],
            supergroup:getSupergroup(new_nodes_names[i])
          }
      network_nodes.add(newNode);
    }
  }

  // redraw network
  network.redraw();
  network.fit();

}


// ------------------
//   Network layout
// ------------------

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

function applyNetworkColorScheme(scheme){
  edge_colour_scheme = scheme;

  try{showLoader();} catch(err){}

  var ids = network_edges.getIds();
  for(var i=0; i<ids.length;++i){
    network_edges.update({
      id: ids[i], 
      color: getEdgeColor(network_edges.get(ids[i]))
    })
  }
  network.redraw();
  try{hideLoader();} catch(err){}
}

function getEdgeColor(edge){
  // Causal colour scheme
  if(edge_colour_scheme=="causal"){
    if(edge.causal_relation == ">>"){
      return("red");
    }
    if(edge.causal_relation == "^"){
      return("green");
    }
    return("black");
  }

  // Correlational colour scheme
  if(edge_colour_scheme=="cor"){
    if(edge.cor=="pos"){return('green');}
    if(edge.cor=="neg"){return("red");  }
    return("black")
  }

  // Type colour scheme
  if(edge_colour_scheme=="type"){
    var typeCol = studyTypeColours[edge.studyType];
    if(typeCol===undefined){
      return("black");
    } else{
      return(typeCol);
    }
  }

  // Stage colour scheme
  if(edge_colour_scheme=="stage"){
    var stageCol = stageColours[edge.stage];
    if(stageCol===undefined){
      return("black");
    } else{
      return(stageCol);
    }
  }

  return("black");
}

function constructEdgeColourLegend(){

  // Iterate through edges, get all unique types
  // Construct a colour legend


  // get the relevant edge property according to the colour scheme
  var itemProperty = {
    stage: "stage",
    type: "studyType",
    cor: "cor",
    causal: "causal_relation"
  }[edge_colour_scheme];

  if(itemProperty===undefined){
    itemProperty = "causal_relation";
  }

  // Get unique colours
  var items = [];
  var colours = [];
  var ids = network_edges.getIds();
  for(var i=0; i<ids.length; ++i){
    var edge = network_edges.get(ids[i]);
    var prop = edge[itemProperty];
    // If the edge property is new to the items list,
    // Add the property and the corresponding colour
    if((prop!==null) && $.inArray(prop,items)==-1){
      items.push(prop);
      colours.push(edge.color);
    }
  }

  if(items.length>10){
    items.slice(0,10);
    colours.slice(0,10);
  }

  var legend = "";
  for(var i=0;i<items.length;++i){
    legend += 
      '<span class="legendItem" style="color:'+colours[i]+'">'+items[i]+'</span>';
  }
  return(legend);
}



// ---------------------
//       Clustering
// ---------------------

function findSupergroups(){
  var n = network_nodes.get(network_nodes.getIds());
  var supergroups = [];
  for(var i=0; i<n.length;++i){
    if(n[i].label.indexOf(":")>=0){
      var sg = getSupergroup(n[i].label);
      if($.inArray(sg,supergroups)==-1){
        supergroups.push(sg)
      }
    }
  }
  return(supergroups);
}

function getSupergroup(varname){
  if(varname==undefined){
      return(varname);
  }
  // Change e.g. "population size: ancient" to "population size"
  v1colpos = varname.indexOf(":");
  if(v1colpos>=0){
    return(varname.substring(0,v1colpos));
  }
  return(varname);
}

function variablesArePartOfSameSubgroup(varname1,varname2){
  return(getSupergroup(varname1) === getSupergroup(varname2));
}


function clusterByGroup() {
  // Copied from http://visjs.org/examples/network/other/clustering.html

  // TODO: Set "supergroup" option for all nodes
  // TODO: Find all supergroups
  var supergroups = findSupergroups();

  // Then iterate over them add cluster
  for(var i=0;i<supergroups.length;++i){
      var sg = supergroups[i];
      var clusterOptionsByData = {
              joinCondition: function (childOptions) {
                  console.log(childOptions.supergroup);
                  console.log(sg);
                  return variablesArePartOfSameSubgroup(childOptions.supergroup,sg); 
              },
              /*processProperties: function (clusterOptions, childNodes, childEdges) {
                  var totalMass = 0;
                  for (var i = 0; i < childNodes.length; i++) {
                      totalMass += childNodes[i].mass;
                  }
                  clusterOptions.mass = totalMass;
                  return clusterOptions;
              },*/
              clusterNodeProperties: {
                //id: 'cluster:' + color, 
                borderWidth: 3, 
                shape: 'database', 
                //color:color, 
                label:supergroups[i]
              }
          };
      network.cluster(clusterOptionsByData);
    }

    // if we click on a node, and it's a cluster - open it
    network.on("selectNode", function(params) {
      if (params.nodes.length == 1) {
          if (network.isCluster(params.nodes[0]) == true) {
              network.openCluster(params.nodes[0]);
          }
      }
    });
  }




