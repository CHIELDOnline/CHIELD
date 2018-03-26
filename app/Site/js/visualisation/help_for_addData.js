

var helpTexts = {
	click_to_add:"Double-click in this space to add a variable",
	type_variable:"Type a new variable name, or choose an existing one, then press enter",
	click_to_add_again:"Double-click to add another variable",
	draw_connection:"Click one variable, then another to draw a link between them",
	use_table: "Use the table below to add more details"
}



function drawHelp(ctx){
	
	helpText = getHelpText();
	if(helpText!==undefined && helpText!=""){
		ctx.save();
		// set origin so that text always appears in top right and correct scale
		ctx.setTransform(1, 0, 0, 1, 0, 0); 
		ctx.font = "22px Arial";
		ctx.fillStyle = "lightgray";
		ctx.fillText(helpText,10,50);
		// reset the origin and scale
		ctx.restore();
	}

}

function getHelpText(){

	if(network_nodes.length==0){
		if($("#searchVariablesToAdd_dynamic").is(":visible")){
			return(helpTexts.type_variable);
		} else {
			return(helpTexts.click_to_add);
		}
	}

	if(network_nodes.length==1){
		return(helpTexts.click_to_add_again);
	}

	if(network_nodes.length==2){
		if(network_edges.length==1){
			return(helpTexts.use_table)
		} else{
			return(helpTexts.draw_connection);
		}
	}

	return("");
}