// TODO: make sure bibref has no illegal characters
// TODO: check that JSONtoCSV actually works with escaping quotes

var submissionFinished = false;

var characterLengthLimit = 7800;

var existingVariables = [];
var tmpVariables = []; // loaded from cookie

var editingExistingData = false;

var relationTypes = [
	{ Name: ">", Id: ">" },
	{ Name: "<=>", Id: "<=>" },
	{ Name: "~=", Id: "~=" },
	{ Name: ">>", Id: ">>" },
	{ Name: "/=", Id: "/="},
	{ Name: "~", Id: "~"},
	{ Name: "^", Id: "^"}
];

var correlationTypes = [
	{ Name: "", Id: "none"},
	{ Name: "pos", Id: "pos"},
	{ Name: "neg", Id: "neg"},
	{ Name: "n-m", Id: "n-m"},
];

var studyTypeTypes = [
	{ Name: "", Id: ""},
	{ Name: "experiment", Id: "experiment"},
	{ Name: "review", Id: "review"},
	{ Name: "model", Id: "model"},
	{ Name: "simulation", Id: "simulation"},
	{ Name: "statistical", Id: "statistical"},
	{ Name: "qualitative", Id: "qualitative"},
	{ Name: "logical", Id: "logical"},
	{ Name: "hypothesis", Id: "hypothesis"},
	{ Name: "other", Id: "other"}
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

/* Attempt to add tooltips to jsgrid
tooltipHeaders = {
	Var1: "First variable",
	Relation: "Type of relation between variables",
	Var2: "Second variable",
	Cor: "Direction of correlation",
	Topic: "Research topic",
	Stage: "Evolution stage",
	Type: "Type of study (experiment, model ...)",
	Confirmed: "Did the study confirm the hypothesis?",
	Notes: "Quotes from the paper"
}

function headerTooltip(){ 
	console.log(this.name);
	console.log(tooltipHeaders[this.name]);
	return $("<div>").prop("title", tooltipHeaders[this.name]).text(this.title); 
}
// Then add "headerTemplate: headerTooltip" to dataHeaders property
*/

var dataHeaders = [
            { name: "Var1", type: "text", width: 150},
            { name: "Relation", type: "select", items: relationTypes, valueField: "Id", textField: "Name" },
            { name: "Var2", type: "text", width: 150 },
            { name: "Cor", type: "select", items: correlationTypes, valueField: "Id", textField: "Name" },
            { name: "Topic", type: "text", width: 150 },
            { name: "Stage", type: "select", items: stageTypes, valueField:"Id", textField: "Name"},
			{ name: "Type", type: "select", items: studyTypeTypes, valueField: "Id", textField: "Name", width: 150 },
			{ name: "Confirmed", type: "select", items: confirmTypes, valueField: "Id", textField: "Name" },
			{ name: "Notes", type: "text", width: 150 },
            { type: "control" }
        ]



var bib_year = "";
var bib_key = "";
var bib_source = "";

var contributor = "";
var contributor_realName = "";

var CHIELDVersion = "";




function getUrlParameter(sParam) {
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

function showTab(id){
	$('.nav-tabs a[href="#'+id+'"]').tab('show');
	$("#ContributorAlert").hide();
	$("#ReferenceAlert").hide();
	$("#CausalLinksAlert").hide();
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

	// This function is not used if possible

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
	
	var filename = bib_key;
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

function validateSubmission(){
	var valid = true;
	if(contributor ==""){
		$("#ContributorAlert").show();
		valid = false;
	}
	if(!updateBib()){// also updates bib
		$("#ReferenceAlert").show();
		valid = false;
	}
	if($("#jsGrid").data().JSGrid.data.length==0){
		$("#CausalLinksAlert").show();
		valid = false;
	}

	return(valid);
}


function submitToGitHub(){

	$("#ContributorAlert").hide();
	$("#ReferenceAlert").hide();
	$("#CausalLinksAlert").hide();

	if(validateSubmission()){// also updates bib

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
	
		var bibtex_data = bib_key+"\n"+bib_year+"\n"+bib_source+"\n";
		
		// Contributor data
		var date = Date();
		var contributor_data = contributor+"\t"+contributor_realName+"\t"+date;
		if(editingExistingData){
			contributor_data += "\tEDIT";
		}

		console.log([contributor_data,bibtex_data,csvtext]);

		var data = contributor_data + "\n" + bibtex_data + csvtext;
	
		var params = "data="+encodeURIComponent(data);

		var jdata = {
			contributor: contributor_data,
			bibtex: bibtex_data,
			csv: csvtext
				};

		$.ajax({
		    type: 'POST',
		    url: 'php/sendNewRecord.php',
		    data: {json: JSON.stringify(jdata)},
		    dataType: 'json'
		}). done(
			function(data){
				finishedSubmission(data);
			}).fail(function(data){
				finishedSubmission(data);
			});

/*		var http = new XMLHttpRequest();
		http.open("POST", "php/sendNewRecord.php", true);

		//Send the proper header information along with the request
		http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

		http.onreadystatechange = function() {
		//Call a function when the state changes.
			if(http.readyState == 4 && http.status == 200) {
				finishedSubmission(http.responseText);
			}
		}
		http.send(params);*/
	
	} else{
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
		document.getElementById("bibtexhtml").innerHTML = "Cannot parse bibtex file";
		bib_year = "";
		bib_key = "";
		bib_source = "";
		return(false);
	} else{
		bib_year = bib_object[0].properties.year;
		bib_key = bib_object[0].label;
		bib_source = bib;
		return(true);
	}
}

function offerCausalLinksAsCSV(){
	var data = $('#jsGrid').jsGrid('option', 'data');
	var csvData = JSONToCSVConvertor(data, true);
	var link = document.createElement('a');
	link.style.display = 'none';
	link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(csvData);
	link.download = "CausalLinks.csv"
	document.body.appendChild(link);
  	link.click();
 	document.body.removeChild(link);
}

function finishedSubmission(link){
	console.log(link);
	if(link.startsWith("https")){
		$("#submissionResults").html(
			'Data submitted.  <a href="'+link+'" target="_blank">View the pull request</a>.'
			);
		submissionFinished = true;

		// remove saved data
		Cookies.remove("GridSaveData");
		Cookies.remove("BibTexSaveData");
	} else{

		$("#submissionResults").html(
			'<p>There may be an error with the submission, please check data and try again.</p><p>Or you can <a href="#" onclick="offerCausalLinksAsCSV()">Download the causal links as a csv file</a> in order to work offline.</p>'
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

	// It's now safe to load other things, like for editing a document
	// (loadDataFromDocument() does nothing if there is no url parameter "document")
	loadDataFromDocument();
}


// ------------------------------------------- //
//                  COOKIES
// ------------------------------------------- //
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
	requestVariablesFromServer("php/getVariables.php");
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
		// same version as before
		loadTempVariablesFromCookie();
	} else{
		// there's a new version of the database since we last logged in.
		// clear variable list from cookies.
		Cookies.set('tmp.variables', []);
		// get list of variables from server
		requestVariablesFromServer("php/getVariables.php");
	}
	CHIELDVersion = versionObj[0].gitRevision;

	// set the version
	if(cookieVersion===undefined){
		Cookies.set("CHIELDVersion",versionObj[0].gitRevision);
	}
}

// Keep copy of grid in cookie:
function saveProgressCookie(){
	var d = $("#jsGrid").data().JSGrid.data;
	Cookies.set("GridSaveData",d);
	Cookies.set("BibTexSaveData",$("#bibtexsource").val());
	Cookies.set("editingExistingData",editingExistingData);
}

function loadProgressCookie(){
	var d = Cookies.get("GridSaveData");
	d = JSON.parse(d);
	$("#jsGrid").jsGrid("option", "data", d);

	var b = Cookies.get("BibTexSaveData");
	$("#bibtexsource").val(b);
	updateBib();
	$("#SavedDataAlert").hide();

	editingExistingData = Cookies.get("editingExistingData")=="true";

	// Show the causal links tab
	$('.nav-tabs a[href="#causal_links"]').tab('show');
	redrawGUIfromGrid();
	setTimeout("network.fit()",1000);

}

function userAcceptCookies(){
	Cookies.set("acceptCookies","YES");
	$("#CookieAlert").hide();
}

// ------------------- //
//       Editing
// ------------------- //

// Fill the grid with data from the database
//  so the user can edit stuff
function loadDataFromDocument(){
	// Check if url parameter specifies document to add from
	var documentKey = getUrlParameter('document');
	console.log(documentKey);
	if((documentKey!==undefined) && (documentKey!='')){
		editingExistingData = true;
		// request links
		requestRecord("php/getLinksForDoc.php", "key="+documentKey,'links');
		// request bib data
		requestRecord("php/getDoc.php", "key="+documentKey,'bib');
	}
}

function updateRecord(response, type){
	if(type=='bib'){
		// recieving bib details from server: 
		//   add to bibtexsource
		response = JSON.parse(response);
		document.getElementById('bibtexsource').value = response[0].record;
		// Update bib and key variables
		updateBib();
	}
	if(type=='links'){
		// receiving causal links details from server
		response = JSON.parse(response);
		// Add row one at a time
		for(var i=0;i<response.length;++i){
			addRowToGrid(response[i]);
		}
		// Redraw grid
		redrawGUIfromGrid();
		// Show the causal links tab
		$('.nav-tabs a[href="#causal_links"]').tab('show');
		// Hide the saved data message
		$('#SavedDataAlert').hide();
		network.fit();
	}
}

// ------------------------------------------- //

// Warn user before unloading

window.addEventListener("beforeunload", function (e) {
	if(!submissionFinished){
	    var confirmationMessage = 'It looks like you have been editing something. '
	                            + 'If you leave before saving, your changes will be lost.';

	    (e || window.event).returnValue = confirmationMessage; //Gecko + IE
	    return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
	}
});
// ------------------------------------------- //

$(document).ready(function(){

	// If the user has stuff saved in a cookie, then hide the help alert
	var cookie_user = Cookies.get('github.username');
	if(cookie_user!=undefined){
		$("#helpAlert").hide();
	}

	if(Cookies.get("GridSaveData")==undefined){
		// Ask user if they want to load old data
		$("#SavedDataAlert").hide();
	}
	if(Cookies.get("acceptCookies")!=undefined){
		$("#CookieAlert").hide();
	}

	$("#ContributorAlert").hide();
	$("#ReferenceAlert").hide();
	$("#CausalLinksAlert").hide();

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
	network_options.edges.smooth = false;
	initialiseNetwork();

	// Bind clicks to making list of variables appear
	  $( "#searchVariablesToAdd_dynamic" ).keypress(function(event) {
	  	if ( event.key == "Enter" || event.which==13 ) {
	  		addVar_dynamic();
	  		$("#searchVariablesToAdd_dynamic").hide();
	  		$("#ui-id-2").hide();
		} else{
			if ( event.key == "Escape" || event.which==27 ) {
				$("#searchVariablesToAdd_dynamic").hide();
				$("#ui-id-2").hide();
			}
		}
	  });
	$("#searchVariablesToAdd_dynamic").val("");
	$("#searchVariablesToAdd").val("");
	// Bind clicks to select network nodes
	network.on("click", network_on_click);
    network.on("doubleClick", network_on_double_click);

	// Load username from cookie
	checkGithubUserCookie();
	
	// swich to first tab (contributor ID)
	$('#navTabs a:first').tab('show');

	initialiseFileUpload();

	$("#drawLinks").attr("onclick","toggleDrawLinks()");

});

