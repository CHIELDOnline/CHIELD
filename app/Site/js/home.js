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

	// -----------------------------------------------------
	// Video poster
	$(document).on('click','.js-videoPoster',function(ev) {
	  ev.preventDefault();
	  var $poster = $(this);
	  var $wrapper = $poster.closest('.js-videoWrapper');
	  videoPlay($wrapper);
	});

	// play the targeted video (and hide the poster frame)
	function videoPlay($wrapper) {
	  var $iframe = $wrapper.find('.js-videoIframe');
	  var src = $iframe.data('src');
	  // hide poster
	  $wrapper.addClass('videoWrapperActive');
	  // add iframe src in, starting the video
	  $iframe.attr('src',src);
	}

	// stop the targeted/all videos (and re-instate the poster frames)
	function videoStop($wrapper) {
	  // if we're stopping all videos on page
	  if (!$wrapper) {
	    var $wrapper = $('.js-videoWrapper');
	    var $iframe = $('.js-videoIframe');
	  // if we're stopping a particular video
	  } else {
	    var $iframe = $wrapper.find('.js-videoIframe');
	  }
	  // reveal poster
	  $wrapper.removeClass('videoWrapperActive');
	  // remove youtube link, stopping the video from playing in the background
	  $iframe.attr('src','');
	}
	// -----------------------------------------------------

});
