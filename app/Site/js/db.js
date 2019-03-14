var tableId;
var php_link;
var dtableConfig;
var dtable;


function preparePage(tableIdX,php_linkX){
	tableId = tableIdX;
	if(php_link!=""){
		php_link = php_linkX;
	}
	setupColumnSearching(tableId);

}

function setupColumnSearching(tableIdX){
	if(true){
		$('#'+tableIdX+' tfoot th').each( function () {
	        var title = $(this).text();
	        //$(this).attr("id","Search_"+title);
	        if(title=="Cor" || title=="Relation" || title=="Confirmed"){
	        	$(this).html( '<input type="text" placeholder="Search" style="width:50px"/>' );
	        } else{
	        	if(title=="Notes"){
	        		$(this).html( '<input type="text" placeholder="Search" style="width:100%"/>' );
	        	} else{
	        		$(this).html( '<input type="text" placeholder="Search" style="width:100%"/>' );
	        		//$(this).html( '<input type="text" placeholder="Search" />' );
	        	}
	        }
	    } );
	}
}

function editData(data){
	// Hook to edit data
	return(data);	
}

function ObjectToArrayOfArrays(obj){
	var objectArray = [];
	for(i in obj){
		var obj_item = [];
		for(key in obj[i]) {
    		if(obj[i].hasOwnProperty(key)) {
        		obj_item.push(obj[i][key]);
        	}
    	}
		objectArray.push(obj_item);
	}
	return(objectArray)
}



function updateLinksTable(text){

	var links = JSON.parse(text);
	// DataTable wants an array of arrays, so convert:
	var links2 = ObjectToArrayOfArrays(links);

	//console.log(links2.slice(0,4));

	links2 = editData(links2);

	//console.log("post edit");
	//console.log(links2);	
	
	dtable_config = $.extend({data:links2},dtableConfig);
	
	dtable = $('#'+tableId).DataTable(dtable_config);
	
	// Add column searching
    dtable.columns().every( function () {
        var that = this;
 		if(that.visible()){
	        $( 'input', this.footer() ).on( 'keyup change', function () {
	            if ( that.search() !== this.value.trim() ) {
	                that
	                    .search( this.value.trim() )
	                    .draw();
	            }
	        } );
    	}
    } );
    $('#'+tableId+' tfoot tr').appendTo('#'+tableId+' thead');
    document.getElementById(tableId+'_filter').style.display = "none";
}

function requestVariablesFromServer(php_link){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
		   // Typical action to be performed when the document is ready:
		   recieveVariablesFromServer(xhttp.responseText);
	      // addSearchHeaders();
		}
	};
	xhttp.open("GET", php_link, true);
	xhttp.send();
}

function recieveVariablesFromServer(response){
	console.log("Override me");
}

function requestLinks(php_link, tableId){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
		   // Typical action to be performed when the document is ready:
		   updateLinksTable(xhttp.responseText);
	      // addSearchHeaders();
		}
	};
	xhttp.open("GET", php_link, true);
	xhttp.send();
}

function updateRecord(response, type){
	// override this
}

function recieveVersion(response){
	// override this
}

function getVersion(){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
		   // Typical action to be performed when the document is ready:
		   recieveVersion(xhttp.responseText);
	      // addSearchHeaders();
		}
	};
	xhttp.open("GET", "php/getVersion.php", true);
	xhttp.send();
}


function requestRecord(php_link,params, type){
	
	var http = new XMLHttpRequest();
//	var params = "lorem=ipsum&name=binny";
	console.log(php_link);
	http.open("POST", php_link, true);

	//Send the proper header information along with the request
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	http.type = type;

	http.onreadystatechange = function() {
	//Call a function when the state changes.
		if(http.readyState == 4 && http.status == 200) {
			updateRecord(http.responseText,  http.type);
		}
	}
	http.send(params);
}


function pageCounter(ignoreParameters=true){
	var http = new XMLHttpRequest();
	http.open("POST", "php/pageCounter.php", true);
	//Send the proper header information along with the request
	http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

	var pageLocation = window.location.href;
	if(ignoreParameters){
		pageLocation= pageLocation.split('?')[0];
	}

	http.send("page="+pageLocation);
}