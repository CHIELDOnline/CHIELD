
function saveCanvasAsPNG(){
	
	var canvas = document.getElementsByTagName("canvas")[0];

	var link = document.createElement('a');
	link.style.display = 'none';
	link.href = canvas.toDataURL();
	link.download = "CausalLinks.png"
	document.body.appendChild(link);
  	link.click();
 	document.body.removeChild(link);
}

function saveDataAsCSV(){
	var table = $("#links_table").DataTable();
	var csvData = datatableToCSV(table);
	var encodedUri = "data:text/csv;charset=utf-8,"+encodeURIComponent(csvData);

	var link = document.createElement('a');
	link.style.display = 'none';
	link.href = encodedUri;
	link.download = "CausalLinks.csv"
	document.body.appendChild(link);
  	link.click();
 	document.body.removeChild(link);
}

function saveDataAsDOT(includePos = false,directed = true){
	var dotData = visGraphToDot(network,network_nodes,network_edges,includePos,directed);
	var encodedUri = "data:text/csv;charset=utf-8,"+encodeURIComponent(dotData);

	var link = document.createElement('a');
	link.style.display = 'none';
	link.href = encodedUri;
	link.download = "CausalLinks.dot"
	document.body.appendChild(link);
  	link.click();
 	document.body.removeChild(link);
}


function saveDataAsDagitty(){
	var dagittyFormat = visGraphToDagitty(network,network_nodes,network_edges,includePos=true);

	$("body").append(
	        '<div class="alert alert-success alert-dismissable" style="position:fixed;top:20%;left:10%">'+
	            '<button type="button" class="close" ' + 
	                    'data-dismiss="alert" aria-hidden="true">' + 
	                '&times;' + 
	            '</button>' + 
	            '<p>Paste the following into the "model code" window at <a href="http://www.dagitty.net/dags.html" target="_blank">http://www.dagitty.net/dags.html</a></p>' + 
	            '<textarea cols="100" rows=12>' + 
	            dagittyFormat +
	            "</textarea>" +
	         '</div>');

}

function saveDataAsPhylopath(){
	var phylopath = makePhylopath();

	$("body").append(
	        '<div class="alert alert-success alert-dismissable" style="position:fixed;top:20%;left:10%">'+
	            '<button type="button" class="close" ' + 
	                    'data-dismiss="alert" aria-hidden="true">' + 
	                '&times;' + 
	            '</button>' + 
	            '<p>Paste the following into your R script. (note that this only includes simple ">" causal connections)</p>' + 
	            '<textarea cols="100" rows=12>' + 
	            phylopath +
	            "</textarea>" +
	         '</div>');
}

function getExploreLink(){
	return(
		"https://chield.excd.org/explore.html?links=" + 
			network_edges.getIds().join(",")
			);
}