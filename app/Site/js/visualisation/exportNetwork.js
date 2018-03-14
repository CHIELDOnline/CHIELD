
function saveCanvasAsPNG(){
	
	var canvas = document.getElementsByTagName("canvas")[0];

	var link = document.createElement('a');
	link.style.display = 'none';
	link.href = canvas.toDataURL();
	link.download = "CausalLinks.png"
	document.body.appendChild(link);
  	link.click();
 	document.body.removeChild(link);
}
