var tableId;
var php_link;
var dtableConfig;
var dtable;


function preparePage(tableIdX,php_linkX){
	tableId = tableIdX;
	php_link = php_linkX;
	// set up column searching
	$('#'+tableId+' tfoot th').each( function () {
        var title = $(this).text();
        $(this).html( '<input type="text" placeholder="Search '+title+'" />' );
    } );

}

function editData(data){
	// Hook to edit data
	return(data);	
}	



function updateLinksTable(text){

	var links = JSON.parse(text);
	// DataTable wants an array of arrays, so convert:
	var links2 = [];
	for(i in links){
		links2.push(Object.values(links[i]));
	}

	console.log(links2.slice(0,4));

	links2 = editData(links2);
	
	
	dtable_config = $.extend({data:links2},dtableConfig);
	
	dtable = $('#'+tableId).DataTable(dtable_config);
	
	// Add column searching
    dtable.columns().every( function () {
        var that = this;
 
        $( 'input', this.footer() ).on( 'keyup change', function () {
            if ( that.search() !== this.value ) {
                that
                    .search( this.value )
                    .draw();
            }
        } );
    } );
    $('#'+tableId+' tfoot tr').appendTo('#'+tableId+' thead');
    document.getElementById(tableId+'_filter').style.display = "none";
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

function updateRecord(response){
	// overwrite this
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
			updateRecord(http.responseText,http.type);
		}
	}
	http.send(params);
}
