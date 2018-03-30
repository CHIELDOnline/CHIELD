function JSONToCSVConvertor(JSONData, ShowLabel) {
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
    var CSV = '';
    //This condition will generate the Label/Header
    if (ShowLabel) {
        var row = "";
        //This loop will extract the label from 1st index of on array
        for (var index in arrData[0]) {
            if(index.length>0){
                //Now convert each value to string and comma-seprated
                row += '"' +index + '",';
            }
        }
        // remove trailing comma
        row = row.slice(0, -1);
        //append Label row with line break
        CSV += row + '\n';
    }
    //1st loop is to extract each row
    for (var i = 0; i < arrData.length; i++) {
        var row = "";

        //2nd loop will extract each column and convert it in string comma-seprated
        for (var index in arrData[i]) {
            if(index.length>0){
            	var cellValue = arrData[i][index];
            	if(cellValue==null){
            		cellValue = "";
            	}
            	// handle double quotes
            	cellValue = cellValue.replace(/"/g, '""');
                row += '"' + cellValue + '",';
            }
        }

        row = row.substring(0, row.length - 1);

        //add a line break after each row
        CSV += row + '\n';
    }

    if (CSV == '') {        
        alert("Invalid data");
        return;
    }   

	return(CSV);    
}

function datatableToCSV(table){

    var csvText = "";
    var header = table.columns().header();
    for(var i=0;i< header.length;++i){
        header_title = header[i].textContent;
        if(header_title!="pk"){
            csvText += '"'+header_title +'",';
        }
    }
    csvText = csvText.substring(0,csvText.length-1);
    csvText += "\n";

    var data = table.rows().data();
    // For each row
    for(var i=0;i<data.length;++i){
        var row = "";
        // for each column within a row
        for(j=0;j<data[i].length;++j){
            if(header[j].textContent!="pk"){
                cellValue = data[i][j];
                if(cellValue==null){
                    cellValue = "";
                }
                // handle double quotes
                cellValue = cellValue.replace(/"/g, '""');
                row += '"' + cellValue + '",';
            }
        }
        row = row.substring(0, row.length - 1);
        csvText += row + "\n"
    }

    return(csvText);
    
}

