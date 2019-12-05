selectNode = function(selectedNode){
	var node = $('#mytree').data('simpleTree').getSelectedNode();
	if(node.leaf){
		if(node.label!=undefined){
			var url = "topic.html?topic="+encodeURI(node.label);
			window.open(url);
		}
	}
}

initialiseHierarchy = function(data){

	var options = {
	    searchBox: $('#searchTopics'),
	    searchMinInputLength: 2,
	    // Number of pixels to indent each additional nesting level
        indentSize: 25,

        // Show child count badges?
        childCountShow: true,

        // Symbols for expanded and collapsed nodes that have child nodes
        symbols: {
            collapsed: '▶',
            expanded: '▼'
        },

        // these are the CSS class names used on various occasions. If you change these names, you also need to provide the corresponding CSS class
        css: {
            childrenContainer: 'simpleTree-childrenContainer',
            childCountBadge: 'simpleTree-childCountBadge badge badge-pill badge-secondary',
            highlight: 'simpleTree-highlight',
            indent: 'simpleTree-indent',
            label: 'simpleTree-label',
            mainContainer: 'simpleTree-mainContainer',
            nodeContainer: 'simpleTree-nodeContainer',
            selected: 'simpleTree-selected',
            toggle: 'simpleTree-toggle'
        }
	};

	$('#mytree').simpleTree(options, [data]).on('simpleTree:change', selectNode)
}

$(document).ready(function(){

	$("#header").load("header.html", function(){
		$("#TopicsHREF").addClass("active");
	}); 

	$.getJSON("json/topicHierarchy.json",initialiseHierarchy,function(X){console.error(X)});
});

