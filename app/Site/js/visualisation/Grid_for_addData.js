// onItemUpdated fires when user manually changes data, 
// or when data is changed automatically by the script.
// Changes to the network GUI need to be reflected in the
// grid, but this fires the onItemUpdated function, which
// calls the function to update the grid.
// To avoid a loop, we temporarily set a variable that marks
// whether the update has come from the script
var calledGridUpdateFromScript = false;


function prepareTable(){

    $("#jsGrid").jsGrid({
        width: "100%",
        height: "400px",
 
        inserting: true,
        editing: true,
        sorting: true,
        paging: false,
 
        data: [],
 
        fields: dataHeaders,

        onItemUpdated: gridUpdated,
        onItemInserted: redrawGUIfromGrid,
        onItemDeleted: redrawGUIfromGrid
    });
}

function gridUpdated(item){

	console.log("Update");
	console.log(calledGridUpdateFromScript);

	if(calledGridUpdateFromScript){
		// The update comes from the script, and we don't want to
		//  check for updates
		calledGridUpdateFromScript = false;  // reset variable
		return(null);
	}

	console.log(item);
	// The only things that will affect the network are:
	// Variable names
	// Direction / type of arrow

	
	var newItem = item.item;
	var oldItem = item.previousItem;

	// TODO: check that new var1 is not equal to new Var2 
	// (i.e. we're not adding a link to itself)
	if(newItem.Var1 == newItem.Var2){
		alert("Error: Cannot add link from variable to itself");
	} else{
		// Trim whitespace
		newItem.Var1 = newItem.Var1.trim();
		newItem.Var2 = newItem.Var2.trim();

		// This should be checked already by the validator
		if((!variableIsLowercaseAndNotBlank(newItem.Var1,null)) || 
			(!variableIsLowercaseAndNotBlank(newItem.Var2,null))){
			alert("Error: Variable names cannot be blank and should not be capitalised.");
		} else {
			var fields = ["Var1",'Var2'];
			for(var i=0;i<fields.length;++i){
				var field = fields[i];
				// Check if node names have changed
				if(newItem[field]!= oldItem[field]){
					// Update the GUI
					var numAppearancesOld = variableAppearancesInGrid(oldItem[field]);
					var numAppearancesNew = variableAppearancesInGrid(newItem[field]);
					console.log("OLD "+numAppearancesOld);
					console.log(numAppearancesNew);
					if(numAppearancesOld==1 && numAppearancesNew==0){
						// only one appearance, so just change the label
						networkUpdateNodeName(oldItem[field], newItem[field]);
					} else{
						// We also need to change the node name in all the other entries
						// Give option not to do this

						var message = "You changed a variable name from " + oldItem[field] +
										" to " + newItem[field] + 
										". Click 'Yes' to apply this change to all rows, or 'Cancel' to apply this change just for this link.";

						if (confirm(message)) {
							updateGridVariables(oldItem[field], newItem[field]);
							redrawGUIfromGrid();
						} else{
							// we're not updating all entires of a variable, so actually we need to create a new node
							// Maybe just compeletely re-draw the vis graph based on the current gridData.
							redrawGUIfromGrid();
						}
					}
				}
			}
			
			// Updating relation type
			if(newItem.Relation != oldItem.Relation){
				// For now, just take the easy option:
				redrawGUIfromGrid();
			}

			saveProgressCookie();
		}
	}

}

function variableAppearancesInGrid(varName){
	var varCount = 0;
	for(var row=0; row < $('#jsGrid').data().JSGrid.data.length; ++row){
		if($('#jsGrid').data().JSGrid.data[row].Var1==varName){
			varCount += 1;
		}
		if($('#jsGrid').data().JSGrid.data[row].Var2==varName){
			varCount += 1;
		}
	}
	return(varCount);
}


function updateGridVariables(oldItem,newItem){
	// go through data and change all instances

	for(var row=0; row < $('#jsGrid').data().JSGrid.data.length; ++row){
		var rowData = $('#jsGrid').data().JSGrid.data[row];
		if(rowData.Var1==oldItem){
			rowData.Var1 = newItem;
		}
		if(rowData.Var2==oldItem){
			rowData.Var2 = newItem;
		}
	}
	// update grid
	$("#jsGrid").jsGrid("refresh");

	// Update existing variables
	existingVariables.push(newItem);
	var varIndex = existingVariables.indexOf(oldItem);
	if(varIndex > -1){
		existingVariables.splice(varIndex,1);
	}
}


function addEdgeToGrid(selectedVar1,causal_relation,selectedVar2){
	// Add edge from GUI to grid

	// new row object
	var rowData = {
		Var1: selectedVar1,
		Relation: causal_relation,
		Var2: selectedVar2
	};

	// fill out rest of edge details
	var fieldNames = [];
	var fields = $("#jsGrid").jsGrid().data().JSGrid.fields;
	for(var i=3;i<fields.length;++i){
		var fieldName = fields[i].name;
		rowData[fieldName] = "";
	}

	// get node positions for later
	var currentNodePos = network.getPositions();

	// Insert into grid.
	// First, we set 'calledGridUpdateFromScript' to true
	// so the script knows not to update the GUI after the grid is updated
	calledGridUpdateFromScript = true;
	$("#jsGrid").jsGrid("insertItem", rowData).done(function() {
   			 console.log("insertion completed");
   			 calledGridUpdateFromScript = false;
		});

	// put nodes back in previous positions
	for(var i=0;i< Object.keys(currentNodePos).length;++i){
		var nodeID = Object.keys(currentNodePos)[i];
		network_nodes.update({  id:nodeID,
								x:currentNodePos[nodeID].x,
								y:currentNodePos[nodeID].y});
	}

}

function addRowToGrid(rowObj){
	//console.log("ROW OBJ");
	//console.log(rowObj);
	var fields = $("#jsGrid").jsGrid().data().JSGrid.fields;

	var gridFieldNames = ["Var1","Relation","Var2","Cor","Topic","Stage","Type","Confirmed","Notes"];
	var databaseNames = ["variable1","relation","variable2","Cor","Topic","Stage","Type","Confirmed","Notes"];

	//console.log(fields);
	var rowData = {};
	for(var i=0;i<gridFieldNames.length;++i){
		var dx = rowObj[databaseNames[i]];
		if(dx==null){
			dx = ""
		}
		rowData[gridFieldNames[i]] = dx;
	}
	//console.log("ROW DATA");
	//console.log(rowData);
	calledGridUpdateFromScript = true;
	$("#jsGrid").jsGrid("insertItem", rowData).done(function() {
    	//console.log("insertion completed");
    	calledGridUpdateFromScript = false;
	});;
}




