// Single record

// TODO: getLinksForDoc - prepare database

var bibtexVisible = false;

tableId = "links_table";
dtableConfig = {
		ordering: true,
        lengthChange: false,

    	columnDefs: [
            //{ width: "2%", targets: 1 }, //  try to change relation column width?
            { targets: 8,
				 // "data": "key",
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
		console.log(response[0].record + "TYPE:"+type);
		document.getElementById('bibtexsource').value = response[0].record;
		$("#documenShortCite").html(response[0].citation);
		displayBibtex();
	}
	if(type=="links"){

		updateLinksTable(response);
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

$(document).ready(function(){
	$("#quoteDiv").hide();
	$("#bibtexsource").hide();	
	$("#header").load("header.html", function(){
		$("#DocumentsHREF").addClass("active");
	}); 

	var key = getUrlParameter('key');
	if(key!=''){
		requestRecord("php/getDoc.php", "key="+key,'bib');
		preparePage(tableId,"");
		requestRecord("php/getLinksForDoc.php", "key="+key,'links');
	} else{
		// TODO: display no data message
		console.log("no data");
	}
});
