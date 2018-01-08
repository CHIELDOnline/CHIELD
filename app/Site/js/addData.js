// TODO: autocomplete on jsgrid input tags: https://jqueryui.com/autocomplete/    


var characterLengthLimit = 7800;

var relationTypes = [
	{ Name: ">", Id: ">" },
	{ Name: "<=>", Id: "<=>" },
	{ Name: "~=", Id: "~=" },
	{ Name: ">>", Id: ">>" }
];

var correlationTypes = [
	{ Name: "", Id: "none"},
	{ Name: "pos", Id: "pos"},
	{ Name: "neg", Id: "neg"}
];

var bib_year = "";
var bib_key = "";
var bib_source = "";

var contributor = "seannyD";

function prepareTable(){

    $("#jsGrid").jsGrid({
        width: "100%",
        height: "400px",
 
        inserting: true,
        editing: true,
        sorting: true,
        paging: false,
 
        data: [],
 
        fields: [
            { name: "Variable1", type: "text", width: 150 },
            { name: "Relation", type: "select", items: relationTypes, valueField: "Id", textField: "Name" },
            { name: "Variable2", type: "text", width: 150 },
            { name: "Correlation", type: "select", items: correlationTypes, valueField: "Id", textField: "Name" },
            { type: "control" }
        ]
    });
}

function JSONToCSVConvertor(JSONData, ShowLabel) {
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

    var CSV = '';    
    //Set Report title in first row or line

    //CSV += ReportTitle + '\r\n\n';

    //This condition will generate the Label/Header
    if (ShowLabel) {
        var row = "";

        //This loop will extract the label from 1st index of on array
        for (var index in arrData[0]) {

            //Now convert each value to string and comma-seprated
            row += index + ',';
        }

        row = row.slice(0, -1);

        //append Label row with line break
        CSV += row + '\n';
    }
    //1st loop is to extract each row
    for (var i = 0; i < arrData.length; i++) {
        var row = "";

        //2nd loop will extract each column and convert it in string comma-seprated
        for (var index in arrData[i]) {
            row += '"' + arrData[i][index] + '",';
        }

        row.slice(0, row.length - 1);

        //add a line break after each row
        CSV += row + '\n';
    }

    if (CSV == '') {        
        alert("Invalid data");
        return;
    }   

	return(CSV);    
}

function submitToGitHub_viaLink(){
	console.log("Submit");
	var data = $('#jsGrid').jsGrid('option', 'data');
	var csvtext = JSONToCSVConvertor(data, true);
	console.log(csvtext);
	
	for(var i=0; i<7;++i){
		csvtext = csvtext+"\n"+csvtext;
	}
	
	var filename = "test5.txt";
	var content = encodeURI(csvtext);
	var message = "submit";
	var description = "desc";
	
	var template = "https://github.com/seannyD/CHIELD_test/new/master/"+
	filename+"?"+
	"filename="+filename+
	"&value="+ content+
	"&message="+ message+
	"&description="+ description;
	
	console.log(template);
	
	if(template.length<characterLengthLimit){
		window.open(template, '_blank');
	} else{
		// TODO: do something if the message is too long
		alert("TOO LONG!");
	}
	
}


function submitToGitHub(){


	if(bib_key!=""){

		console.log("Submit");
		var data = $('#jsGrid').jsGrid('option', 'data');
		var csvtext = JSONToCSVConvertor(data, true);
	
		// TODO: Validate bib source
	
		var bib_source_processed = bib_source.replace(new RegExp("\n", 'g'), "--newline--");
		
	
		var bibtex_data = bib_key+"\n"+bib_year+"\n"+bib_source_processed+"\n";
	
		var data = contributor + "\n" + bibtex_data + csvtext;
	
		var params = "data="+data;

		var http = new XMLHttpRequest();
	//	var params = "lorem=ipsum&name=binny";
	//	console.log(php_link);
		http.open("POST", "php/sendNewRecord.php", true);

		//Send the proper header information along with the request
		http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

		http.onreadystatechange = function() {
		//Call a function when the state changes.
			if(http.readyState == 4 && http.status == 200) {
				console.log(http.responseText);
			}
		}
		http.send(params);
	
	}
}

function updateBib(){
	console.log("change");
	displayBibtex();
	var bib = document.getElementById("bibtexsource").value;
	var bib_object = bibtex2JSON(bib);
	if(bib_object=="Cannot parse bibtex file"){
		document.getElementById("bibtexhtml").innerHTML = "Cannot parse bibtext file";
		bib_year = "";
		bib_key = "";
		bib_source = "";
	} else{
		bib_year = bib_object[0].properties.year;
		bib_key = bib_object[0].label;
		bib_source = bib;
	}
}

$(document).ready(function(){
	// make causal links table
	prepareTable();
	// assign function to update bibtex
	$("#bibtexsource").change(function(){
    	updateBib();
	}); 
	$("#bibtexsource").keyup(function(){
    	updateBib();
	}); 
	$('#submitToGitHub').attr('onclick', 'submitToGitHub()');
});

