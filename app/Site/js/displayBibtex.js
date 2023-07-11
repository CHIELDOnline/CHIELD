
const Cite = require('citation-js');
// Set variables
var cite = new require('citation-js')(),
    bibopt = { format: 'string',
			type : "html",//"string";
			style : "citation-apa",
			lang : "en-US"
		  }

function displayBibtex(){
    // Update output
    cite.set($('#bibtexsource'));
    var result = $('#bibtexhtml').html(cite.get(bibopt));
    console.log("Result",result);
    var bibtexButton = document.createElement("button");
    bibtexButton.innerHTML = "Bibtex source";
    bibtexButton.className = "btn btn-link";
    bibtexButton.onclick = function(){revealBibtex();};
    var bibtexHTML = document.getElementById('bibtexhtml');
    if(bibtexHTML.children.length>0){
    	if(bibtexHTML.children[0].children.length>0){
    		bibtexHTML.children[0].children[0].appendChild(bibtexButton);
    	}
	}
  }
  
function getYear(){
	return(cite.get()[0]["issued"]["date-parts"][0][0]);
}

function bibtex2JSON(bib){
	
	try {
		var j = Cite.parse.bibtex["text"](bib);
	} catch(err) {
		return("Cannot parse bibtex file");
	}
	if(j.length==0){
		// unable to parse bibtex
		return("Cannot parse bibtex file");
	}
	return(j)
}

