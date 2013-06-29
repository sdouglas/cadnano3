function SliceGrid(xg, yg, mode) {
    //grid properties
    var gridWidth = xg;
    var gridHeight = yg;
    //circle properties
    var r = 12;
    var circStroke = "#808080";
    var emptyFill = "#F0F0F0";
    var hoverFill = "#33CCFF";
    var activeFill = "#FFE400";
    //window properties
    var windowWidth;
    var windowHeight;
    if(mode === "honeycomb") {
	windowWidth = 2*r+1.732*gridWidth*r;
	windowHeight = 2*r+3*gridHeight*r;
    }
    else if(mode === "square") {
	windowWidth = 2*r+2*gridWidth*r;
	windowHeight = 2*r+2*gridHeight*r;
    }
    else {
	alert("Grid type does not exist, script aborted.");
	throw "stop execution";
    }
    //setup
    var canvasSettings = {container: "sliceView", width: windowWidth, height: windowHeight};
    var canvas = new Kinetic.Stage(canvasSettings);
    var activeHelices = new SliceStack();
    var sliceGrid = new Array(); //2d layer of layers, each with a circle
    //grid construction
    for(var i=0; i<gridWidth; i++) {
	sliceGrid[i] = new Array();
	//getting center for circles
        for(var j=0; j<gridHeight; j++) {
	    var layer = new Kinetic.Layer();
	    var centerX;
	    var centerY;
	    if(mode === "honeycomb") {
		centerX = 2*r+1.732*i*r;
		centerY = 2*r+3*j*r;
		if((i+j)%2 === 1) {
		    centerY += r;
		}
	    }
	    else {
		centerX = 2*r+2*i*r;
		centerY = 2*r+2*j*r;
	    }
	    //actually making the circle
	    var circle = new Kinetic.Circle({
		    radius: r,
		    x: centerX,
		    y: centerY,
		    fill: emptyFill,
		    stroke: circStroke,
		    strokeWidth: 1
	    });
	    //mouse actions
            circle.on("mouseenter", function() {
		    if(activeHelices.contains(this.getX(),this.getY()) === -1) {
			this.setFill(hoverFill);
			layer.draw();
			console.log("good");
		    }
	    });
            circle.on("mouseleave", function() {
		    if(activeHelices.contains(this.getX(),this.getY()) === -1) {
			this.setFill(emptyFill);
			layer.draw();
		    }
	    });
	    circle.on("click", function() {
		    if(activeHelices.contains(this.getX(),this.getY()) === -1) {
			activeHelices.add(this.getX(),this.getY());
			this.setFill(activeFill);
			//number on the circle
			var helixNum = activeHelices.stack.length-1;
			var helixNumText = new Kinetic.Text({
				x: this.getX(),
				y: this.getY()-r/2,
				text: helixNum,
				fontSize: 12,
				fontFamily: "Calibri",
				fill: "#000000",
				align: "CENTER"
			});
			helixNumText.setOffset({
				x: helixNumText.getWidth()/2
			    });
			//end: number on the circle
			layer.add(helixNumText);
			layer.draw();
		    }
	    });
	    //adding circle to array
	    layer.add(circle);
	    sliceGrid[i][j] = layer;	    
	    canvas.add(layer);
	}
    }
}