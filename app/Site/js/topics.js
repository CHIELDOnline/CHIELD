selectNode = function(selectedNode){
	var node = $('#mytree').data('simpleTree').getSelectedNode();
    if(node){
    	if(node.leaf){
    		if(node.label!=undefined){
    			var url = "topic.html?topic="+encodeURI(node.label);
    			window.open(url);
    		}
    	} else{
            if($("#searchTopics").val()!=""){
                $("#searchTopics").val("");
                $('#mytree').data('simpleTree').clearSearch();
                $('#mytree').data('simpleTree').collapseAll();
                $('#mytree').data('simpleTree').expandTo(node);
                $('#mytree').data('simpleTree').toggleSubtree(node);
                var top = node.domLabel[0].offsetTop;
                window.scrollTo(0,top);
            } else{
                $('#mytree').data('simpleTree').toggleSubtree(node);
            }
        }
    }
}

initialiseHierarchy = function(data){

	var options = {
	    searchBox: $('#searchTopics'),
	    searchMinInputLength: 3,
	    // Number of pixels to indent each additional nesting level
        indentSize: 25,

        // Show child count badges?
        childCountShow: false,

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

