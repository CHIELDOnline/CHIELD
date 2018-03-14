// Single record

// TODO: getLinksForDoc - prepare database

var bibtexVisible = false;

var documentKey = "";
var shortCite = "";

tableId = "links_table";
dtableConfig = {
		ordering: true,
        lengthChange: false,
        autoWidth: true,
        //fixedColumns: {leftColumns: 3},
    	columnDefs: [
    		{
    			// Colour stage background (see vis_network_utils for `stageColours` definition)
	    		targets: 5,
	    		createdCell: function (td, cellData, rowData, row, col) {
	    			var stageCol = stageColours[cellData]
	    			if(stageCol!==undefined){
	    				$(td).css('background-color', stageCol);
	    			}
	    		}
	  		},
            //{ width: "2%", targets: 1 }, //  try to change relation column width?
            { targets: 8,
				 // Render the notes function as a button that reveals the
				 // note in a seperate div
				  "render": function ( data, type, row, meta ) {
				  if(type === 'display'){
				  	 if(data!=null){
					  	 // hide double quotes etc. and escape single quotes
					  	 data = encodeURI(data).replace(/[']/g, escape);
					  	 if(data.length>0){
					     	data =  '<button class="btn btn-primary" onclick=\"openQuote(\'' + 
					     									data + '\')\">Quote</button>';
					 	 	} 
					 	 }
				     }
			      return(data);
				  }
			  }
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
		updateLinksTable(response); // should pass string 
		redrawGUIfromObject(JSON.parse(response)); //should pass object
	}
	if(type=="contributors"){
		response = JSON.parse(response);
		showContributors(response);
	}
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

function openSource(){
	var documentYear = getYear();
	var decade = (Math.floor(documentYear/10)*10)+"s";
	var url = "https://github.com/CHIELDOnline/CHIELD/tree/master/data/tree/documents/" +
		decade + "/" + documentYear + "/" + documentKey;
	window.open(url);
}


function raiseIssue(){
	var title = encodeURIComponent("Issue with "+shortCite);
	var body = encodeURIComponent("Document Key:"+documentKey);
	var url = "https://github.com/CHIELDOnline/CHIELD/issues/new?title="+title+"&body="+body;
	window.open(url);
}

function showContributors(obj){
	console.log(obj);

	var t = "Contributed to CHIELD by: ";

	for(var i=0;i<obj.length;++i){
		if(obj[i].username!=""){
			t += '<a href="https://github.com/'+obj[i].username+'">'+obj[i].realname+"</a>";
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
		$("#DocumentsHREF").addClass("active");
	}); 


	network_options.layout = document_network_layout_options;
	network_options.physics = document_network_physics_options;

    console.log(network_options);

	initialiseNetwork();

	documentKey = getUrlParameter('key');
	if(documentKey!=''){
		requestRecord("php/getDoc.php", "key="+documentKey,'bib');
		preparePage(tableId,"");
		requestRecord("php/getLinksForDoc.php", "key="+documentKey,'links');
		requestRecord("php/getContributorsForDoc.php", "key="+documentKey,'contributors');
	} else{
		// TODO: display no data message
		console.log("no data");
	}
});
