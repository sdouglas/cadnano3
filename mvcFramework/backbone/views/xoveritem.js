//expect a bowl of copy pasta from EndPointItem and StrandItem

var XoverNode = Backbone.View.extend({
    initialize: function(strandItem, dir, type, skipRedraw) { //last param is optional
	//accessing other objects
	this.xoveritem = undefined;
	this.parent = strandItem;
	this.phItem = this.parent.parent;
	this.layer = this.parent.layer;
	this.panel = this.parent.panel;

	//temporary layer that will be used for fast rendering
	this.tempLayer = this.phItem.parent.templayer;

	//graphics
	this.divLength = this.parent.divLength;
	this.blkLength = this.parent.blkLength;
	this.sqLength = this.parent.sqLength;

	//counters
	if(dir === "L") {
	    this.initcounter = this.parent.modelStrand.low();
	}
	else if(dir === "R") {
	    this.initcounter = this.parent.modelStrand.high();
	}
	this.counter = this.initcounter;

	//starting position
	this.centerX = this.phItem.startX+(this.counter+0.5)*this.sqLength;
	this.centerY = this.parent.yCoord;
	this.linkageX = this.centerX;
	this.linkageY = 0; //will be initialized later

	//misc. properties
	this.dir = dir;
	this.yLevel = this.parent.yLevel;
	this.prime = type;
	this.isScaf = this.parent.isScaf;

	this.group = new Kinetic.Group();
	var xStart;
	if(dir === "L") {xStart = this.centerX;}
	else {xStart = this.centerX-this.sqLength/2;}
	this.hLine = new Kinetic.Rect({
	    x: xStart,
	    y: this.centerY-1,
	    width: this.sqLength/2,
	    height: 2,
	    fill: this.parent.itemColor,
	    stroke: this.parent.itemColor,
	    strokeWidth: 1
	});
	var yStart;
	if(this.yLevel === 0) {
	    yStart = this.centerY-this.sqLength/2;
	    this.linkageY = this.centerY-this.sqLength/2;
	}
	else {
	    yStart = this.centerY-1;
	    this.linkageY = this.centerY+this.sqLength/2;
	}
	this.vLine = new Kinetic.Rect({
	    x: this.centerX-1,
	    y: yStart,
	    width: 2,
	    height: this.sqLength/2+1,
	    fill: this.parent.itemColor,
	    stroke: this.parent.itemColor,
	    strokeWidth: 1
	});

	this.group.add(this.hLine);
	this.group.add(this.vLine);
	this.layer.add(this.group);
	//this.parent.addEndItem(this,dir,skipRedraw);
    },

    updateCounter: 
    function(){
        if(this.dir === "L") {
            this.counter = this.parent.modelStrand.low();
        }
        else if(this.dir === "R") {
            this.counter = this.parent.modelStrand.high();
        }
    },
    updateCenterX: function() {
        this.centerX = this.phItem.startX+(this.counter+0.5)*this.sqLength;
    },
    updateLinkageX: function() {
        this.linkageX = this.centerX;
    },

    update: function() { 
        this.updateCounter();
        this.updateCenterX();
        this.updateLinkageX();
        this.group.setX((this.counter-this.initcounter)*this.sqLength);

        console.log('did i enter this function: ' + this.prime);
        //Delete existing xoveritem.
        if(typeof this.xoveritem !== 'undefined'){
            this.xoveritem.getRidOf();
            this.xoveritem = undefined;
        }

        //If this node is 3', then it'll 
        //create a new xover item.
        //Else does nothing.
        if(this.prime === 3){
            //get other XoverNode.
            //Create new xover item.
            var otherStrand = this.parent.modelStrand.connection3p();
            if(!otherStrand) return;

            console.log(this.parent.modelStrand);
            console.log('trying to create xoveritem');
            var phSetItem = this.phItem.parent;
            var phItem = phSetItem.getPathHelixItem(otherStrand.strandSet.helix.id);
            var otherStItem = phItem.getStrandItem(
                    otherStrand.strandSet.isScaffold(),
                    otherStrand.idx5Prime()
                );

            var otherNode;
            if(otherStrand.isDrawn5to3())
                otherNode = otherStItem.endItemL;
            else
                otherNode = otherStItem.endItemR;
            console.log(this);
            console.log(otherNode);

            this.xoveritem = new XoverItem(this, otherNode);
        }
    },

    updateY: function() { //updates Y value; should only be called from StrandItem.updateY()
	var diff = this.parent.yCoord-this.centerY;
	this.centerY = this.parent.yCoord;
        if(this.yLevel === 0) {
            this.linkageY = this.centerY-this.sqLength/2;
        }
        else {
            this.linkageY = this.centerY+this.sqLength/2;
        }
	this.group.setY(this.group.getY()+diff);
    if(this.xoveritem) this.xoveritem.update();
    },

    show: function(flag){
        this.group.setVisible(flag);
    },

    getRidOf: function(){
                  if(this.xoveritem) this.xoveritem.getRidOf();
                  this.group.removeChildren();
                  this.group.destroy();
                  this.close();
              },
});

/**
 * Creates a crossover between two locations.
 */

var XoverItem = Backbone.View.extend({
    initialize: function(n1, n2) {
	if(n1.prime === 3 && n2.prime === 5) {
	    this.node3 = n1;
	    this.node5 = n2;
	}
	else if(n1.prime === 5 && n2.prime === 3) {
	    this.node3 = n2;
	    this.node5 = n1;
	}
	else {
	    alert("A strand's endpoints must be a 3\' and a 5\'!");
	    throw "stop execution";
	}

	this.isScaf = this.node3.isScaf; //we don't need to check node5 because the strands must be both scafs or both staps
	this.helixset = this.node3.parent.parent.parent;
	this.panel = this.helixset.panel;
	this.layer = this.node3.parent.layer;
	this.finalLayer = this.helixset.finallayer;
        this.itemColor = this.node3.parent.itemColor;
	this.divLength = this.helixset.graphicsSettings.divLength;
	this.blkLength = this.helixset.graphicsSettings.blkLength;
	this.sqLength = this.helixset.graphicsSettings.sqLength;
        this.tempLayer = this.node3.tempLayer;

	this.group = new Kinetic.Group({
	    draggable: true,
            dragBoundFunc: function(pos) {
		return {
		    x: this.getAbsolutePosition().x,
		    y: this.getAbsolutePosition().y
		}
	    },
	});
	this.group.superobj = this;
	this.connection = new Kinetic.Shape({ //same trick, visible thin line + invisible rect for easy clicking
	    stroke: this.itemColor,
	    strokeWidth: 3
	});
	this.connection.superobj = this;
	this.connection.setDrawFunc(function(canvas) {
	    var context = canvas.getContext();
	    var x1 = this.superobj.node3.linkageX;
	    var y1 = this.superobj.node3.linkageY;
	    var x2 = this.superobj.node5.linkageX;
	    var y2 = this.superobj.node5.linkageY;
	    var ctrlpt = this.superobj.quadCtrlPt(x1,y1,x2,y2,this.superobj.node3.dir);
	    context.beginPath();
	    context.moveTo(x1,y1);
	    context.quadraticCurveTo(ctrlpt.x,ctrlpt.y,x2,y2);
	    canvas.stroke(this);
	});
	this.group.add(this.connection);

	this.invisConnection = new Kinetic.Rect({
	    x: Math.min(this.node3.centerX,this.node5.centerX)-this.sqLength/2,
	    y: Math.min(this.node3.centerY,this.node5.centerY)-this.sqLength/2,
	    width: Math.abs(this.node3.centerX-this.node5.centerX)+this.sqLength,
	    height: Math.abs(this.node3.centerY-this.node5.centerY)+this.sqLength,
	    fill: colours.white,
	    stroke: colours.white,
	    strokeWidth: 1,
	    opacity: 0
	});
	this.group.add(this.invisConnection);

	//path view tools
	var isScaf = this.isScaf;
        this.group.on("mousedown", function(pos) {
		var pathTool = this.superobj.node3.phItem.currDoc().pathTool;
	    if(pathTool === "select" && tbSelectArray[4] && ((isScaf && tbSelectArray[0])||(!isScaf && tbSelectArray[1]))) {
		this.superobj.selectStart(pos);
	    }
	});
        this.group.on("dragmove", function(pos) {
		var pathTool = this.superobj.node3.phItem.currDoc().pathTool;
	    if(pathTool === "select" && tbSelectArray[4] && ((isScaf && tbSelectArray[0])||(!isScaf && tbSelectArray[1]))) {
		this.superobj.selectMove(pos);
	    }
	});
        this.group.on("dragend", function(pos) {
		var pathTool = this.superobj.node3.phItem.currDoc().pathTool;
	    if(pathTool === "select" && tbSelectArray[4] && ((isScaf && tbSelectArray[0])||(!isScaf && tbSelectArray[1]))) {
		this.superobj.selectEnd(pos);
	    }
	});

	//finally moving on...
	this.layer.add(this.group);
	//selectables can function more smoothly when XoverItems (which occupy large space) is at bottom of layer
	this.group.moveToBottom();
	this.layer.draw();
    },

    update: function() { //redraws XoverItem
	this.connection.remove();
	this.connection = new Kinetic.Shape({
	    stroke: this.itemColor,
	    strokeWidth: 3
	});
	this.connection.superobj = this;
	this.connection.setDrawFunc(function(canvas) {
	    var context = canvas.getContext();
	    var x1 = this.superobj.node3.linkageX;
	    var y1 = this.superobj.node3.linkageY;
	    var x2 = this.superobj.node5.linkageX;
	    var y2 = this.superobj.node5.linkageY;
	    var ctrlpt = this.superobj.quadCtrlPt(x1,y1,x2,y2,this.superobj.node3.dir);
	    context.beginPath();
	    context.moveTo(x1,y1);
	    context.quadraticCurveTo(ctrlpt.x,ctrlpt.y,x2,y2);
	    canvas.stroke(this);
	});
	console.log(this.invisConnection);
	this.group.add(this.connection);
	this.invisConnection.setX(Math.min(this.node3.centerX,this.node5.centerX)-this.sqLength/2);
	this.invisConnection.setY(Math.min(this.node3.centerY,this.node5.centerY)-this.sqLength/2);
	this.invisConnection.setWidth(Math.abs(this.node3.centerX-this.node5.centerX)+this.sqLength);
	this.invisConnection.setHeight(Math.abs(this.node3.centerY-this.node5.centerY)+this.sqLength);
    },

    /*
      How to construct a parabola (quadratic curve): http://www.html5canvastutorials.com/tutorials/html5-canvas-quadratic-curves/
      Suppose we are given two 0-dimensional object and make an upright right triangle with them as endpoints of hypotenuse. This
      function calculates the triangle's incenter and use it as the control point of parabola. The function also takes care of a
      special case when the triangle is degenerate.
     */
    quadCtrlPt: function(x1,y1,x2,y2,dir) {
	if(x1 === x2) { //vertical case
	    if(dir === "L") {
		return {x:x1+this.sqLength/4, y:(y1+y2)/2}
	    }
	    else {
		return {x:x1-this.sqLength/4, y:(y1+y2)/2}
	    }
	}
	//deciding the 3rd point of right triangle
	var x3 = 0;
	var y3 = 0;
	if(y1 > y2) {
	    x3 = x1;
	    y3 = y2;
	}
	else if(y1 < y2) {
	    x3 = x2;
	    y3 = y1;
	}
	else { //horizontal case
	    if(dir === "L") {
		return {x:(x1+x2)/2, y:y1-this.sqLength}
	    }
	    else {
		return {x:(x1+x2)/2, y:y1+this.sqLength}
	    }
	}
	var d1 = Math.abs(x1-x2);
	var d2 = Math.abs(y1-y2);
	var d3 = Math.sqrt(d1*d1+d2*d2);
	return {
	    x: (d1*x1+d2*x2+d3*x3)/(d1+d2+d3),
	    y: (d1*y1+d2*y2+d3*y3)/(d1+d2+d3)
	}
    },

    selectStart: function(pos) {
	this.dragCounterInit = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth+this.panel.scrollLeft)/this.helixset.scaleFactor-5*this.sqLength)/this.sqLength);
	this.dragCounter = this.dragCounterInit;
	this.pDragCounter = this.dragCounter;
	this.redBox = new Kinetic.Rect({
	    x: this.invisConnection.getX(),
	    y: this.invisConnection.getY(),
	    width: this.invisConnection.getWidth(),
	    height: this.invisConnection.getHeight(),
	    fill: "transparent",
	    stroke: colours.red,
	    strokeWidth: 2,
	});
	this.redBox.superobj = this;
	this.redBox.on("mouseup", function(pos) {
	    this.remove();
	    this.superobj.tempLayer.draw();
	});
	this.tempLayer.add(this.redBox);
	this.tempLayer.draw();
    },

    selectMove: function(pos) {
	this.dragCounter = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth+this.panel.scrollLeft)/this.helixset.scaleFactor-5*this.sqLength)/this.sqLength);
	var diff = this.dragCounter-this.dragCounterInit;
	var minCounterX = Math.min(this.node3.counter,this.node5.counter);
	if(minCounterX+diff < 0) {
	    this.dragCounter = this.dragCounterInit-minCounterX;
	}
	else {
	    var maxCounterX = Math.max(this.node3.counter,this.node5.counter);
	    var grLength = this.blkLength*this.divLength*this.helixset.part.getStep();
	    if(maxCounterX+diff >= grLength) {
		this.dragCounter = this.dragCounterInit+grLength-1-maxCounterX;
	    }
	}
	if(this.dragCounter !== this.pDragCounter) {
	    this.redBox.setX(this.redBox.getX()+(this.dragCounter-this.pDragCounter)*this.sqLength);
	    this.tempLayer.draw();
	    this.pDragCounter = this.dragCounter;
	}
    },

    selectEnd: function(pos) {
	var diff = this.dragCounter - this.dragCounterInit;
	this.redBox.remove();
	this.tempLayer.draw();

	if(this.node5.dir === "L") {
	    this.node5.parent.modelStrand.resize(this.node5.counter+diff, this.node5.parent.modelStrand.high());
	}
	else {
	    this.node5.parent.modelStrand.resize(this.node5.parent.modelStrand.low(), this.node5.counter+diff);
	}
	if(this.node3.dir === "L") {
	    this.node3.parent.modelStrand.resize(this.node3.counter+diff, this.node3.parent.modelStrand.high());
	}
	else {
	    this.node3.parent.modelStrand.resize(this.node3.parent.modelStrand.low(), this.node3.counter+diff);
	}

        this.finalLayer.destroyChildren();
        this.finalLayer.draw();
    },

    show: function(flag){
        this.group.setVisible(flag);
    },

    getRidOf:
    function(){
        this.group.destroyChildren();
        this.close();
    },
});

var XoverNodeImage = Backbone.View.extend({
	initialize: function(phItem, y, x, strandItem) {
	this.stItem = strandItem;
	this.x = x;
	this.dir = y; //0 = left, 1 = right
	this.sqLength = phItem.sqLength;
	this.centerX = phItem.startX+(x+0.5)*this.sqLength;
	this.centerY = phItem.startY+(y+0.5)*this.sqLength;
	this.linkageX = this.centerX;
	this.linkageY = 0;

        var xStart;
        if(!this.dir) {xStart = this.centerX;}
        else {xStart = this.centerX-this.sqLength/2;}
        this.hLine = new Kinetic.Rect({
	    x: xStart,
	    y: this.centerY-1,
	    width: this.sqLength/2,
	    height: 2,
	    fill: colours.red,
	    stroke: colours.red,
	    strokeWidth: 1
	});
        var yStart;
        if(!y) {
            yStart = this.centerY-this.sqLength/2;
            this.linkageY = this.centerY-this.sqLength/2;
        }
        else {
            yStart = this.centerY-1;
            this.linkageY = this.centerY+this.sqLength/2;
        }
        this.vLine = new Kinetic.Rect({
	    x: this.centerX-1,
	    y: yStart,
	    width: 2,
	    height: this.sqLength/2+1,
	    fill: colours.red,
	    stroke: colours.red,
	    strokeWidth: 1
	});

	this.group = new Kinetic.Group();
	this.group.add(this.hLine);
	this.group.add(this.vLine);
	phItem.parent.templayer.add(this.group);
    }
});

var XoverItemImage = Backbone.View.extend({
	initialize: function(x1,x2,y1,y2,dir) {
        this.connection = new Kinetic.Shape({
	    stroke: this.itemColor,
	    strokeWidth: 2
	});
	this.connection.superobj = this;
	this.connection.setDrawFunc(function(canvas) {
	    var context = canvas.getContext();
	    var ctrlpt = this.superobj.quadCtrlPt(x1,y1,x2,y2,0);
	    context.beginPath();
	    context.moveTo(x1,y1);
	    context.quadraticCurveTo(ctrlpt.x,ctrlpt.y,x2,y2);
	    canvas.stroke(this);
	});

    },
});
