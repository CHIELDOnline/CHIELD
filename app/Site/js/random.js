var document_details = [];
var doc_causal_links = [];

var document_network_layout_options = {
	hierarchical: {
	    direction: "LR",
	    sortMethod: "directed",
	    levelSeparation: 250
		}
	};
var document_network_physics_options = {
	hierarchicalRepulsion : {
		nodeDistance: 50
	}};


function updateRecord(response,type){
	console.log("updateRecord "+type);
	if(type=="links"){
		doc_causal_links = JSON.parse(response);
		console.log("HERE")
		console.log(doc_causal_links);
		console.log(doc_causal_links[0]);
		console.log(doc_causal_links[0].bibref);
		network_nodes.remove(network_nodes.getIds());
		network_edges.remove(network_edges.getIds());
		redrawGUIfromObject(doc_causal_links); 
		network.fit();
		network.moveTo({scale:3});
		docKey = doc_causal_links[0].bibref;
		
		quote = '"' + doc_causal_links[0].Notes + '"' + '<a href="document.html?key='+
						 docKey + '"> ... see in context.</a>'
		
		$("#quote").html(quote);
	}
	
}

function getRandomQuote(){
	requestRecord("php/getRandomLinkWithQuote.php", "",'links');
}


$(document).ready(function(){
	//$("#header").load("header.html"); 

	network_options.layout = document_network_layout_options;
	network_options.physics = document_network_physics_options;
	network_options.interaction = {navigationButtons: false};
	network_options.edges.smooth = false;

	initialiseNetwork();
	getRandomQuote();
	

});
