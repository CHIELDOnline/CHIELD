// ------------------------------------------- //
//          COOKIES for addData.html
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
	// TODO: Can we be more efficient and trigger this in recieveVersion() only?
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
