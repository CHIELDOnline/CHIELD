function initialiseFileUpload() {

    // The event listener for the file upload
    document.getElementById('txtFileUpload').addEventListener('change', uploadCSV, false);
}
// Method that checks that the browser supports the HTML5 File API
function browserSupportFileUpload() {
    var isCompatible = false;
    if (window.File && window.FileReader && window.FileList && window.Blob) {
    isCompatible = true;
    }
    return isCompatible;
}

// Method that reads and processes the selected file
function uploadCSV(evt) {
if (!browserSupportFileUpload()) {
    alert('The File APIs are not fully supported in this browser!');
    } else {
        var data = null;
        var file = evt.target.files[0];
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function(event) {
            var csvData = event.target.result;
            data = $.csv.toArrays(csvData);
            if (data && data.length > 0) {
              csvToGrid(data);
            } 
        };
        reader.onerror = function() {
            alert('Unable to read ' + file.fileName);
        };
    }
}

function csvToGrid(data){
    console.log(data);
    var header = data[0];
    var json = []
    for(var i=1;i<data.length;++i){
        var row = {}
        var hasData = false;
        for(var j=0; j<header.length;++j){
            row[header[j]] = data[i][j];
            if(data[i][j].length>0){
                hasData = true;
            }
        }
        if(hasData){
            json.push(row);
        }
    }
    console.log(json);
    $("#jsGrid").jsGrid("option", "data", json);
    redrawGUIfromGrid();

}