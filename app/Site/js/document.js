// Single record

// TODO: getLinksForDoc - prepare database

tableId = "links_table";
dtableConfig = {
		ordering: false,
        lengthChange: false};

function updateRecord(response,type){
	response = JSON.parse(response);
	console.log(response[0].record + "TYPE:"+type);
	if(type=="bib"){
		document.getElementById('bibtexsource').value = response[0].record;
		displayBibtex();
	}
	if(type=="links"){
		
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
	var key = getUrlParameter('key');
	requestRecord("php/getDoc.php", "key="+key,'bib');
	// TODO:
	//requestRecord("php/getLinksForDoc.php", "key="+key,'bib');
});
