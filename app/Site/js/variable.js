// Single record

// TODO: getLinksForDoc - prepare database

tableId = "links_table";
dtableConfig = {
		ordering: true,
        lengthChange: false,
        columnDefs: [
	        {
	    		targets: 5,
	    		createdCell: function (td, cellData, rowData, row, col) {
	    			switch(cellData){
	    				case "language change":
	    					$(td).css('background-color', '#28A745');
	    					break;
	    				case "cultural evolution":
	    					$(td).css('background-color', '#FFC107');
	    					break;
	    				case "coevolution":
	    					$(td).css('background-color', '#FFAF00');
	    					break;
	    				case "preadaptation":
	    					$(td).css('background-color', '#DC3545');
	    					break;
	    				default:
	    					break;
	    			}
	    		}
	  		},
            { targets: 7,
				 // Render the notes function as a button that reveals the
				 // note in a seperate div
				  "render": function ( data, type, row, meta ) {
				  if(type === 'display'){
				  	 if(data!=null){
					  	 // hide double quotes etc. and escape single quotes
					  	 data = encodeURI(data).replace(/[']/g, escape);
					  	 if(data.length>0){
					     	data =  '<button class="btn btn-primary" onclick=\"openQuote(\'' + 
					     									data + '\')\">Quote</button>';
					 	 	} 
					 	 }
				     }
			      return(data);
				  }
			  },
        	{ targets: 8,
        		// Combine reference and link
        		render: function(data,type,row, meta){
        			console.log(data);
        			console.log(row);
        			if(type==='display'){
        				if(data!=null){
        					return '<a href="document.html?key=' + row[9] +'">'+data + '</a>';
        				}
        			}
        			return(null);
        		}
        	},
        	{targets: 9, visible:false}
        ]
    };

function openQuote(text){
	text = decodeURI(text);
	$("#quoteDivText").html(text);
	$("#quoteDiv").show();
}

function closeQuote(){
	$("#quoteDivText").html("");
	$("#quoteDiv").hide();	
}

function updateRecord(response,type){
	console.log(response);
	if(type=='var'){
		var info = JSON.parse(response);
		var vname = info[0].name;
		vname = vname.charAt(0).toUpperCase() + vname.slice(1).toLowerCase()
		$("#variableTitle").html(vname);
	}
	if(type=="links"){
		updateLinksTable(response);
	}
}

var getUrlParameter = function getUrlParameter(sParam) {
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

$(document).ready(function(){

	$("#header").load("header.html", function(){
		$("#VariablesHREF").addClass("active");
	}); 

	var key = getUrlParameter('key');
	if(key!=''){
		requestRecord("php/getVar.php", "key="+key,'var');
		preparePage(tableId,"");
		requestRecord("php/getLinksForVar.php", "key="+key,'links');
	} else{
		// TODO: display no data message
		console.log("no data");
	}
});
