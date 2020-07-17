/*
m_contact = bf(density ~ pop)
m_contact2 = bf(isolation ~ pop)
m_Bentz = bf(propAdults ~ pop + (1|family))
m_Ardell = bf(phon ~ pop + (1|family)) 
m_Wray = bf(diversity ~ density + isolation + (1|country)) 
m_complexity = bf(morphComplexity ~ phon + propAdults + 
             diversity + isolation + diversity + (1|family))
model1 = brm(m_contact +  m_contact2 + m_Bentz + m_ Ardell     
             m_Wray + m_complexity, data = d)
*/


makeBRMS = function(){

	// Get list of documents
	var inputs = {};
	var ids = network_edges.getIds();
  	for(var i=0; i<ids.length; ++i){
  		var edge = network_edges.get(ids[i]);

  		// only look at simple causal effects
  		if(edge.causal_relation==">"){

	    	var parentLabel = makePhylopathLabels(network_nodes.get(edge.from).label);
	    	var childLabel = makePhylopathLabels(network_nodes.get(edge.to).label);
			
			parentLabel = makeBRMSLabels(parentLabel)
			childLabel = makeBRMSLabels(childLabel)
			
			if($.inArray(childLabel,Object.keys(inputs))==-1){
	    		inputs[childLabel] = [];
	    	}
	    	inputs[childLabel].push(parentLabel)
	    }
    }
    
    var out = "";
    var modelDef = []
    var inputsKeys = Object.keys(inputs);
    for(var i=0;i<inputsKeys.length; ++i){
    	modelName = "m_"+inputsKeys[i];
    	lhs = inputsKeys[i];
    	rhs = inputs[inputsKeys[i]].join(" + ");
    	line = modelName + " = bf(" + lhs + " ~ " + rhs + ")";
    	out += line + "\n";
    	modelDef.push(modelName);
    }
    out += "model1 = brm(" + modelDef.join(" + ") + ")";
    
	return(out);

}

makeBRMSLabels = function(label){
	label = label.replace(/ /g, ".");
	label = label.replace(/:/g, ".");
	label = label.replace(/\.+/g, ".");
	label = label.replace(/[-,&\(\)'\/]/g, "");
	return(label);
}

