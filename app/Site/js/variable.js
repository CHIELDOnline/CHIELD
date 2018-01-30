// Single record

// TODO: getLinksForDoc - prepare database

tableId = "links_table";
dtableConfig = {
		ordering: true,
        lengthChange: false
    };

function updateRecord(response,type){
	console.log(response);
	if(type=='var'){
		var info = JSON.parse(response);
		var vname = info[0].name;
		vname = vname.charAt(0).toUpperCase() + vname.slice(1).toLowerCase()
		$("#variableTitle").html(vname);
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
		$("#VariablesHREF").addClass("active");
	}); 

	var key = getUrlParameter('key');
	if(key!=''){
		requestRecord("php/getVar.php", "key="+key,'var');
		preparePage(tableId,"");
		requestRecord("php/getLinksForVar.php", "key="+key,'links');
	} else{
		// TODO: display no data message
		console.log("no data");
	}
});
