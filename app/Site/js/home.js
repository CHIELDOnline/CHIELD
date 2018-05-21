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
	if(type=="docs"){
		document_details = JSON.parse(response);
		loadRandomNetwork();
	}
	if(type=="links"){
		doc_causal_links = JSON.parse(response);
		network_nodes.remove(network_nodes.getIds());
		network_edges.remove(network_edges.getIds());
		redrawGUIfromObject(doc_causal_links); 
	}
	
}

function loadRandomNetwork(){
	if(document_details.length>0){
		var random_document_index = Math.floor(Math.random()*document_details.length);

		var random_document_key = document_details[random_document_index].pk;
		var random_document_citation = document_details[random_document_index].citation;

		$("#networkTitle").html('<a href="document.html?key='+
								random_document_key+
								'">'+random_document_citation+'</a>');

		requestRecord("php/getLinksForDoc.php", "key="+random_document_key,'links');
	}
}


$(document).ready(function(){
	$("#header").load("header.html"); 

	network_options.layout = document_network_layout_options;
	network_options.physics = document_network_physics_options;
	network_options.interaction = {navigationButtons: false};
	network_options.edges.smooth = false;

	initialiseNetwork();
	requestRecord("php/getDocsForHome.php", "",'docs');
	
	setInterval("loadRandomNetwork()",5000);

});
