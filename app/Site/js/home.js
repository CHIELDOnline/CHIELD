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

// Submit an issue -------------

function issueForm(){

	var form = 
	'<div id="IssueForm2" class="card" style="background:pink;padding:10px">\
		<div class="form-group">\
			<p>Issue title:</p>\
			<input id="IssueForm2Title" value="Issue title" class="form-control">\
			<p>Please describe your issue:</p>\
			<textarea id="IssueForm2Text" class="form-control"></textarea>\
			<p>Enter your name (optional):</p>\
			<input id="IssueForm2Name" value="Anonymous" class="form-control">\
		</div>\
		<button id="issue2SubmitButton" onclick="submitNewIssue()" class="btn btn-danger" type="submit">Submit</button>\
	</div>';

	$("#issueSubmissionSection").append(form);
	var offset = $("#issue2SubmitButton").offset();
	$('html, body').animate({
    	scrollTop: offset.top,
    	scrollLeft: offset.left
	});
}

function submitNewIssue(){
		
	var issueLabel = "bug";
	var issueText = 
		$("#IssueForm2Text").val() + 
		"\n\nSent by: " +
		$("#IssueForm2Name").val();
	var issueTitle = $("#IssueForm2Title").val();

	if(issueText!=undefined){
		$("#issue2SubmitButton").hide();
		var jdata = {
			text: issueText,
			label: issueLabel,
			title: issueTitle
				};
		console.log(jdata);

		$.ajax({
		    type: 'POST',
		    url: 'php/sendNewIssue.php',
		    data: {json: JSON.stringify(jdata)},
		    dataType: 'json'
		}). done(
			function(data){
				finishedSubmission2(data);
			}).fail(function(data){
				finishedSubmission2(data);
			});
	}
}

function finishedSubmission2(obj){
	var link = obj.responseText;
	if(link!==undefined && link.startsWith("https")){
		$("#IssueForm2").html(
			'Issue submitted. <a href="'+link+'" target="_blank">View the issue</a>.'
			);

	} else{
		var url = "https://github.com/CHIELDOnline/CHIELD/issues/new";
		$("#IssueForm2").html(
			'<p>There may be an error with the submission. You can submit an issue via GitHub <a href="'+url+'">here</a>.'
			);
	}
}

// Submit a coding request -------------


function requestCoding(){

	var form = 
	'<div id="IssueForm" class="card" style="background:pink;padding:10px">\
		<div class="form-group">\
			<p>Please enter a reference for the document you wish to be coded (apa or bibtex preferred):</p>\
			<textarea id="IssueFormText" class="form-control"></textarea>\
			<p>Enter your name (optional):</p>\
			<input id="IssueFormName" value="Anonymous" class="form-control">\
		</div>\
		<button id="issueSubmitButton" onclick="submitNewCodingRequest()" class="btn btn-danger" type="submit">Submit</button>\
	</div>';

	$("#requestCoding").append(form);
}

function submitNewCodingRequest(){
		
	var issueLabel = "codingRequest";
	var issueText = 
		$("#IssueFormText").val() + 
		"\n\nSent by: " +
		$("#IssueFormName").val();
	var issueTitle = "Coding Request";

	if(issueText!=undefined){
		$("#issueSubmitButton").hide();
		var jdata = {
			text: issueText,
			label: issueLabel,
			title: issueTitle
				};
		console.log(jdata);

		$.ajax({
		    type: 'POST',
		    url: 'php/sendNewIssue.php',
		    data: {json: JSON.stringify(jdata)},
		    dataType: 'json'
		}). done(
			function(data){
				finishedSubmission(data);
			}).fail(function(data){
				finishedSubmission(data);
			});
	}
}

function finishedSubmission(obj){
	console.log(obj.responseText);
	var link = obj.responseText;
	if(link!==undefined && link.startsWith("https")){
		$("#IssueForm").html(
			'Request submitted. <a href="'+link+'" target="_blank">View the issue</a>.'
			);

	} else{
		var url = "https://github.com/CHIELDOnline/CHIELD/issues/new?title=Coding Request&labels=codingRequest";
		$("#IssueForm").html(
			'<p>There may be an error with the submission. You can submit an request via GitHub <a href="'+url+'">here</a>.'
			);
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
