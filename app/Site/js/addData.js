// TODO: autocomplete on jsgrid input tags: https://jqueryui.com/autocomplete/    
// TODO: add process and subtype?
// TODO: make sure bibref has no illegal characters
// TODO: check that JSONtoCSV actually works with escaping quotes
// TODO: Sort styling of bibtex reference div
// TODO: Start on graphical interface for links


var characterLengthLimit = 7800;

var existingVariables = [];
var tmpVariables = []; // loaded from cookie

var relationTypes = [
	{ Name: ">", Id: ">" },
	{ Name: "<=>", Id: "<=>" },
	{ Name: "~=", Id: "~=" },
	{ Name: ">>", Id: ">>" },
	{ Name: "/=", Id: "/="},
	{ Name: "~~", Id: "~~"}
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
var contributor_realName = "Sean Roberts";

var CHIELDVersion = "";

function prepareTable(){

    $("#jsGrid").jsGrid({
        width: "100%",
        height: "400px",
 
        inserting: true,
        editing: true,
        sorting: true,
        paging: false,
 
        data: [],
 
        fields: dataHeaders,

        onItemUpdated: gridUpdated,
        onItemInserted: redrawGUIfromGrid,
        onItemDeleted: redrawGUIfromGrid
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

	// get list of variables that are new to the database
	var newVars = [];
	for(var i=0;i<data.length;++i){
		// check if it's a new variable
		if($.inArray(data[i].Var1, existingVariables)==-1){
			if($.inArray(data[i].Var1, newVars)==-1){
				newVars.push(data[i].Var1);
			}
		}
		if($.inArray(data[i].Var2, existingVariables)==-1){
			if($.inArray(data[i].Var2, newVars)==-1){
				newVars.push(data[i].Var2);
			}
		}
	}
	// save new variables to cookie
	saveTempVariablesToCookie(newVars);

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


		// get list of variables that are new to the database
		var newVars = [];
		for(var i=0;i<data.length;++i){
			// check if it's a new variable
			if($.inArray(data[i].Var1, existingVariables)==-1){
				// check it's not already in newVars
				if($.inArray(data[i].Var1, newVars)==-1){
					newVars.push(data[i].Var1);
				}
			}
			// same for var 2
			if($.inArray(data[i].Var2, existingVariables)==-1){
				if($.inArray(data[i].Var2, newVars)==-1){
					newVars.push(data[i].Var2);
				}
			}
		}
		// save new variables to cookie
		saveTempVariablesToCookie(newVars);


		// Add the bibref to every line
		for(var i=0; i < data.length; ++i){
			data[i].bibref = bib_key;
		}
		var csvtext = JSONToCSVConvertor(data, true);
	
		// TODO: Validate bib source
	
		var bib_source_processed = bib_source.replace(new RegExp("\n", 'g'), "--newline--");
		
	
		var bibtex_data = bib_key+"\n"+bib_year+"\n"+bib_source_processed+"\n";
		
		// TODO: add date
		var contributor_data = contributor+"\t"+contributor_realName;

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
		// TODO: show bibtex tab
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
	existingVariables = vars;
	// Add variables from cookie
	existingVariables = existingVariables.concat(tmpVariables);

	// Add suggestions to "add" input
	$("#searchVariablesToAdd").autocomplete({
			source:filterWithMaxLengthLimit
		});
	$("#searchVariablesToAdd_dynamic").autocomplete({
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

function gridUpdated(item){
	console.log(item);
	// The only things that will affect the network are:
	// Variable names
	// Direction / type of arrow

	
	var newItem = item.item;
	var oldItem = item.previousItem;

	console.log(newItem.Var1);
	console.log(oldItem.Var1);

	// TODO: check that new var1 is not equal to new Var2 
	// (i.e. we're not adding a link to itself)

	var fields = ["Var1",'Var2'];
	for(var i=0;i<fields.length;++i){
		var field = fields[i];
		// Check if node names have changed
		if(newItem[field]!= oldItem[field]){
			// Update the GUI
			
			
			var numAppearancesOld = variableAppearancesInGrid(oldItem[field]);
			var numAppearancesNew = variableAppearancesInGrid(newItem[field]);

			if(numAppearancesOld==1 && numAppearancesNew==0){
				// only one appearance, so just change the label
				networkUpdateNodeName(oldItem[field], newItem[field]);
			} else{
				// We also need to change the node name in all the other entries
				// Give option not to do this
				if (confirm('Update variable change for all rows?')) {
					updateGridVariables(oldItem[field], newItem[field]);
					networkUpdateNodeName(oldItem[field], newItem[field]);
				} else{
					// we're not updating all entires of a variable, so actually we need to create a new node
					// Maybe just compeletely re-draw the vis graph based on the current gridData.
					redrawGUIfromGrid();
				}
			}
		}
	}
	

	if(newItem.Relation != oldItem.Relation){
		// For now, just take the easy option:
		redrawGUIfromGrid();
	}

}

function variableAppearancesInGrid(varName){
	var varCount = 0;
	for(var row=0; row < $('#jsGrid').data().JSGrid.data.length; ++row){
		if($('#jsGrid').data().JSGrid.data[row].Var1==varName){
			varCount += 1;
		}
		if($('#jsGrid').data().JSGrid.data[row].Var2==varName){
			varCount += 1;
		}
	}
	return(varCount);
}


function updateGridVariables(oldItem,newItem){
	// go through data and change all instances

	for(var row=0; row < $('#jsGrid').data().JSGrid.data.length; ++row){
		if($('#jsGrid').data().JSGrid.data[row].Var1==oldItem){
			$('#jsGrid').data().JSGrid.data[row].Var1 = newItem;
		}
		if($('#jsGrid').data().JSGrid.data[row].Var2==oldItem){
			$('#jsGrid').data().JSGrid.data[row].Var2 = newItem;
		}
	}
	// update grid
	$("#jsGrid").jsGrid("refresh");
}

// The autocomplete helps avoid errors, but new variables won't be included
// in the database until it is updated.
// So we store newly created variables in a cookie, and add them to the 
// list of existingVariables.  If the version number (the database has been 
// updated), then we clear the cookie list.
function loadTempVariablesFromCookie(){
	var cookieVariables = Cookies.get('tmp.variables');
	if(! (cookieVariables === undefined)){
		cookieVariables = JSON.parse(cookieVariables);
		console.log("cookies");
		console.log(cookieVariables);
		for(var i=0; i<cookieVariables.length; ++i){
			tmpVariables.push(cookieVariables[i]);
		}
	}
	// now we can request the full list of variables from the server.
	requestVariablesFromServer("php/getVariables");
}
function saveTempVariablesToCookie(newVars){

	// update tmpVariables
	for(var i=0;i<newVars.length; ++i){
		tmpVariables.push(newVars[i]);
	}
	Cookies.set('tmp.variables', tmpVariables);
	Cookies.set('CHIELDVersion', CHIELDVersion);
}

function recieveVersion(response){
	// get the version data from the database and compare with cookie version data

	var versionObj = JSON.parse(response);
	console.log("Version");
	console.log(versionObj);


	var cookieVersion = Cookies.get('CHIELDVersion');
	
	if(cookieVersion==versionObj[0].gitRevision){
		loadTempVariablesFromCookie();
	} else{
		// there's a new version of the database since we last logged in.
		// clear variable list from cookies.
		Cookies.set('tmp.variables', []);
		// get list of variables from server
		requestVariablesFromServer("php/getVariables");
	}
	CHIELDVersion = versionObj[0].gitRevision;

	// set the 
	if(cookieVersion===undefined){
		Cookies.set("CHIELDVersion",versionObj[0].gitRevision);
	}
}


$(document).ready(function(){

	// getVersion checks whether cookies are up to date.
	// if it is, then we load temp cookies from server
	// then get the full list of variables from the server
	// if it isn't, then clear cookie variables and then get full
	// list of variables from the server
	getVersion();

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

	// clear bibtex source
	$("#bibtexsource").val("");
	// set function to submit to github on click
	$('#submitToGitHub').attr('onclick', 'submitToGitHub()');

	// Initialise the visual network
	initialiseNetwork();

	// Load username from cookie
	checkGithubUserCookie();
	
	// swich to first tab (contributor ID)
	$('#navTabs a:first').tab('show')

});

