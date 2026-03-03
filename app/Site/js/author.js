// Single record

// TODO: getLinksForDoc - prepare database

var bibtexVisible = false;

var documentKey = "";
var shortCite = "";
var doc_causal_links = [];

var contributor_usernames = [];

tableId = "links_table";
dtableConfig = {
		ordering: true,
        lengthChange: false,
        autoWidth: true,
        //fixedColumns: {leftColumns: 3},
        pageLength: 5,
    	columns: [
    		{data: 1},
    		{data: 2},
    		{data: 3},
    		{
    			// Colour stage background (see vis_network_utils for `stageColours` definition)
	    		data: null,
	    		render: function(data,type,row){
                	return('<a href="document.html?key='+data[5]+'">'+data[4]+'</a>');
                }
	  		}
        ]
    };

dtableConfig_documentsTable = {
		ordering: true,
		order: [[ 2, "desc" ]],
        lengthChange: false,
        autoWidth: true,
        searching: false,
    	columns: [
        	// Combine the reference and the citekey to make a link
        	{ data: null, render: function(data,type,row){
        		var dcol = documentColours[data[3]];
        		return '<a style="color:' + dcol +
        			'" href="document.html?key=' + data[3] +'">'+data[0] + '</a>';
        	}},
        	{ data: 1},
        	{ data: 2}
        	]
    };

dtableConfig_coauthorsTable = {
		ordering: true,
        lengthChange: false,
        order: [[ 1, "desc" ]],
        autoWidth: true,
        searching: false,
    	columns: [
        	// Combine the reference and the citekey to make a link
        	{ data: null, render: function(data,type,row){
        		var authorURI = encodeURI(data[0]);
        		return '<a href="author.html?author=' + authorURI +'">'+data[0] + '</a>';
        	}},
        	{ data: 1}
        	]
    };

dtableConfig_collaboratorsTable = {
		ordering: true,
        lengthChange: false,
        order: [[ 2, "desc" ]],
        autoWidth: true,
        searching: false,
    	columns: [
        	// Combine the reference and the citekey to make a link
        	{ data: null, render: function(data,type,row){
        		var authorURI = encodeURI(data[0]);
        		return '<a href="author.html?author=' + authorURI +'">'+data[0] + '</a>';
        	}},
        	{ data: 1},
        	{ data: 2}
        	]
    };


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


function openQuote(text){
	text = decodeURI(text);
	if(!text.startsWith('"')){
		text = '"'+text;
	}
	if(!text.endsWith('"')){
		text += '"';
	}
	$("#quoteDivText").html(text);
	$("#quoteDiv").show();
}

function closeQuote(){
	$("#quoteDivText").html("");
	$("#quoteDiv").hide();	
}

function updateRecord(response,type){
	console.log("updateRecord "+type);
	if(type=="bib"){
		response = JSON.parse(response);
		console.log(response[0].record);
		document.getElementById('bibtexsource').value = response[0].record;
		shortCite = response[0].citation;
		$("#documentShortCite").html(shortCite);
		displayBibtex();
	}
	if(type=="links"){
		doc_causal_links = JSON.parse(response);
		updateLinksTable(response); // should pass string 
		redrawGUIfromObject(JSON.parse(response)); //should pass object

		// Now we can request document list
		applyNetworkColorScheme("document");
		requestRecord("php/getDocsForAuthor.php", "key="+authorName,'docs');
		setupColumnSearching("authorDocuments_table");
	}
	if(type=="docs"){
		updateLinksTable2(response,"authorDocuments_table",dtableConfig_documentsTable);
	}
	if(type=="coauthors"){
		updateLinksTable2(response,"coauthors_table",dtableConfig_coauthorsTable);
	}
	if(type=="collaborators"){
		if(response.length>5){
			updateLinksTable2(response,"collaborators_table",dtableConfig_collaboratorsTable);
		} else{
			$("#connectionsToOtherDocs").hide();
		}
	}
}


function updateLinksTable2(text,tableIdX,dtableConfigX){

	var links = JSON.parse(text);
	console.log("LINKS");
	// DataTable wants an array of arrays, so convert:
	var links2 = ObjectToArrayOfArrays(links);
	links2 = editData(links2);
	console.log(links2);
	var dtableConfigX = $.extend({data:links2},dtableConfigX);
	
	var dtableX = $('#'+tableIdX).DataTable(dtableConfigX);
	
	// Add column searching
    dtableX.columns().every( function () {
        var that = this;
 		if(that.visible()){
	        $( 'input', this.footer() ).on( 'keyup change', function () {
	            if ( that.search() !== this.value ) {
	                that
	                    .search( this.value )
	                    .draw();
	            }
	        } );
	    }
    } );
    $('#'+tableIdX+' tfoot tr').appendTo('#'+tableIdX+' thead');
    //document.getElementById(tableIdX+'_filter').style.display = "none";
}

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

function revealBibtex(){
	bibtexVisible = !bibtexVisible;
	if(bibtexVisible){
		$("#bibtexsource").show();
	} else{
		$("#bibtexsource").hide();
	}
}

function openExplore(){
	var link_pks = "";
	for(var i=0;i<doc_causal_links.length;++i){
		link_pks += doc_causal_links[i].pk+",";
	}
	link_pks = link_pks.slice(0,link_pks.length -1);
	var url = "explore.html?links="+link_pks;
	window.open(url);
}

function openSource(){
	var documentYear = getYear();
	var decade = (Math.floor(documentYear/10)*10)+"s";
	var url = "https://github.com/CHIELDOnline/CHIELD/tree/master/data/tree/documents/" +
		decade + "/" + documentYear + "/" + documentKey;
	window.open(url);
}


function raiseIssue(){
	var title = encodeURIComponent("Question about "+shortCite);
	var docURL = "https://chield.excd.org/document.html?key="+documentKey;
	var body = "Document: ["+documentKey+"]("+docURL+")\n";
	if(contributor_usernames.length>0){
		body += "Contributors: ";
		for(var i=0;i<contributor_usernames.length; ++i){
			if(contributor_usernames[i]!=null && 
				contributor_usernames[i].length>1 &&
				!contributor_usernames[i].startsWith("http")){
				body += "@"+contributor_usernames[i] + " "
			}
		}
		body += "\n";
	}
	body = encodeURIComponent(body);
	var url = "https://github.com/CHIELDOnline/CHIELD/issues/new?title="+title+"&body="+body+"&labels=data";
	window.open(url);
}

function openDiscussionHistory(){
	url = "https://github.com/CHIELDOnline/CHIELD/issues?q="+documentKey;
	window.open(url);
}

function showContributors(obj){
	console.log(obj);

	var t = "Contributed to CHIELD by: ";

	for(var i=0;i<obj.length;++i){
		if(obj[i].username!=null && obj[i].username.length>1){
			if(obj[i].username.startsWith('http')){
				t += '<a href="'+obj[i].username+'">'+obj[i].realname+"</a>";
			} else{
				contributor_usernames.push(obj[i].username);
				t += '<a href="https://github.com/'+obj[i].username+'">'+obj[i].realname+"</a>";
			}
		} else{
			t += obj[i].realname;
		}
		if(i<(obj.length-1)){
			t += "; ";
		}
	}
	console.log(t);
	$("#contributors").html(t);

}

function editDocumentData(){
	var url = "addData.html?document="+documentKey;
	window.open(url);
}

$(document).ready(function(){
	$("#quoteDiv").hide();
	$("#bibtexsource").hide();	
	$("#header").load("header.html", function(){
		$("#AuthorsHREF").addClass("active");
	}); 


	network_options.layout = document_network_layout_options;
	network_options.physics = document_network_physics_options;
	//network_options.edges.smooth = false;

    console.log(network_options);

	initialiseNetwork();
	network.on("click", network_on_click);

	authorName = decodeURI(getUrlParameter('author'));
	$("#authorTitle").html(authorName);
	if(authorName!=''){
		//requestRecord("php/getDoc.php", "key="+documentKey,'bib');
		preparePage("links_table","");
		requestRecord("php/getLinksForAuthor.php", "key="+authorName,'links');
		
		// docs are requested after receiving links		

		requestRecord("php/getCoauthors.php", "key="+authorName,'coauthors');
		setupColumnSearching("coauthors_table");
		
		requestRecord("php/getAuthorCollaborators.php", "key="+authorName,'collaborators');
		setupColumnSearching("collaborators_table");
	} else{
		// TODO: display no data message
		console.log("no data");
	}

	$( "#mynetwork" ).resizable();
});


function network_on_click (params){
	if(params["edges"].length ==1 && params["nodes"].length==0){
		var edgeId = params["edges"][0];
		for(var i=0; i < doc_causal_links.length;++i){
			if(doc_causal_links[i].pk == edgeId){
				var notes = doc_causal_links[i].Notes
				if(notes!=null && notes.length>0){
					openQuote(doc_causal_links[i].Notes);
				}else{
					closeQuote();
				}
				break;
			}
		} 
	} else{
			closeQuote();
		}
}