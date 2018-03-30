// Functions for submitting files to github through the server-side python script


function submitToGitHub(){

	$("#ContributorAlert").hide();
	$("#ReferenceAlert").hide();
	$("#CausalLinksAlert").hide();

	if(validateSubmission()){// also updates bib

		$("#submissionResults").html("Submitting...");
		$("#submitToGitHub").hide();

		console.log("Submit");
		// Deep copy data to avoid changing grid object
		var data = JSON.parse(JSON.stringify($('#jsGrid').jsGrid('option', 'data')));


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


function finishedSubmission(obj){
	var link = obj.responseText;
	if(link!==undefined && link.startsWith("https")){
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



// -------------------------- //

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
