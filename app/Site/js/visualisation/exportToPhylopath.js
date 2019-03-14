/*models <- define_model_set(
  one   = c(RS ~ DD),
  two   = c(DD ~ NL, RS ~ LS + DD),
  three = c(RS ~ NL),
  four  = c(RS ~ BM + NL),
  five  = c(RS ~ BM + NL + DD),
  six   = c(NL ~ RS, RS ~ BM),
  seven = c(NL ~ RS, RS ~ LS + BM),
  eight = c(NL ~ RS),
  nine  = c(NL ~ RS, RS ~ LS),
  .common = c(LS ~ BM, NL ~ BM, DD ~ NL)
)*/


makePhylopath = function(){

	// Get list of documents
	var docs = {};
	var ids = network_edges.getIds();
  	for(var i=0; i<ids.length; ++i){
  		var edge = network_edges.get(ids[i]);

  		// only look at simple causal effects
  		if(edge.causal_relation==">"){
	    	var cite = edge.citation;
	    	if(cite === undefined){
	    		// Maybe we're on a "document" page
	    		cite = shortCite;
	    	}
	    	if($.inArray(cite,Object.keys(docs))==-1){
	    		docs[cite] = {};
	    	}

	    	var parentLabel = makePhylopathLabels(network_nodes.get(edge.from).label);
	    	var childLabel = makePhylopathLabels(network_nodes.get(edge.to).label);

	    	// Build dictionary of the children of each parents
	    	if($.inArray(parentLabel,Object.keys(docs[cite]))==-1){
	    		docs[cite][parentLabel] = [];
	    	}
	    	docs[cite][parentLabel].push(childLabel)
	    }
    }

    var modelList = [];
    var docList = Object.keys(docs);
    for(var i=0;i<docList.length;++i){
    	var cite = docList[i];
    	var edges = docs[cite];
    	var formula = makePhylopathModelFormula(cite,edges);
    	modelList.push(formula);
    }

    var phylopath = "models <- define_model_set(\n  " +
    					modelList.join(",\n  ") + "\n)";
	return(phylopath);

}

makePhylopathLabels = function(label){
	label = label.replace(/ /g, ".");
	label = label.replace(/:/g, ".");
	label = label.replace(/\.+/g, ".");
	label = label.replace(/[-,&\(\)']/g, "");
	return(label);
}

makePhylopathModelTitle = function(label){
	return(label.replace(/[, &\(\)\.'-]/g, ""));
}

makePhylopathModelFormula = function(cite,edges){

	var parents = Object.keys(edges);
	var parentFormulas = [];
	for(var i=0;i<parents.length;++i){
		var parent = parents[i];
		var children = edges[parent];
		parentFormulas.push(parent + " ~ " +children.join(" + "));
	}

	var formula = makePhylopathModelTitle(cite) + 
				     " = c(\n    " + parentFormulas.join(",\n    ") + " )";

	return(formula);

}