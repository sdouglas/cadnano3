var StrandItem = Backbone.View.extend({
    /**
     * @param [layer] optional argument.
     */
    initialize: function(modelStrand, phItem, layer) { 
        this.xStart = modelStrand.low();
        this.xEnd = modelStrand.high();
        this.modelStrand = modelStrand;
	this.parent = phItem;
	this.layer = layer;
	if(layer === undefined) { //default value for layer
	    this.layer = this.parent.parent.strandlayer;
	}
        //Start listening to resize events.
        this.connectSignalsSlots();

        this.panel = this.parent.parent.panel;
	    var graphics = this.parent.options.graphics;
        this.divLength = graphics.divLength;
        this.blkLength = graphics.blkLength;
        this.sqLength = graphics.sqLength;

        this.alterationArray = new Array();

        //see explanation in EndPointItem.js; 
        //the implementation of these two classes share many similarities
        this.tempLayer = this.parent.parent.templayer;

        //final layer is for post-sequencing DNAs
        this.finalLayer = this.parent.parent.finallayer;

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

        this.isScaf = this.modelStrand.strandSet.isScaffold();
        //0 => drawn higher in the helix.
        //1 => drawn lower in the helix.
        if(this.modelStrand.helix.isOddParity()^this.isScaf) {
            this.yLevel = 0;
        }
        else {
            this.yLevel = 1;
        }

        //all scaffold has the same color (unless changed by paint tool)
        if(this.isScaf) {
            this.itemColor = colours.bluestroke;
        }
        else {
            this.itemColor = this.generateRandomColor();
        }

        this.yCoord = this.parent.startY+(this.yLevel+0.5)*this.sqLength;
        this.xStartCoord = this.parent.startX+(this.xStart+1)*this.sqLength;
        this.xEndCoord = this.parent.startX+this.xEnd*this.sqLength;

        //the visible thin line connecting the two enditems
        this.connection = new Kinetic.Rect({
            x: this.xStartCoord,
            y: this.yCoord-1,
            width: this.xEndCoord-this.xStartCoord,
            height: 2,
            fill: this.itemColor,
            stroke: this.itemColor,
            strokeWidth: 1
        });

        if(!this.isScaf) {
            var stapLen = this.xEnd-this.xStart; 
            //should change to the length of whole staple
            if(stapLen < 18 || stapLen > 50) {
                this.connection.setY(this.yCoord-3);
                this.connection.setHeight(6);
            }
        }

        this.group.add(this.connection);
        this.connection.moveToBottom();

        //invisible rectangle that makes dragging the line much easier
        this.invisConnection = new Kinetic.Rect({
            x: this.xStartCoord,
            y: this.yCoord-this.sqLength/2,
            width: this.xEndCoord-this.xStartCoord,
            height: this.sqLength,
            fill: colours.white,
            stroke: colours.white,
            strokeWidth: 1,
            opacity: 0
        });
        this.group.add(this.invisConnection);

        //for more explanation, visit EndPointItem.js
        var isScaf = this.isScaf;
        
	var pathHelixSetItem = this.parent.parent;
	var currDoc = pathHelixSetItem.part.currDoc;
	this.group.on("mousedown", function(pos) {
            var pathTool = currDoc.pathTool;
	    //critiria:
	    //1. path tool is "select"
	    //2. strands are selectable
	    //3. strand is scaffold and scaf is selectable, or strand is staple and stap is selectable
            if(pathTool === "select" && tbSelectArray[5] && ((isScaf && tbSelectArray[0])||(!isScaf && tbSelectArray[1]))) {
                this.superobj.selectStart(pos);
            }
        });

        this.group.on("click", function(pos) {
	    //reset PreXoverItems
	
	    pathHelixSetItem.prexoverlayer.destroyChildren();
	    pathHelixSetItem.part.setActiveVirtualHelix(this.superobj.parent.options.model);
            var pathTool = currDoc.pathTool;
            var counter = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth+this.superobj.panel.scrollLeft)/pathHelixSetItem.scaleFactor)/this.superobj.sqLength)-5;
	    if(pathTool === "pencil") {
		this.superobj.createPencilXoverSite(counter);
	    }
            else if(pathTool === "break") {
                this.superobj.breakStrand(counter);
            }
            else if(pathTool === "paint") {
                this.superobj.paintStrand();
            }
            else if(pathTool === "insert") {
                //Default insertion of length 1.
                this.superobj.insertBase(counter, 1);
            }
            else if(pathTool === "skip") {
                this.superobj.skipBase(counter);
            }
            else if(pathTool === "seq") {
                this.superobj.openSeqWindow();
                //applySeq is called when dialog closes
            }
        });

        this.group.on("dragmove", function(pos) {
            var pathTool = currDoc.pathTool;
            if(pathTool === "select" && tbSelectArray[5] && ((isScaf && tbSelectArray[0])||(!isScaf && tbSelectArray[1]))) {
                this.superobj.selectMove(pos);
            }
        });

        this.group.on("dragend", function(pos) {
            var pathTool = currDoc.pathTool;
            if(pathTool === "select" && tbSelectArray[5] && ((isScaf && tbSelectArray[0])||(!isScaf && tbSelectArray[1]))) {
                this.superobj.selectEnd();
            }
        });

        this.layer.add(this.group);
        //Create this.endPointL, this.endPointR, this.XoverL, this.XoverR
        this.XoverL = new XoverNode(this,"L",4-(2*this.yLevel-1),true);
        this.endPointL = new EndPointItem(this,"L",4-(2*this.yLevel-1),true);
        this.XoverR = new XoverNode(this,"R",4+(2*this.yLevel-1),true);
        this.endPointR = new EndPointItem(this,"R",4+(2*this.yLevel-1),true);

        //LAST LINE
        this.render();
    },

    render: function(){
        this.endPointR.show(false);
        this.endPointL.show(false);
        this.XoverL.show(false);
        this.XoverR.show(false);

        this.endItemL = this.endPointL;
        this.endItemR = this.endPointR; 
        console.log(this.modelStrand);

        if(this.modelStrand.connection3p()) {
            if(this.modelStrand.isDrawn5to3()){
                this.endItemR = this.XoverR;
                console.log('in l1');
            }
            else{
                this.endItemL = this.XoverL;
                console.log('in l2');
            }
        }

        if(this.modelStrand.connection5p()){ 
            if(this.modelStrand.isDrawn5to3()){
                this.endItemL = this.XoverL;
                console.log('in l4');
            }
            else{
                this.endItemR = this.XoverR;
                console.log('in l5');
            }
        }

        this.update();
        this.endPointL.update();
        this.endPointR.update();
        this.XoverL.update();
        this.XoverR.update();
        
        this.endItemL.show(true);
        this.endItemR.show(true);

        this.refreshInsertionItems();
	    this.layer.draw();
    },

    events: {},

    updateXStartCoord: function() {
        this.xStart = this.modelStrand.low();
        this.xStartCoord = this.parent.startX+(this.xStart+1)*this.sqLength;
    },

    updateXEndCoord: function() {
        this.xEnd = this.modelStrand.high();
        this.xEndCoord = this.parent.startX+this.xEnd*this.sqLength;
    },

    update: function() { //update graphics and graphics variables
        this.updateXStartCoord();
        this.updateXEndCoord();
        this.connection.setX(this.xStartCoord);
        this.connection.setWidth(this.xEndCoord-this.xStartCoord);

        if(!this.isScaf) {
            var stapLen = this.xEnd-this.xStart; //should change to the length of whole staple
            if(stapLen < 18 || stapLen > 50) {
                this.connection.setY(this.yCoord-3); //length not in recommended range = thicker line
                this.connection.setHeight(6);
            }
            else {
                this.connection.setY(this.yCoord-1);
                this.connection.setHeight(2);
            }
        }

        this.invisConnection.setX(this.xStartCoord);
        this.invisConnection.setWidth(this.xEndCoord-this.xStartCoord);
        this.parent.parent.prexoverlayer.destroyChildren();
        this.parent.parent.part.setActiveVirtualHelix(this.parent.options.model);
    },

    //update the Y position
    updateY: function() {
        var diff = -this.yCoord;
        this.yCoord = this.parent.startY+(this.yLevel+0.5)*this.sqLength;
        diff += this.yCoord;

        this.finalLayer.destroyChildren();
        this.finalLayer.draw();
        
        this.connection.setY(this.yCoord-1);
        this.invisConnection.setY(this.yCoord-this.sqLength/2);
        
        for(var i=0; i<this.parent.grLength; i++) {
            if(this.alterationArray[i]) {
                var group = this.alterationArray[i].skipInsertGroup;
                group.setY(group.getY()+diff);
            }
        }

        //TODO: update all 4 objects.
        this.endItemL.updateY();
        this.endItemR.updateY();
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
	this.dragCounterInit = Math.floor((pos.x-51-innerLayout.state.west.innerWidth+this.panel.scrollLeft)/this.parent.parent.scaleFactor/this.sqLength-5);
	this.dragCounter = this.dragCounterInit;
	this.pDragCounter = this.dragCounter;
	this.minMaxIndices = this.modelStrand.getLowHighIndices();
	console.log(this.minMaxIndices);

	//red box again
	this.redBox = new Kinetic.Rect({
	    x: this.endItemL.centerX-this.sqLength/2,
	    y: this.endItemL.centerY-this.sqLength/2,
	    width: this.sqLength*(this.xEnd-this.xStart+1),
	    height: this.sqLength,
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
	this.dragCounter = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth+this.panel.scrollLeft)/this.parent.parent.scaleFactor-5*this.sqLength)/this.sqLength);
	//have to watch out for both left and right end in counter adjustment here
	var diff = this.dragCounter-this.dragCounterInit;
	this.dragCounter = this.adjustCounter(this.dragCounterInit, this.dragCounter);
	//same as EndPointItem
	if(this.dragCounter !== this.pDragCounter) {
	    this.redBox.setX(this.redBox.getX()+(this.dragCounter-this.pDragCounter)*this.sqLength);
	    this.tempLayer.draw();
	    this.pDragCounter = this.dragCounter;
	}
    },

    selectEnd: function() {
	var diff = this.dragCounter-this.dragCounterInit;
	//deleting red box
	this.redBox.remove();
	this.tempLayer.draw();
	this.move(diff);
    },

    move: function(diff) { //forced move
        //redrawing the line
        this.xStart += diff;
        this.xEnd += diff;

        //redraw enditems as well as updating their values
        this.endItemL.counter += diff;
        this.endItemR.counter += diff;

        //note: if endItemL/R is a XoverNode, its corresponding XoverItem will be automatically updated

        //remove post-sequencing DNA bases
        this.finalLayer.destroyChildren();
        this.finalLayer.draw();

        //send out the resize signal to the model.
        this.modelStrand.resize(this.xStart,
                this.xEnd);
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
    },

    createPencilXoverSite: function(counter) {
	var pep = this.parent.parent.pencilEP;
	if(!pep) {
	    if(this.canBreakStrand(counter)) {
		this.parent.parent.pencilEP = new XoverNodeImage(this.parent, this.yLevel, counter, this);
		this.parent.parent.templayer.draw();
	    }
	}
	else {
	    if(this.endPointL.prime === 3) {
		this.parent.parent.part.createXover(this.modelStrand, counter, pep.stItem.modelStrand, pep.x);
	    }
	    else {
		this.parent.parent.part.createXover(pep.stItem.modelStrand, pep.x, this.modelStrand, counter);
	    }
	    this.parent.parent.templayer.destroyChildren();
	    this.parent.parent.templayer.draw();
	    this.parent.parent.pencilEP = undefined;
	}
    },

    canBreakStrand: function(counter) {
	if(this.endItemL.prime === 5) {
	    return this.xEnd-counter > 1 && counter > this.xStart;
	}
	else {
	    return counter-this.xStart > 1 && counter < this.xEnd;
	}
    },

    breakStrand: function(counter) {
        var strandSet = this.modelStrand.strandSet;
        if(strandSet.canSplitStrand(this.modelStrand,counter)){
            strandSet.splitStrand(this.modelStrand,counter);
        }
        this.finalLayer.destroyChildren();
        this.finalLayer.draw();
    },

    insertBase: function(counter, length) {
        this.modelStrand.addInsertion(counter, length);
    },

    skipBase: function(counter) {
        this.modelStrand.addInsertion(counter, -1);
    },

    paintStrand: function() {
	var colour = this.parent.parent.paintcolor;
	this.itemColor = colour;
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
		OK:
		function() {
		    self.applySeq(window.localStorage.getItem("cadnanoSeq"));
		    $(newDialog).dialog("close");
		},
		Cancel:
		function() {
		    $(newDialog).dialog("close");
		}
	    }
	});
	$(".ui-dialog-titlebar-close", this.parentNode).hide();
	//if any item is modified in strandlayer, destroy final layer's children
    },

    applySeq: function(seq) {
	var layer = this.finalLayer;
	var seqIndex = 0;
	var strandCounter = 0;
	var strandLen = this.xEnd-this.xStart;
	this.finalLayer.destroyChildren();
	//sequencing goes 5' -> 3'
	while(seqIndex < seq.length && strandCounter <= strandLen) {
	    if(this.endItemL.prime === 5) { //assign letter to each position left to right
		if(!this.parent.alterationArray[strandCounter+this.xStart]) { //no inserts or skips
		    var text = new Kinetic.Text({
			x: this.parent.startX+(this.xStart+strandCounter+0.5)*this.sqLength,
			y: this.yCoord-(2*this.yLevel-1)/4*(this.sqLength+6),
			text: seq.charAt(seqIndex),
			fontSize: this.sqLength*0.4,
			fontFamily: "Calibri",
			fill: colours.black,
		    });
		    text.setOffset({x: text.getWidth()/2, y: text.getHeight()/2});
		    if(this.yLevel === 1) {
			text.rotate(Math.PI);
		    }
		    layer.add(text);
		    seqIndex++;
		    strandCounter++;
		}
		else {
		    var additionalBase = this.parent.alterationArray[strandCounter+this.xStart].extraBase;
		    if(additionalBase === -1) { //skip
			strandCounter++;
		    }
		    else { //insert
			//normal base pair comes first
			var text = new Kinetic.Text({
			    x: this.parent.startX+(this.xStart+strandCounter+0.5)*this.sqLength,
			    y: this.yCoord-(2*this.yLevel-1)/4*(this.sqLength+6),
			    text: seq.charAt(seqIndex),
			    fontSize: this.sqLength*0.4,
			    fontFamily: "Calibri",
			    fill: colours.black,
			});
			text.setOffset({x: text.getWidth()/2, y: text.getHeight()/2});
			if(this.yLevel === 1) {
			    text.rotate(Math.PI);
			}
			layer.add(text);
			seqIndex++;
			//the extras
			var additionalText = new Kinetic.Text({
			    x: this.parent.startX+(this.xStart+strandCounter+0.75)*this.sqLength,
			    y: this.yCoord+(2*this.yLevel-1)/4*(5*this.sqLength),
			    text: seq.substring(seqIndex),
			    fontSize: this.sqLength*0.4,
			    fontFamily: "Calibri",
			    fill: colours.black,
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
	    }
	    else { //right to left
                if(!this.parent.alterationArray[this.xEnd-strandCounter]) {
                    var text = new Kinetic.Text({
			x: this.parent.startX+(this.xEnd-strandCounter+0.5)*this.sqLength,
			y: this.yCoord-(2*this.yLevel-1)/4*(this.sqLength+6),
			text: seq.charAt(seqIndex),
			fontSize: this.sqLength*0.4,
			fontFamily: "Calibri",
			fill: colours.black,
		    });
                    text.setOffset({x: text.getWidth()/2, y: text.getHeight()/2});
                    if(this.yLevel === 1) {
			text.rotate(Math.PI);
                    }
                    layer.add(text);
                    seqIndex++;
                    strandCounter++;
		}
                else {
		    var additionalBase = this.parent.alterationArray[this.xEnd-strandCounter].extraBase;
		    if(additionalBase === -1) { //skip
			strandCounter++;
		    }
		    else { //insert
			//the extras
			var additionalText = new Kinetic.Text({
			    x: this.parent.startX+(this.xEnd-strandCounter+0.75)*this.sqLength,
			    y: this.yCoord+(2*this.yLevel-1)/4*(5*this.sqLength),
			    text: seq.substring(seqIndex),
			    fontSize: this.sqLength*0.4,
			    fontFamily: "Calibri",
			    fill: colours.black,
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
				fill: colours.black,
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
	}
	layer.draw();
    },

    connectSignalsSlots: function() {
        this.listenTo(this.modelStrand, cadnanoEvents.strandUpdateSignal,
		      this.strandUpdateSlot);
        this.listenTo(this.modelStrand, cadnanoEvents.strandInsertionAddedSignal, this.strandInsertionAddedSlot);
    },

    getRidOf:
    function(destroy){
        //remove strand from layer.
        //remove endpoints from layer.
        if(this.endPointL) this.endPointL.getRidOf();
        if(this.endPointR) this.endPointR.getRidOf();
        if(this.XoverL) this.XoverL.getRidOf();
        if(this.XoverR) this.XoverR.getRidOf();

        this.group.removeChildren();
        this.layer.draw();

        if(destroy) {
            this.group.remove();
            this.close();
        }
        //Cannot remove layer or all children, since its 
        //the layer of the parent helix item.
    },

    strandUpdateSlot:
    function(strand){
        //This function redraws the strand - it also
        //changes the color of the strand if passed in
        //as an argument.
        //It updates the xoveritem incase an xover is created/deleted.
        console.log('strandUpdateSlot called');
        this.render();
    },

    //Assumption: model would trigger signal only if an insertion item
    //was not present.
    strandInsertionAddedSlot:
    function(insertion){
        console.log('inserting insertitem');
        var counter = insertion.idx();
        var length = insertion.length();
        if(insertion.isSkip()){
        var insert = new SkipItem(
                this.parent,
                this,
                counter
                );
        }
        else{
        var insert = new InsertItem(
                this.parent,
                this,
                counter, 
                length);
        }
        this.finalLayer.destroyChildren();
        this.finalLayer.draw();
    },
    
    //returns string of form #XXXXXX
    generateRandomColor: function() {
	//color is generated as HSV then converted to RGB
	var colorH = Math.floor(360*Math.random());
	var colorV = 0.7+0.3*Math.random();
	var colorS = 1;

	var colorC = colorS*colorV;
	var colorX = colorC*(1-Math.abs((colorH/60)%2-1));
	var colorRGB = new Array();
	if(colorH < 60) {colorRGB = [colorC,colorX,0];}
	else if(colorH < 120) {colorRGB = [colorX,colorC,0];}
	else if(colorH < 180) {colorRGB = [0,colorC,colorX];}
	else if(colorH < 240) {colorRGB = [0,colorX,colorC];}
	else if(colorH < 300) {colorRGB = [colorX,0,colorC];}
	else {colorRGB = [colorC,0,colorX];}
	for(var i=0; i<3; i++) {
	    colorRGB[i] += (colorV-colorC);
	    colorRGB[i] = Math.floor(255.99*colorRGB[i]); //final RGB cannot be 256
	}
	var colorArrayHex = new Array();
	colorArrayHex[0] = (colorRGB[0]).toString(16); //converting to hex
	if(colorRGB[0] < 16) {colorArrayHex[0] = "0"+colorArrayHex[0];} //every hex should be 2 digits
	colorArrayHex[1] = (colorRGB[1]).toString(16);
	if(colorRGB[1] < 16) {colorArrayHex[1] = "0"+colorArrayHex[1];}
	colorArrayHex[2] = (colorRGB[2]).toString(16);
	if(colorRGB[2] < 16) {colorArrayHex[2] = "0"+colorArrayHex[2];}
	return "#"+colorArrayHex[0]+colorArrayHex[1]+colorArrayHex[2];
    },

    /**
	Redraw the skip items based on whether or not a
	strand is present.
    */
    refreshInsertionItems:
    function(){
        console.log('in refreshInsertionItems');
        var strand = this.modelStrand;
        var helix = this.getHelix();
        var insertions = helix.getInsertions();
        //Remove items incase they are not there, and add
        //them incase they are.
        console.log(insertions);
        console.log(this.alterationArray);
        
        var delflag;
        var idx;

        for(var idx=0; idx<this.parent.grLength; idx++) {
            delflag = true;
            if(insertions[idx]){
                //has insert/skip in the position
                if(idx >= strand.low() && idx <= strand.high()){
                    delflag = false;
                    if(!this.alterationArray[idx]) { 
                        if(insertions[idx].isSkip()){
                            this.alterationArray[idx] = new SkipItem(
                                    this.parent, this, idx, false);
                        }
                        else{
                            this.alterationArray[idx] = new InsertItem(
                                this.parent, this, idx, 
                                insertions[idx].length(), false);
                        }
                    }
                }
            }

            if (delflag && this.alterationArray[idx]){
                this.alterationArray[idx].skipInsertGroup.destroy();
                this.alterationArray[idx].close();
                this.alterationArray.splice(idx,1);
            }
        }
	    this.parent.options.parent.alterationlayer.draw();
    },

    getHelix:
    function(){
        return this.modelStrand.getHelix();
    },
});

//insert extra base pair(s) to a strand to make curved structures; shown as triangles on StrandItem
var InsertItem = Backbone.View.extend({
    initialize: 
    function(phItem, strandItem, loc, length, draw) { 
        //InsertItem has fixed position on PathHelixItem but not on StrandItem
        var strand = strandItem.modelStrand;
        this.position = loc;
        this.parent = phItem;
        this.extraBase = length;

        //graphic variables
        this.sqLength = this.parent.sqLength;
        this.startX = this.parent.startX;
        this.yCoordTop = this.parent.startY+0.5*this.sqLength;
        this.yCoordBot = this.parent.startY+1.5*this.sqLength;

        //if even and scaffold - top.
        //if odd and scaffold - bottom
        //if even and staple - bottom.
        //if odd and staple - top.
        var drawOnTop = true;
        if(this.parent.getHelix().isEvenParity()^strand.strandSet.isScaffold())
            drawOnTop = false;

        if(drawOnTop){
            //top and bottom triangle
            var triangleTop = new Kinetic.Polygon({
                points: [this.startX+(this.position+0.7)*this.sqLength, 
                this.yCoordTop-1.5,
                this.startX+(this.position+0.3)*this.sqLength, 
                this.yCoordTop-this.sqLength,
                this.startX+(this.position+1.1)*this.sqLength, 
                this.yCoordTop-this.sqLength
                ],
                fill: "transparent",
                stroke: strandItem.itemColor,
                strokeWidth: 2
            });
            var textTop = new Kinetic.Text({
                x: this.startX+(this.position+0.7)*this.sqLength,
                y: this.yCoordTop-this.sqLength*2/3,
                text: this.extraBase,
                fontSize: this.sqLength*0.5,
                fontFamily: "Calibri",
                fill: colours.black,
            });
            textTop.setOffset({
                x: textTop.getWidth()/2, 
                y: textTop.getHeight()/2
            });
            triangle = triangleTop;
            text = textTop;
        }
        else{
            var triangleBot = new Kinetic.Polygon({
                points: [this.startX+(this.position+0.7)*this.sqLength, 
                this.yCoordBot+1.5,
                this.startX+(this.position+0.3)*this.sqLength, 
                this.yCoordBot+this.sqLength,
                this.startX+(this.position+1.1)*this.sqLength, 
                this.yCoordBot+this.sqLength
                ],
                fill: "transparent",
                stroke: strandItem.itemColor,
                strokeWidth: 2
            });
            var textBot = new Kinetic.Text({
                x: this.startX+(this.position+0.7)*this.sqLength,
                y: this.yCoordBot+this.sqLength*2/3,
                text: this.extraBase,
                fontSize: this.sqLength*0.5,
                fontFamily: "Calibri",
                fill: colours.black,
            });
            textBot.setOffset({
                x: textBot.getWidth()/2, 
                y: textBot.getHeight()/2
            });
            triangle = triangleBot;
            text = textBot;
        }

	    //grouping
        this.skipInsertGroup = new Kinetic.Group();
        this.skipInsertGroup.add(triangle);
        this.skipInsertGroup.add(text);
        this.skipInsertGroup.triangle = triangle;

        this.skipInsertGroup.superobj = this;
        this.skipInsertGroup.on("click", function() {
            var newExtra = prompt("Number of insertions","");
            if(newExtra !== null) {
                var nE = parseInt(newExtra,10);
                if(nE > 0) {
                    this.superobj.extraBase = nE;
                    text.setText(nE);
                }
            }
	    });
        strandItem.alterationArray[this.position] = this;
        strandItem.parent.options.parent.alterationlayer.add(this.skipInsertGroup);
        if(!draw)
            strandItem.parent.options.parent.alterationlayer.draw();
    },
});

//the counterpart of InsertItem where a base pair will be skipped in sequencing
var SkipItem = Backbone.View.extend({
    initialize: 
    function(phItem, strandItem, loc, draw) {
        this.position = loc;
        this.parent = phItem;
        this.extraBase = -1;

        //graphic variables
        this.sqLength = this.parent.sqLength;
        this.startX = this.parent.startX;
        this.yCoordTop = this.parent.startY+0.5*this.sqLength;
        this.yCoordBot = this.parent.startY+1.5*this.sqLength;

        var slashT1 = new Kinetic.Line({
            points: [this.startX+this.position*this.sqLength, this.yCoordTop-this.sqLength/2,
		     this.startX+(this.position+1)*this.sqLength, this.yCoordTop+this.sqLength/2],
	    stroke: colours.red,
	    strokeWidth: 2
        });

        var slashT2 = new Kinetic.Line({
            points: [this.startX+(this.position+1)*this.sqLength, this.yCoordTop-this.sqLength/2,
		     this.startX+this.position*this.sqLength, this.yCoordTop+this.sqLength/2],
	    stroke: colours.red,
	    strokeWidth: 2
        });

        var slashB1 = new Kinetic.Line({
            points: [this.startX+this.position*this.sqLength, this.yCoordBot-this.sqLength/2,
		     this.startX+(this.position+1)*this.sqLength, this.yCoordBot+this.sqLength/2],
	    stroke: colours.red,
	    strokeWidth: 2
        });
        
        var slashB2 = new Kinetic.Line({
            points: [this.startX+(this.position+1)*this.sqLength, this.yCoordBot-this.sqLength/2,
		     this.startX+this.position*this.sqLength, this.yCoordBot+this.sqLength/2],
	    stroke: colours.red,
	    strokeWidth: 2
        });

        //grouping
        this.skipInsertGroup = new Kinetic.Group();

        var strand = strandItem.modelStrand;
        var drawOnTop = true;
        if(this.parent.getHelix().isEvenParity()^strand.strandSet.isScaffold())
            drawOnTop = false;
        if(drawOnTop){
            this.skipInsertGroup.add(slashT1);
            this.skipInsertGroup.add(slashT2);
        }
        else { //even parity
            this.skipInsertGroup.add(slashB1);
            this.skipInsertGroup.add(slashB2);
        }

        this.parent.options.parent.alterationlayer.add(this.skipInsertGroup);
        strandItem.alterationArray[this.position] = this;
        if(!draw)
            strandItem.parent.options.parent.alterationlayer.draw();
    },
});

var StrandItemImage = Backbone.View.extend({ //a StrandItem look-alike that is not connected to model or mouse functionalities
    initialize: function(phItem, y, x1, x2) {
	this.parent = phItem;
	this.layer = this.parent.parent.templayer;
	this.panel = this.parent.parent.panel;
	this.divLength = this.parent.options.graphics.divLength;
	this.blkLength = this.parent.options.graphics.blkLength;
	this.sqLength = this.parent.options.graphics.sqLength;
	this.itemColor = colours.darkred;
	this.yLevel = y;
	this.xStart = Math.min(x1,x2);
	this.xEnd = Math.max(x1,x2);
        this.yCoord = this.parent.startY+(this.yLevel+0.5)*this.sqLength;
        this.xStartCoord = this.parent.startX+(this.xStart+1)*this.sqLength;
        this.xEndCoord = this.parent.startX+this.xEnd*this.sqLength;

	this.group = new Kinetic.Group();
	this.layer.add(this.group);
	if(this.xEnd-this.xStart >= 2) {
	    this.connection = new Kinetic.Rect({
		x: this.xStartCoord,
		y: this.yCoord-1,
		width: this.xEndCoord-this.xStartCoord,
		height: 2,
		fill: this.itemColor,
		stroke: this.itemColor,
		strokeWidth: 1
	    });
	    if(!this.yLevel) { //5->3
		//two endpoint's coordinates are taken from EndPointItem
                this.endP1 = new Kinetic.Polygon({
		    points: [this.parent.startX+(this.xStart+0.5)*this.sqLength-this.sqLength*0.2,this.yCoord-this.sqLength*0.35,
			     this.parent.startX+(this.xStart+0.5)*this.sqLength-this.sqLength*0.2,this.yCoord+this.sqLength*0.35,
			     this.parent.startX+(this.xStart+0.5)*this.sqLength+this.sqLength*0.5,this.yCoord+this.sqLength*0.35,
			     this.parent.startX+(this.xStart+0.5)*this.sqLength+this.sqLength*0.5,this.yCoord-this.sqLength*0.35],
		    fill: this.itemColor,
		    stroke: colours.darkred,
		    strokeWidth: 1,
		});
		this.endP2 = new Kinetic.Polygon({
		    points: [this.parent.startX+(this.xEnd+0.5)*this.sqLength+this.sqLength*0.3,this.yCoord,
			     this.parent.startX+(this.xEnd+0.5)*this.sqLength-this.sqLength*0.5,this.yCoord-this.sqLength*0.5,
			     this.parent.startX+(this.xEnd+0.5)*this.sqLength-this.sqLength*0.5,this.yCoord+this.sqLength*0.5],
		    fill: this.itemColor,
		    stroke: colours.darkred,
		    strokeWidth: 1,
		});
	    }
	    else { //3->5
                this.endP1 = new Kinetic.Polygon({
		    points: [this.parent.startX+(this.xEnd+0.5)*this.sqLength-this.sqLength*0.5,this.yCoord-this.sqLength*0.35,
			     this.parent.startX+(this.xEnd+0.5)*this.sqLength-this.sqLength*0.5,this.yCoord+this.sqLength*0.35,
			     this.parent.startX+(this.xEnd+0.5)*this.sqLength+this.sqLength*0.2,this.yCoord+this.sqLength*0.35,
			     this.parent.startX+(this.xEnd+0.5)*this.sqLength+this.sqLength*0.2,this.yCoord-this.sqLength*0.35],
		    fill: this.itemColor,
		    stroke: colours.darkred,
		    strokeWidth: 1,
		});
                this.endP2 = new Kinetic.Polygon({
		    points: [this.parent.startX+(this.xStart+0.5)*this.sqLength-this.sqLength*0.3,this.yCoord,
			     this.parent.startX+(this.xStart+0.5)*this.sqLength+this.sqLength*0.5,this.yCoord-this.sqLength*0.5,
			     this.parent.startX+(this.xStart+0.5)*this.sqLength+this.sqLength*0.5,this.yCoord+this.sqLength*0.5],
		    fill: this.itemColor,
		    stroke: colours.darkred,
		    strokeWidth: 1,
		});
	    }
	    this.group.add(this.connection);
	    this.group.add(this.endP1);
	    this.group.add(this.endP2);
	}
	this.layer.draw();
    },

    //low() and high() are parts of a hack to get indices limit for StrandItemImage
    low: function() {
	return this.xStart;
    },

    high: function() {
	return this.xEnd;
    },

    remove: function() {
	this.group.destroyChildren();
    },
});
