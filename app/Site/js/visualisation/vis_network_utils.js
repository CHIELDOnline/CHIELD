var network_nodes = null;
var network_edges = null;
var network = null;

var convert_pks_to_string_ids = true;

// Default network options


// Edge colour scheme
// Currently supports causal, cor, type, stage
var edge_colour_scheme = "causal";
var documentColours = {}; // dictionary of document to colour mappings for edges
var maxNumberOfLegendItems = 12;

var network_options = {
  layout:{
    hierarchical: false
  },
  interaction: {
    //zoomView:false, // prevents user from zooming
    multiselect: true,
    navigationButtons: true
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
  "cultural evolution":'#ffd507',
  "coevolution":'#ff9400',
  "preadaptation":'#DC3545'
};

var POSITIVE_COR_COLOUR = "#e92b2b"; // CHIELD RED
var NEGATIVE_COR_COLOUR = "#2b4fe9"; // BLUE



var network_options_configure = {
  filter: function (option, path) {
              if (path.indexOf('hierarchical') !== -1) {
                  return true;
              }
              if (path.indexOf('smooth') !== -1 || option === 'smooth') {
                  return true;
              }
              //console.log(option);
              //console.log(path);
              if(path=="physics" && option =="enabled"){
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

function getEdgeSettings(edge_id, Var1, Var2, Relation, Cor, Type, Stage,bibref,citation,confirmed){
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
        color: {color:"#000000"},
        causal_relation: Relation,
        cor: Cor,
        studyType: Type,
        stage: Stage,
        bibref: bibref,
        citation: citation,
        confirmed: confirmed
    };

  if(Relation=="<"){
    newEdge.arrows.to.enabled = false;
    newEdge.arrows.from.enabled  = true;
  }
  if(Relation==">>"){
    if(edge_colour_scheme=="causal"){
      newEdge.color.color = "red"
    }
  }
  if(Relation=="<=>"){
    //newEdge.arrows = "to;from";
    newEdge.arrows.from.enabled  = true;
  }
  if(Relation=="~=" || Relation =="=~"){
    newEdge.arrows.to["type"] = "circle";
  }

  if(Relation=="~"){
    newEdge.dashes = true;
    newEdge.arrows.to.enabled = false;
    newEdge.color.color = "#b3b6b7";
  }

  if(Relation=="/>"){
    console.log("/>");
    newEdge.arrows.to["type"] = "bar";
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
        newEdge.color.color = "green";
      }
      newEdge.smooth = true;
  }

  if(confirmed=="no"){
    newEdge.shadow ={
      "enabled": true,
      "color": "rgba(255,0,0,1)",
      "size": 3,
      "x": -2,
      "y": -2
    };
  }


  newEdge.causalColor = newEdge.color.color;
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

      var doc_citation = null;
      if(typeof existingDocuments !== 'undefined'){
        doc_citation = existingDocuments_pk[existingDocuments.indexOf(obj[row].bibref)];
      }

      // Node ids are pks, so 'from' and 'to' need to be pks
      var newEdge = getEdgeSettings(
        this_edge_id,
        this_var1_pk,
        this_var2_pk,
        this_relation,
        obj[row].Cor,
        obj[row].Type,
        obj[row].Stage,
        obj[row].citekey,
        obj[row].bibref,
        obj[row].Confirmed); 
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

function findUnconnectedNodes(){
  // Find nodes in the GUI that are not connected with edges
  var allNodeIds = network_nodes.getIds();
  var nodesWithEdges= [];
  var allEdgeIds = network_edges.getIds();
  for(var i=0;i<allEdgeIds.length;++i){
    nodesWithEdges.push(network_edges.get(allEdgeIds[i]).from);
    nodesWithEdges.push(network_edges.get(allEdgeIds[i]).to);
  }

  // diff now contains what is in allNodeIds that is not in allEdgeIds
  return($(allNodeIds).not(nodesWithEdges).get());
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


// ------------------
//   Colour schemes
// ------------------

function applyNetworkColorScheme(scheme){
  edge_colour_scheme = scheme;

  if(scheme == "document"){
    calculateDocumentColours();
  }

  try{showLoader();} catch(err){}

  var ids = network_edges.getIds();
  for(var i=0; i<ids.length;++i){
    network_edges.update({
      id: ids[i], 
      color : {color: getEdgeColor(network_edges.get(ids[i]))}
    })
  }
  network.redraw();
  try{hideLoader();} catch(err){}
}

function getEdgeColor(edge){
  // Causal colour scheme
  if(edge_colour_scheme=="causal"){
    /*if(edge.causal_relation == ">>"){
      return("red");
    }
    if(edge.causal_relation == "^"){
      return("green");
    }
    return("black");*/
    return(edge.causalColor);
  }

  // Correlational colour scheme
  if(edge_colour_scheme=="cor"){
    if(edge.cor=="pos"){return(POSITIVE_COR_COLOUR);}
    if(edge.cor=="neg"){return(NEGATIVE_COR_COLOUR);}
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

  if(edge_colour_scheme=="document"){
    var edgeBibRef = edge.bibref;
    if(edgeBibRef===undefined){
      edgeBibRef = edge.citation;
    }
    var docCol = documentColours[edgeBibRef];
    if(docCol===undefined){
      return("black");
    } else{
      return(docCol);
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
    causal: "causal_relation",
    "document": "citation"
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
      colours.push(edge.color.color);
    }
  }
  // Limit to 10 items
  if(items.length>maxNumberOfLegendItems){
    items = items.slice(0,maxNumberOfLegendItems);
    colours = colours.slice(0,maxNumberOfLegendItems);
    items.push("Other");
    colours.push("#000000");
  }

  var legend = "";
  for(var i=0;i<items.length;++i){
    legend += 
      '<span class="legendItem" style="color:'+colours[i]+'">'+items[i]+'</span>';
  }
  return(legend);
}

function calculateDocumentColours(){
  
  documentColours = {};
  
  // Build list of documents, with frequency of occurance
  var document_frequency = {};
  var ids = network_edges.getIds();
  for(var i=0; i<ids.length; ++i){
    var edge = network_edges.get(ids[i]);
    var edgeBibRef = edge.bibref;
    if(edgeBibRef===undefined){
      edgeBibRef = edge.citation;
    }
    if (document_frequency[edgeBibRef]) {
           document_frequency[edgeBibRef]++;
        } else {
           document_frequency[edgeBibRef] = 1;
        }
  }

  // Sort document list by frequency so we can take just the top X
  var topDocsByFreq = Object.keys(document_frequency).map(function(key) {
    return { key: key, value: this[key] };
  }, document_frequency);
  topDocsByFreq.sort(function(p1, p2) { return p2.value - p1.value; });
  topDocsByFreq = topDocsByFreq.slice(0, maxNumberOfLegendItems);


  // Choose colours.
  var rainbowColours = rainbow(topDocsByFreq.length);

  for(var i=0;i<topDocsByFreq.length;++i){
    documentColours[topDocsByFreq[i].key] = rainbowColours[i];
  }

}


/*function rainbow(numOfSteps) {
    // This function generates vibrant, "evenly spaced" colours (i.e. no clustering). This is ideal for creating easily distinguishable vibrant markers in Google Maps and other apps.
    // Adam Cole, 2011-Sept-14
    // HSV to RBG adapted from: http://mjijackson.com/2008/02/rgb-to-hsl-and-rgb-to-hsv-color-model-conversion-algorithms-in-javascript
    //  see http://blog.adamcole.ca/2011/11/simple-javascript-rainbow-color.html

    var ret = [];
    for(var step=0;step<numOfSteps;++step){
    var r, g, b;
    var h = step / numOfSteps;
    var i = ~~(h * 6);
    var f = h * 6 - i;
    var q = 1 - f;
    switch(i % 6){
        case 0: r = 1; g = f; b = 0; break;
        case 1: r = q; g = 1; b = 0; break;
        case 2: r = 0; g = 1; b = f; break;
        case 3: r = 0; g = q; b = 1; break;
        case 4: r = f; g = 0; b = 1; break;
        case 5: r = 1; g = 0; b = q; break;
    }
    var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
    ret.push(c);
    }
    return (ret);
}*/

function rainbow(numOfSteps){
  // Colourblind safe pallettes
  var colCharts = [
    ["#e92b2b"],
    ["#e92b2b","#004488"],
    ['#DDAA33','#BB5566','#004488'],
    ["#0077BB","#009988","#EE7733","#CC3311"],
    ["#0077BB","#33BBEE","#009988","#EE7733","#CC3311"],
    ["#0077BB","#33BBEE","#009988","#EE7733","#CC3311","#EE3377"],
    ["#332288","#44AA99","#117733","#999933","#CC6677","#882255","#AA4499"],
    ["#332288","#88CCEE","#44AA99","#117733","#999933","#CC6677","#882255","#AA4499"],
    ["#332288","#88CCEE","#44AA99","#117733","#999933","#DDCC77","#CC6677","#882255","#AA4499"],
    ['#8b0000','#ba1c36','#dd4a54','#f07e67','#e3b795','#b4b9df','#968bcb','#735db6','#4a32a1','#00008b'],
    ['#8b0000','#b61832','#d7414f','#ed6d61','#efa07a','#add8e6','#a9a7d7','#8c7dc5','#6b54b2','#462d9e','#00008b'],
    ['#8b0000','#b2152f','#d2394b','#e8615d','#f18c6e','#dfbc9e','#b6bee1','#9e97d0','#8372bf','#654eae','#42299d','#00008b']]

  if(numOfSteps <= colCharts.length){
    return(colCharts[numOfSteps-1]);
  }

  var chosenChart = colCharts[colCharts.length-1];
  for(var i=colCharts.length;i<numOfSteps;++i){
    chosenChart.push("#000000");
  }
  return(chosenChart)

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
    return(varname.substring(0,v1colpos).trim());
  }
  return(varname);
}

function variablesArePartOfSameSupergroup(varname1,varname2){
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
                  return variablesArePartOfSameSupergroup(childOptions.supergroup,sg); 
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




