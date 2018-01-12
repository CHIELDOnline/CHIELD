// TODO: autocomplete on jsgrid input tags: https://jqueryui.com/autocomplete/    
// TODO: add process and subtype?
// TODO: make sure bibref has no illegal characters
// TODO: check that JSONtoCSV actually works with escaping quotes
// TODO: Sort styling of bibtex reference div
// TODO: Start on graphical interface for links


var characterLengthLimit = 7800;

var existingVariables = [];

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

var stageTypes = [
	{Name: "", Id: "none"},
	{Name:"preadaptation", Id: "preadaptation"},
	{Name:"coevolution", Id: "coevolution"},
	{Name:"cultural evolution", Id: "cultural evolution"},
	{Name:"language change", Id: "language change"}
];

var confirmTypes = [
	{Name: "", Id: "none"},
	{Name:"yes", Id: "yes"},
	{Name:"no", Id: "no"}
];


var dataHeaders = [
            { name: "Var1", type: "text", width: 150 },
            { name: "Relation", type: "select", items: relationTypes, valueField: "Id", textField: "Name" },
            { name: "Var2", type: "text", width: 150 },
            { name: "Cor", type: "select", items: correlationTypes, valueField: "Id", textField: "Name" },
            { name: "Topic", type: "text", width: 150 },
            { name: "Stage", type: "select", items: stageTypes, valueField:"Id", textField: "Name"},
			{ name: "Type", type: "text", width: 150 },
			{ name: "Confirmed", type: "select", items: confirmTypes, valueField: "Id", textField: "Name" },
			{ name: "Notes", type: "text", width: 150 },
            { type: "control" }
        ]



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
 
        fields: dataHeaders
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

        row = row.slice(0, row.length - 1);

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
	// Add the bibref to every line
	for(var i=0; i < data.length; ++i){
		data[i].bibref = bib_key;
	}
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

	updateBib();

	if(bib_key!=""){

		$("#submissionResults").html("Submitting...");
		$("#submitToGitHub").hide();

		console.log("Submit");
		var data = $('#jsGrid').jsGrid('option', 'data');
		// Add the bibref to every line
		for(var i=0; i < data.length; ++i){
			data[i].bibref = bib_key;
		}
		var csvtext = JSONToCSVConvertor(data, true);
	
		// TODO: Validate bib source
	
		var bib_source_processed = bib_source.replace(new RegExp("\n", 'g'), "--newline--");
		
	
		var bibtex_data = bib_key+"\n"+bib_year+"\n"+bib_source_processed+"\n";
		
		// TODO: add date
		var contributor_data = contributor;

		var data = contributor_data + "\n" + bibtex_data + csvtext;
	
		var params = "data="+encodeURIComponent(data);



		var http = new XMLHttpRequest();
	//	var params = "lorem=ipsum&name=binny";
	//	console.log(php_link);
		http.open("POST", "php/sendNewRecord.php", true);

		//Send the proper header information along with the request
		http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

		http.onreadystatechange = function() {
		//Call a function when the state changes.
			if(http.readyState == 4 && http.status == 200) {
				finishedSubmission(http.responseText);
			}
		}
		http.send(params);
	
	} else{
		$("#submissionResults").html("Error: There is something wrong with the bibtex file");
		$("#submitToGitHub").show();
	}
}

function updateBib(){
	console.log("change");
	$("#submissionResults").html("");
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

function finishedSubmission(link){
	if(link.startsWith("https")){
		$("#submissionResults").html(
			'Data submitted.  <a href="'+link+'" target="_blank">View the pull request</a>.'
			);
	} else{
		$("#submissionResults").html(
			'There may be an error with the submission, please check data and try again.'
			);
		$("#submitToGitHub").show();
	}
}

function filterWithMaxLengthLimit(request, response) {
		// return top 8 hits
        var results = $.ui.autocomplete.filter(existingVariables, request.term);
        response(results.slice(0, 8));
    }

function recieveVariablesFromServer(response){
	var varObj = JSON.parse(response);
	var vars = [];
	for(var i = 0; i < varObj.length;++i){
		vars.push(varObj[i].name);
	}
	//console.log("Variables");
	//console.log(vars);

	// TODO: add variables from cookie

	existingVariables = vars;

	// Add suggestions to "add" input
	$("#searchVariablesToAdd").autocomplete({
			source:filterWithMaxLengthLimit
		});


	// add suggestions to drop down:
	var gridAddButton = document.getElementsByClassName("jsgrid-button jsgrid-mode-button jsgrid-insert-mode-button")[0];
	gridAddButton.onmouseup = function(){
			// This is the Var1 input on the grid
		$("#jsGrid")[0].getElementsByTagName("input")[8].id="Var1Autocomplete";
		$("#Var1Autocomplete").autocomplete({
			source:filterWithMaxLengthLimit
			});
		$("#jsGrid")[0].getElementsByTagName("input")[9].id="Var2Autocomplete";
		$("#Var2Autocomplete").autocomplete({
			source:filterWithMaxLengthLimit
			});
	};

	
}



$(document).ready(function(){

	requestVariablesFromServer("php/getVariables");

	$("#header").load("header.html", function(){
		$("#AddDataHREF").addClass("active");
	}); 

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
	initialiseNetwork();
});

