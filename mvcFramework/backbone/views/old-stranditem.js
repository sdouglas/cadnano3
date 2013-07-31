var StrandItem = Backbone.View.extend({
    drawStrand: function(xL, xR){
        //remove remnants of old strands.
        this.getRidOf(false);

	    this.xStart = xL;
	    this.xEnd = xR;

        this.yCoord = this.parent.startY+(this.yLevel+0.5)*this.sqLength;
        this.xStartCoord = this.parent.startX+(this.xStart+1)*this.sqLength;
        this.xEndCoord = this.parent.startX+this.xEnd*this.sqLength;

        //the visible thin line connecting the two enditems
        if(this.connection)
            this.connection.destroy();
        this.connection = new Kinetic.Rect({
            x: this.xStartCoord,
            y: this.yCoord-1.5,
            width: this.xEndCoord-this.xStartCoord,
            height: 3,
            fill: this.strandColor,
            stroke: this.strandColor,
            strokeWidth: 1
        });
        this.group.add(this.connection);
        this.connection.moveToBottom();

        //invisible rectangle that makes dragging the line much easier
        if(this.invisConnection)
            this.invisConnection.destroy();

        this.invisConnection = new Kinetic.Rect({
            x: this.xStartCoord,
            y: this.yCoord-this.sqLength/2,
            width: this.xEndCoord-this.xStartCoord,
            height: this.sqLength,
            fill: "#FFFFFF",
            stroke: "#FFFFFF",
            strokeWidth: 1,
            opacity: 0
        });
        this.group.add(this.invisConnection);

        //Create the endpointitems.
        if(this.modelStrand.helix.isEvenParity()){
            //L,5
            var endP1 = new EndPointItem(this, "L", 5);
            var endP2 = new EndPointItem(this, "R", 3);
        }
        else{
            //L,3
            var endP1 = new EndPointItem(this, "L", 3);
            var endP2 = new EndPointItem(this, "R", 5);
        }
        this.layer.draw();
    },

<<<<<<< HEAD
    initialize: function(modelStrand, phItem, y, xL, xR, endtypeL, endtypeR, layer) { //layer is optional
	//I hope you're used to the massive number of property values by now
	this.parent = phItem;
	this.layer = layer;
	if(layer === undefined) { //default value for layer
	    this.layer = this.parent.options.parent.strandlayer;
	}
	this.divLength = this.parent.options.graphics.divLength;
	this.blkLength = this.parent.options.graphics.blkLength;
	this.sqLength = this.parent.options.graphics.sqLength;
	this.strandColor = this.parent.options.parent.paintcolor;
	this.yLevel = y;
	this.xStart = xL;
	this.xEnd = xR;
	this.isScaf = (this.parent.options.model.hID%2 === this.yLevel);
    this.modelStrand = modelStrand;

	this.alterationArray = new Array();
	this.alterationGroupArray = new Array();

	//see explanation in EndPointItem.js; the implementation of these two classes share many similarities
        this.tempLayer = new Kinetic.Layer();
        this.tempLayer.setScale(this.parent.options.parent.scaleFactor);
        this.parent.options.handler.handler.add(this.tempLayer);
	//final layer is for post-sequencing DNAs
	this.finalLayer = this.parent.options.parent.finallayer;
    //Start listening to resize events.
    this.connectSignalsSlots();

    //see explanation in EndPointItem.js; the implementation of these two classes share many similarities
	this.group = new Kinetic.Group({
        draggable: true,
        dragBoundFunc: function(pos) {
            return {
                x: this.getAbsolutePosition().x,
                y: this.getAbsolutePosition().y
            }
        }
    });
	this.group.superobj = this;
    //0 => drawn higher in the helix.
    //1 => drawn lower in the helix.
    this.yLevel = this.modelStrand.helix.isEvenParity();
    this.drawStrand(xL,xR);

    this.layer.add(this.group);
    //this.layer.draw(); (not needed as you should be making the endItems immediately afterwards)
    console.log('just created a stranditem');
    this.layer.draw();

    },

	//for more explanation, visit EndPointItem.js
	var isScaf = this.isScaf;
	this.group.on("mousedown", function(pos) {
<<<<<<< HEAD
	    var pathTool = this.superobj.parent.options.model.part.currDoc.pathTool;
	    if(pathTool === "select" && tbSelectArray[5] && ((isScaf && tbSelectArray[0])||(!isScaf && tbSelectArray[1]))) {
		this.superobj.selectStart(pos);
	    }
	});
	this.group.on("click", function(pos) {
	    var pathTool = this.superobj.parent.options.model.part.currDoc.pathTool;
	    if(pathTool === "break") {
		this.superobj.breakStrand(pos);
	    }
	    else if(pathTool === "paint") {
		this.superobj.paintStrand();
	    }
	    else if(pathTool === "insert") {
		this.superobj.insertBase(pos);
	    }
	    else if(pathTool === "skip") {
		this.superobj.skipBase(pos);
	    }
	    else if(pathTool === "seq") {
		this.superobj.openSeqWindow();
		//applySeq is called when dialog closes
	    }
	});
	this.group.on("dragmove", function(pos) {
	    var pathTool = this.superobj.parent.options.model.part.currDoc.pathTool;
	    if(pathTool === "select" && tbSelectArray[5] && ((isScaf && tbSelectArray[0])||(!isScaf && tbSelectArray[1]))) {
		this.superobj.selectMove(pos);
	    }
	});
	this.group.on("dragend", function(pos) {
	    var pathTool = this.superobj.parent.options.model.part.currDoc.pathTool;
	    if(pathTool === "select" && tbSelectArray[5] && ((isScaf && tbSelectArray[0])||(!isScaf && tbSelectArray[1]))) {
		this.superobj.selectEnd(pos);
=======
        console.log('stranditem mousedown called');
        //recalculate range of movement of this endpointitem.
        this.superobj.minMaxIndices = this.superobj.modelStrand.getLowHighIndices();
        console.log(this.superobj.minMaxIndices);
	    //counter has to be set up seperately because unlike EndPointItem, base-StrandItem is not a bijective relation. init is used for relative comparison later on.
	    this.dragCounterInit = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth)/this.superobj.parent.options.parent.scaleFactor-5*this.superobj.sqLength)/this.superobj.sqLength);
	    this.dragCounter = this.dragCounterInit;
	    this.pDragCounter = this.dragCounter;
	    //red box again
            this.redBox = new Kinetic.Rect({
		    x: this.superobj.endItemL.centerX-this.superobj.sqLength/2,
		    y: this.superobj.endItemL.centerY-this.superobj.sqLength/2,
		    width: this.superobj.sqLength*(this.superobj.xEnd-this.superobj.xStart+1),
		    height: this.superobj.sqLength,
		    fill: "transparent",
		    stroke: "#FF0000",
		    strokeWidth: 2,
		});
            this.redBox.superobj = this;
            this.redBox.on("mouseup", function(pos) {
                    this.remove();
                    this.superobj.superobj.tempLayer.draw();
                });
            this.superobj.tempLayer.add(this.redBox);
            this.superobj.tempLayer.draw();
	});
	this.group.on("dragmove", function(pos) {
        console.log('stranditem dragmove called');
	    this.dragCounter = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth)/this.superobj.parent.options.parent.scaleFactor-5*this.superobj.sqLength)/this.superobj.sqLength);
	    //have to watch out for both left and right end in counter adjustment here
	    var diff = this.dragCounter-this.dragCounterInit;
        this.dragCounter = this.superobj.adjustCounter(this.dragCounterInit, this.dragCounter);

        //same as EndPointItem
	    if(this.dragCounter !== this.pDragCounter) {
		this.redBox.setX(this.redBox.getX()+(this.dragCounter-this.pDragCounter)*this.superobj.sqLength);
		this.superobj.tempLayer.draw();
		this.pDragCounter = this.dragCounter;
	    }
	});
	this.group.on("dragend", function(pos) {
        console.log('stranditem dragend called');
	    var diff = this.dragCounter - this.dragCounterInit;
	    //deleting red box
            this.redBox.remove();
            this.superobj.tempLayer.draw();

            //
	    //redrawing the line
	    this.superobj.connection.setX(this.superobj.connection.getX()+diff*this.superobj.sqLength);
	    this.superobj.invisConnection.setX(this.superobj.invisConnection.getX()+diff*this.superobj.sqLength);
	    //redraw enditems as well as updating their values
	    this.superobj.xStart += diff;
	    this.superobj.updateXStartCoord();
	    this.superobj.endItemL.counter += diff;
	    this.superobj.endItemL.updateCenterX();
	    this.superobj.endItemL.update();
	    this.superobj.xEnd += diff;
	    this.superobj.updateXEndCoord();
	    this.superobj.endItemR.counter += diff;
	    this.superobj.endItemR.updateCenterX();
	    this.superobj.endItemR.update();

        //send out the resize signal to the model.
        this.superobj.modelStrand.resize(this.superobj.xStart,
                this.superobj.xEnd);

	    //redraw xoveritems
	    if(this.superobj.endItemL instanceof XoverNode) {
		this.superobj.endItemL.updateLinkageX();
		var xoverL = this.superobj.endItemL.xoveritem;
		xoverL.connection.remove();
		xoverL.connection = new Kinetic.Shape({
		    stroke: this.superobj.strandColor,
		    strokeWidth: 3
		});
		xoverL.connection.superobj = xoverL;
		xoverL.connection.setDrawFunc(function(canvas) {
			var context = canvas.getContext();
			var x1 = xoverL.node3.linkageX;
			var y1 = xoverL.node3.linkageY;
			var x2 = xoverL.node5.linkageX;
			var y2 = xoverL.node5.linkageY;
			var ctrlpt = xoverL.quadCtrlPt(x1,y1,x2,y2,xoverL.node3.dir);
			context.beginPath();
			context.moveTo(x1,y1);
			context.quadraticCurveTo(ctrlpt.x,ctrlpt.y,x2,y2);
			canvas.stroke(this);
		    });
		xoverL.group.add(xoverL.connection);
		xoverL.invisConnection.setX(Math.min(xoverL.node3.centerX,xoverL.node5.centerX)-xoverL.sqLength/2);
		xoverL.invisConnection.setWidth(Math.abs(xoverL.node3.centerX-xoverL.node5.centerX)+xoverL.sqLength);
	    }
	    if(this.superobj.endItemR instanceof XoverNode) {
		this.superobj.endItemR.updateLinkageX();
		var xoverR = this.superobj.endItemR.xoveritem;
		xoverR.connection.remove();
		xoverR.connection = new Kinetic.Shape({
		    stroke: this.superobj.strandColor,
		    strokeWidth: 3
		});
		xoverR.connection.superobj = xoverR;
		xoverR.connection.setDrawFunc(function(canvas) {
			var context = canvas.getContext();
			var x1 = xoverR.node3.linkageX;
			var y1 = xoverR.node3.linkageY;
			var x2 = xoverR.node5.linkageX;
			var y2 = xoverR.node5.linkageY;
			var ctrlpt = xoverR.quadCtrlPt(x1,y1,x2,y2,xoverR.node3.dir);
			context.beginPath();
			context.moveTo(x1,y1);
			context.quadraticCurveTo(ctrlpt.x,ctrlpt.y,x2,y2);
			canvas.stroke(this);
		    });
		xoverR.group.add(xoverR.connection);
		xoverR.invisConnection.setX(Math.min(xoverR.node3.centerX,xoverR.node5.centerX)-xoverR.sqLength/2);
		xoverR.invisConnection.setWidth(Math.abs(xoverR.node3.centerX-xoverR.node5.centerX)+xoverR.sqLength);
>>>>>>> sudhanshu-jul19
	    }
	});
<<<<<<< HEAD

	this.layer.add(this.group);
	if(endtypeL === "EndPointItem") {
	    this.endItemL = new EndPointItem(this,"L",4-(2*this.yLevel-1),true);
	}
	else if(endtypeL === "XoverNode") {
	    this.endItemL = new XoverNode(this,"L",4-(2*this.yLevel-1),true);
	}
	if(endtypeR === "EndPointItem") {
	    this.endItemR = new EndPointItem(this,"R",4+(2*this.yLevel-1),true);
	}
	else if(endtypeR === "XoverNode") {
	    this.endItemR = new XoverNode(this,"R",4+(2*this.yLevel-1),true);
	}
	this.layer.draw();
	//this.connectSignalsSlots();
    },

    events:
    {    
    },

    updateXStartCoord: function() {this.xStartCoord = this.parent.startX+(this.xStart+1)*this.sqLength;},
    updateXEndCoord: function() {this.xEndCoord = this.parent.startX+this.xEnd*this.sqLength;},

    update: function() {
	this.updateXStartCoord();
	this.updateXEndCoord();
	this.connection.setX(this.xStartCoord);
	this.connection.setWidth(this.xEndCoord-this.xStartCoord);
	this.invisConnection.setX(this.xStartCoord);
	this.invisConnection.setWidth(this.xEndCoord-this.xStartCoord);
    },

    addEndItem: function(ei, dir, skipRedraw) {
	if(dir === "L") {
	    this.endItemL = ei;
	}
	else {
	    this.endItemR = ei;
	}
	if(!skipRedraw) {
	    this.layer.draw();
	}
    },

    selectStart: function(pos) {
	//counter has to be set up seperately because unlike EndPointItem, base-StrandItem is not a bijective relation. init is used for relative comparison later on.
	this.dragCounterInit = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth)/this.parent.options.parent.scaleFactor-5*this.sqLength)/this.sqLength);
	this.dragCounter = this.dragCounterInit;
	this.pDragCounter = this.dragCounter;
	//red box again
	this.redBox = new Kinetic.Rect({
	    x: this.endItemL.centerX-this.sqLength/2,
	    y: this.endItemL.centerY-this.sqLength/2,
	    width: this.sqLength*(this.xEnd-this.xStart+1),
	    height: this.sqLength,
	    fill: "transparent",
	    stroke: "#FF0000",
	    strokeWidth: 2,
	});
	this.redBox.superobj = this;
	this.redBox.on("mouseup", function(pos) {
	    this.remove();
	    this.superobj.tempLayer.draw();
	});
	this.tempLayer.setScale(this.parent.options.parent.scaleFactor);
	this.tempLayer.add(this.redBox);
	this.tempLayer.draw();
    },

    selectMove: function(pos) {
	this.dragCounter = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth)/this.parent.options.parent.scaleFactor-5*this.sqLength)/this.sqLength);
	//have to watch out for both left and right end in counter adjustment here
	var diff = this.dragCounter-this.dragCounterInit;
	if(this.xStart+diff < 0) {
	    this.dragCounter = this.dragCounterInit-this.xStart;
	}
	else {
	    var grLength = this.blkLength*this.divLength*this.parent.options.parent.part.getStep();
	    if(this.xEnd+diff >= grLength) {
		this.dragCounter = this.dragCounterInit+grLength-1-this.xEnd;
	    }
	}
	//same as EndPointItem
	if(this.dragCounter !== this.pDragCounter) {
	    this.redBox.setX(this.redBox.getX()+(this.dragCounter-this.pDragCounter)*this.sqLength);
	    this.tempLayer.draw();
	    this.pDragCounter = this.dragCounter;
	}
    },

    selectEnd: function(pos) {
	var diff = this.dragCounter-this.dragCounterInit;
	//deleting red box
	this.redBox.remove();
	this.tempLayer.draw();
	//redrawing the line
	this.xStart += diff;
	this.xEnd += diff;
	this.update();
	//moving the inserts and skips
	for(var i=0; i<this.alterationGroupArray.length; i++) {
	    this.alterationGroupArray[i].setX(this.alterationGroupArray[i].getX()+diff*this.sqLength);
	}
	//redraw enditems as well as updating their values
	this.endItemL.counter += diff;
	this.endItemL.update();
	this.endItemR.counter += diff;
	this.endItemR.update();
	//redraw xoveritems
	if(this.endItemL instanceof XoverNode) {
	    this.endItemL.xoveritem.update();
	}
	if(this.endItemR instanceof XoverNode) {
	    this.endItemR.xoveritem.update();
	}
	//remove post-sequencing DNA bases
	this.finalLayer.destroyChildren();
	this.finalLayer.draw();
	//finally we can redraw the layer...
	this.layer.draw();
    },

    breakStrand: function(pos) {
	this.finalLayer.destroyChildren();
	this.finalLayer.draw();
	if(this.endItemL.prime === 5) {
	    var counter = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth)/this.parent.options.parent.scaleFactor-5*this.sqLength)/this.sqLength);
	    if(this.xEnd-counter > 1) {
		var strand1 = new StrandItem(this.parent,this.yLevel,this.xStart,counter,null,"EndPointItem");
		this.endItemL.parent = strand1;
		strand1.addEndItem(this.endItemL,"L");
		var strand2 = new StrandItem(this.parent,this.yLevel,counter+1,this.xEnd,"EndPointItem",null);
		this.endItemR.parent = strand2;
		strand2.addEndItem(this.endItemR,"R");
		this.close();
		this.group.destroy();
		this.layer.draw();
		return;
	    }
	}
	else {
	    var counter = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth)/this.parent.options.parent.scaleFactor-5*this.sqLength)/this.sqLength);
	    if(counter-this.xStart > 1) {
		var strand1 = new StrandItem(this.parent,this.yLevel,this.xStart,counter-1,null,"EndPointItem");
		this.endItemL.parent = strand1;
		strand1.addEndItem(this.endItemL,"L");
		var strand2 = new StrandItem(this.parent,this.yLevel,counter,this.xEnd,"EndPointItem",null);
		this.endItemR.parent = strand2;
		strand2.addEndItem(this.endItemR,"R");
		this.close();
		this.group.destroy();
		this.layer.draw();
		return;
	    }
	}
    },
    
    insertBase: function(pos) {
	var counter = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth)/this.parent.options.parent.scaleFactor-5*this.sqLength)/this.sqLength);
	if(!this.alterationArray[counter-this.xStart]) {
	    var insert = new InsertItem(this,counter-this.xStart);
	    this.finalLayer.destroyChildren();
	    this.finalLayer.draw();
	}
    },

    skipBase: function(pos) {
	var counter = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth)/this.parent.options.parent.scaleFactor-5*this.sqLength)/this.sqLength);
	if(!this.alterationArray[counter-this.xStart]) {
	    var skip = new SkipItem(this,counter-this.xStart);
	    this.finalLayer.destroyChildren();
	    this.finalLayer.draw();
	}
    },

    updateAlteration: function(n) {
	var copyArray = new Array();
	if(n !== 0) {
	    for(var i=0; i<this.xEnd-this.xStart; i++) {
		if(this.alterationArray[i]) {
		    this.alterationArray[i].position += n;
		}
		if(n>0) { //strand length increase
		    copyArray[i+n] = this.alterationArray[i];
		}
		else { //strand length decrease
		    copyArray[i] = this.alterationArray[i-n];
		}
	    }
	    this.alterationArray = copyArray;
	}
    },

    paintStrand: function() {
	var colour = this.parent.options.parent.paintcolor;
	this.strandColor = colour;
	this.connection.setFill(colour);
	this.connection.setStroke(colour);
	//rest of recursion goes in here
	this.layer.draw();
    },

    openSeqWindow: function() { //someone fix the duplicate dialog bug (it is also in pathhelixitem.js)
	var self = this;
	window.localStorage.setItem("cadnanoSeq",""); //clears out old string
	var newDialog = $('<link rel="stylesheet" href="ui/css/jquery-ui/jquery.ui-1.9.2.min.css"><div><iframe src="cadnanoSeq.html" width="285" height="300"></div>');
	$(newDialog).dialog({
	    width: 316,
	    height: 420,
	    modal: true,
	    title: "Choose a sequence",
	    show: "clip",
	    hide: "clip",
	    buttons: {
		OK: function() {
			self.applySeq(window.localStorage.getItem("cadnanoSeq"));
			$(this).dialog("close");
		    },
		Cancel: function() {$(this).dialog("close");}
	    }
	});
	$(".ui-dialog-titlebar-close", this.parentNode).hide();
	//if any item is modified in strandlayer, destroy final layer's children
    },

    applySeq: function(seq) {
	var layer = this.finalLayer;
	var zf = this.parent.options.parent.scaleFactor;
	var seqIndex = 0;
	var strandCounter = 0;
	var strandLen = this.xEnd-this.xStart;
	//sequencing goes 5' -> 3'
	while(seqIndex < seq.length && strandCounter <= strandLen) {
	    if(this.endItemL.prime === 5) {
		if(!this.alterationArray[strandCounter]) {
		    var text = new Kinetic.Text({
			x: this.parent.startX+(this.xStart+strandCounter+0.5)*this.sqLength,
			y: this.yCoord-(2*this.yLevel-1)/4*(this.sqLength+6),
			text: seq.charAt(seqIndex),
			fontSize: this.sqLength*0.4,
			fontFamily: "Calibri",
			fill: "#000000",
		    });
		    text.setOffset({x: text.getWidth()/2, y: text.getHeight()/2});
		    if(this.yLevel === 1) {
			text.rotate(Math.PI);
		    }
		    layer.add(text);
		    seqIndex++;
		    strandCounter++;
		}
		else if(this.alterationArray[strandCounter].extraBases === -1) { //skip
		    strandCounter++;
		}
		else if(this.alterationArray[strandCounter].extraBases >= 1) { //insert
		    //normal base pair comes first
                    var text = new Kinetic.Text({
			x: this.parent.startX+(this.xStart+strandCounter+0.5)*this.sqLength,
                        y: this.yCoord-(2*this.yLevel-1)/4*(this.sqLength+6),
                        text: seq.charAt(seqIndex),
                        fontSize: this.sqLength*0.4,
                        fontFamily: "Calibri",
                        fill: "#000000",
		    });
		    text.setOffset({x: text.getWidth()/2, y: text.getHeight()/2});
		    if(this.yLevel === 1) {
			text.rotate(Math.PI);
		    }
		    layer.add(text);
		    seqIndex++;
		    //the extras
		    var additionalBase = this.alterationArray[strandCounter].extraBases;
		    var additionalText = new Kinetic.Text({
			x: this.parent.startX+(this.xStart+strandCounter+0.75)*this.sqLength,
			y: this.yCoord+(2*this.yLevel-1)/4*(5*this.sqLength),
			text: seq.substring(seqIndex),
			fontSize: this.sqLength*0.4,
			fontFamily: "Calibri",
			fill: "#000000",
		    });
		    if(seqIndex+additionalBase <= seq.length) {
			additionalText.setText(seq.substring(seqIndex,seqIndex+additionalBase));
		    }
		    additionalText.setOffset({x: additionalText.getWidth()/2, y: additionalText.getHeight()/2});
		    if(this.yLevel === 1) {
			additionalText.rotate(Math.PI);
		    }
		    layer.add(additionalText);
		    seqIndex += additionalBase; //also works for "else" conditional as this will also force the "while" loop to stop
		    strandCounter++;
		}
	    }
	    else {
                if(!this.alterationArray[strandLen-strandCounter]) {
                    var text = new Kinetic.Text({
			x: this.parent.startX+(this.xEnd-strandCounter+0.5)*this.sqLength,
			y: this.yCoord-(2*this.yLevel-1)/4*(this.sqLength+6),
			text: seq.charAt(seqIndex),
			fontSize: this.sqLength*0.4,
			fontFamily: "Calibri",
			fill: "#000000",
		    });
                    text.setOffset({x: text.getWidth()/2, y: text.getHeight()/2});
                    if(this.yLevel === 1) {
			text.rotate(Math.PI);
                    }
                    layer.add(text);
                    seqIndex++;
                    strandCounter++;
		}
                else if(this.alterationArray[strandLen-strandCounter].extraBases === -1) { //skip
                    strandCounter++;
		}
		else if(this.alterationArray[strandLen-strandCounter].extraBases >= 1) { //insert
		    //the extras
		    var additionalBase = this.alterationArray[strandLen-strandCounter].extraBases;
		    var additionalText = new Kinetic.Text({
			x: this.parent.startX+(this.xEnd-strandCounter+0.75)*this.sqLength,
			y: this.yCoord+(2*this.yLevel-1)/4*(5*this.sqLength),
			text: seq.substring(seqIndex),
			fontSize: this.sqLength*0.4,
			fontFamily: "Calibri",
			fill: "#000000",
		    });
		    if(seqIndex+additionalBase <= seq.length) {
			additionalText.setText(seq.substring(seqIndex,seqIndex+additionalBase));
		    }
		    additionalText.setOffset({x: additionalText.getWidth()/2, y: additionalText.getHeight()/2});
		    if(this.yLevel === 1) {
			additionalText.rotate(Math.PI);
		    }
		    layer.add(additionalText);
		    seqIndex += additionalBase;
		    //normal base pair comes later
		    if(seqIndex < seq.length) {
			var text = new Kinetic.Text({
			    x: this.parent.startX+(this.xEnd-strandCounter+0.5)*this.sqLength,
			    y: this.yCoord-(2*this.yLevel-1)/4*(this.sqLength+6),
			    text: seq.charAt(seqIndex),
			    fontSize: this.sqLength*0.4,
			    fontFamily: "Calibri",
			    fill: "#000000",
			});
			text.setOffset({x: text.getWidth()/2, y: text.getHeight()/2});
			if(this.yLevel === 1) {
			    text.rotate(Math.PI);
			}
			layer.add(text);
			seqIndex++;
			strandCounter++;
		    }
		}
	    }
	}
	layer.setScale(zf);
	layer.draw();
=======
    },

    updateXStartCoord: function() {
        this.xStartCoord = this.parent.startX+(this.xStart+1)*this.sqLength;
    },
    updateXEndCoord: function() {
        this.xEndCoord = this.parent.startX+this.xEnd*this.sqLength;
    },

    addEndItem: function(ei, dir) {
        if(dir === "L") {
            this.endItemL = ei;
        }
        else {
            this.endItemR = ei;
        }
    },

    adjustCounter: function(dcI,dc) {
        var xS = this.xStart;
        var xE = this.xEnd;
        var d = dc-dcI;
        var leftD = this.minMaxIndices[0] - xS;
        var rightD = this.minMaxIndices[1] - xE;

        if(d < 0)
            return dcI+Math.max(d,leftD);
        return dcI+Math.min(d,rightD);
>>>>>>> sudhanshu-jul19
    },

    events: {},

    connectSignalsSlots: function() {
        /*
        this.listenTo(this.modelStrand, 
                cadnanoEvents.strandResizedSignal,
                this.strandResizedSlot);
                */
    },

    strandResizedSlot:
    function(lowIdx, highIdx){
        console.log('in strandResizedSlot, new coords: '+lowIdx+','+highIdx);
        //need to resize 3 things.
        //1. this.connection.
        //2. this.endItemL.
        //3. this.endItemR.
        this.drawStrand(lowIdx, highIdx);
    },

    getRidOf:
    function(destroy){
        //remove strand from layer.
        //remove endpoints from layer.
        if(this.endItemL) this.endItemL.getRidOf();
        if(this.endItemR) this.endItemR.getRidOf();

        this.group.removeChildren();
        this.layer.draw();

        if(destroy) {
            this.group.remove();
            this.close();
        }
        //Cannot remove layer or all children, since its 
        //the layer of the parent helix item.
    }

});

var InsertItem = Backbone.View.extend({
    initialize: function(strand, loc) {
	this.position = loc;
        this.parent = strand;
        this.startX = this.parent.parent.startX;
        this.yCoord = this.parent.yCoord;
        this.sqLength = this.parent.sqLength;
        this.extraBases = 1;

	this.parent.alterationArray[this.position] = this;
	var insertArrow = new Kinetic.Group();
	var counter = this.position+this.parent.xStart;
	var polypts;
	if(this.parent.yLevel === 0) {
	    polypts = [this.startX+(counter+0.7)*this.sqLength, this.yCoord-1.5,
		       this.startX+(counter+0.3)*this.sqLength, this.yCoord-this.sqLength,
		       this.startX+(counter+1.1)*this.sqLength, this.yCoord-this.sqLength
		       ];
	}
	else {
	    polypts = [this.startX+(counter+0.7)*this.sqLength, this.yCoord+1.5,
		       this.startX+(counter+0.3)*this.sqLength, this.yCoord+this.sqLength,
		       this.startX+(counter+1.1)*this.sqLength, this.yCoord+this.sqLength
		       ];
	}
	var triangle = new Kinetic.Polygon({
            points: polypts,
	    fill: "transparent",
	    stroke: this.parent.strandColor,
	    strokeWidth: 2
        });
	var text = new Kinetic.Text({
	    x: this.startX+(counter+0.7)*this.sqLength,
	    y: this.yCoord+(2*this.parent.yLevel-1)*this.sqLength*2/3,
	    text: this.extraBases,
	    fontSize: this.sqLength*0.5,
	    fontFamily: "Calibri",
	    fill: "#000000",
	});
	text.setOffset({x: text.getWidth()/2, y: text.getHeight()/2});
	insertArrow.superobj = this;
	insertArrow.on("click", function() {
	    var newExtra = prompt("Number of insertions","");
	    if(newExtra !== null) {
		var nE = parseInt(newExtra,10);
		if(nE > 0) {
		    this.superobj.extraBases = nE;
		    text.setText(nE);
		    this.superobj.parent.layer.draw();
		}
	    }
	});
	insertArrow.add(triangle);
	insertArrow.add(text);
	this.parent.layer.add(insertArrow);
	this.parent.alterationGroupArray.push(insertArrow);
	this.parent.layer.draw();
    },
});

var SkipItem = Backbone.View.extend({
    initialize: function(strand, loc) {
	this.position = loc;
	this.parent = strand;
	this.startX = this.parent.parent.startX;
	this.yCoord = this.parent.yCoord;
	this.sqLength = this.parent.sqLength;
	this.extraBases = -1;

	this.parent.alterationArray[this.position] = this;
	var skipCross = new Kinetic.Group();
	var counter = this.position+this.parent.xStart;
	var slash1 = new Kinetic.Line({
            points: [this.startX+counter*this.sqLength, this.yCoord-this.sqLength/2,
		     this.startX+(counter+1)*this.sqLength, this.yCoord+this.sqLength/2],
	    stroke: "#FF0000",
	    strokeWidth: 2
        });
	var slash2 = new Kinetic.Line({
            points: [this.startX+(counter+1)*this.sqLength, this.yCoord-this.sqLength/2,
		     this.startX+counter*this.sqLength, this.yCoord+this.sqLength/2],
	    stroke: "#FF0000",
	    strokeWidth: 2
        });
	skipCross.add(slash1);
	skipCross.add(slash2);
	this.parent.layer.add(skipCross);
	this.parent.alterationGroupArray.push(skipCross);
	this.parent.layer.draw();
    },
});