// Single record

// TODO: getLinksForDoc - prepare database

tableId = "links_table";
dtableConfig = {
		ordering: false,
        lengthChange: false,
    	columnDefs: [
            { width: 50, targets: 1 } //  try to change relation column width?
        ]
    };

function updateRecord(response,type){
	console.log("updateRecord "+type);
	if(type=="bib"){
		response = JSON.parse(response);
		console.log(response[0].record + "TYPE:"+type);
		document.getElementById('bibtexsource').value = response[0].record;
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

$(document).ready(function(){

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
