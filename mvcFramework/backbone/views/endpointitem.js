var EndPointItem = Backbone.View.extend({
    initialize: 
    function(strandItem, dir, type, skipRedraw) { //last param is optional
        //accessing other objects
        this.parent = strandItem;
        this.phItem = this.parent.parent;
        this.layer = this.parent.layer;
        this.finalLayer = this.phItem.parent.finallayer;
        this.panel = this.parent.panel;

        //temporary layer that will be used for fast rendering
        this.tempLayer = this.phItem.parent.templayer;

        //graphics
        this.divLength = this.parent.divLength;
        this.blkLength = this.parent.blkLength;
        this.sqLength = this.parent.sqLength;
	this.itemColor = this.parent.itemColor;
	
        //misc. properties
        this.dir = dir;
        this.prime = type;
        this.yLevel = this.parent.yLevel;
        this.isScaf = this.parent.isScaf;
	this.selectedIndex = -1;	

        //counters
    	this.updateCounter();
        this.initcounter = this.counter;
        this.pCounter = this.counter;

        //starting position
        this.centerX = this.phItem.startX+(this.counter+0.5)*this.sqLength;
        this.centerY = this.parent.yCoord;
	
        //vertices of the shape
        var polypts;
        if(this.prime === 3) { //3' end: triangle
            polypts = [
                this.centerX-(2*this.yLevel-1)*this.sqLength*0.3,
                this.centerY,
                this.centerX+(2*this.yLevel-1)*this.sqLength*0.5,
                this.centerY-this.sqLength*0.5,
                this.centerX+(2*this.yLevel-1)*this.sqLength*0.5,
                this.centerY+this.sqLength*0.5
            ];
        }
        else if(this.prime === 5) { //5' end: square
            //reason I didn't use Kinetic.Rect: its getX() works differently and shows the shape at wrong position
            polypts = [
                this.centerX-this.sqLength*0.2-this.sqLength*this.yLevel*0.3,
                this.centerY-this.sqLength*0.35,
                this.centerX-this.sqLength*0.2-this.sqLength*this.yLevel*0.3,
                this.centerY+this.sqLength*0.35,
                this.centerX+this.sqLength*0.5-this.sqLength*this.yLevel*0.3,
                this.centerY+this.sqLength*0.35,
                this.centerX+this.sqLength*0.5-this.sqLength*this.yLevel*0.3,
                this.centerY-this.sqLength*0.35
            ];
        }

	//the square/triangle depending on 3p/5p
	this.shape = new Kinetic.Polygon({
	    points: polypts,
	    fill: this.itemColor,
	    stroke: colours.black,
	    strokeWidth: 1,
	    draggable: true,
	    dragBoundFunc: function(pos) {
		return {
		    x: this.getAbsolutePosition().x,
		    y: this.getAbsolutePosition().y
		}
	    }
	});

	this.shape.superobj = this; //javascript y u no have pointers?!
	var isScaf = this.isScaf;

	this.shape.on("click", function(pos) {
	    this.superobj.phItem.parent.prexoverlayer.destroyChildren();
	    this.superobj.phItem.parent.part.setActiveVirtualHelix(this.superobj.phItem.options.model);
	    var pathTool = this.superobj.phItem.currDoc().pathTool;
	    if(pathTool === "pencil") {
		this.superobj.createXover();
	    }
	});

	this.shape.on("mousedown", function(pos) {
	    //recalculate range of movement of this endpointitem.
	    this.superobj.minMaxIndices = this.superobj.parent.modelStrand.getLowHighIndices(this.superobj.prime);
	    /*
	      Since there are so many shapes on strandlayer, it is preferred to redraw the layer as few times as possible. For this reason, the layer is only refreshed when
	      the dragging is done. But this means the group should not move while dragging, and we need some other shapes to show where the group is. The red box is drawn
	      on a separate layer so render speed is fast. Both the implementation and idea are very similar to ActiveSliceItem, but this (and StrandItem) takes it a step
	      further.
	    */
	    if(this.superobj.phItem.currDoc().getKey() === 18){ 
		//holding ALT = extend to furthest possible location (works regardless of path tool)
		if(this.superobj.dir === "L") {
		    this.superobj.counter = this.superobj.minMaxIndices[0];
		    this.superobj.move();
		}
		else {
		    this.superobj.counter = this.superobj.minMaxIndices[1];
		    this.superobj.move();
		}
		return;
	    }

	    var pathTool = this.superobj.phItem.currDoc().pathTool;
	    if(this.superobj.phItem.currDoc().getKey() !== 18 && pathTool === "select" && tbSelectArray[3] && ((isScaf && tbSelectArray[0])||(!isScaf && tbSelectArray[1]))) {
		this.superobj.selectStart(pos);
		//this.superobj.itemSelectedP1();
	    }
	});

	this.shape.on("dragmove", function(pos) {
		var pathTool = this.superobj.phItem.currDoc().pathTool;
		if(this.superobj.phItem.currDoc().getKey() !== 18 && pathTool === "select" && tbSelectArray[3] && ((isScaf && tbSelectArray[0])||(!isScaf && tbSelectArray[1]))) {
            this.superobj.selectMove(pos);
	    }
	});

	this.shape.on("dragend", function(pos) {
		var pathTool = this.superobj.phItem.currDoc().pathTool;
		if(this.superobj.phItem.currDoc().getKey() !== 18 && pathTool === "select" && tbSelectArray[3] && ((isScaf && tbSelectArray[0])||(!isScaf && tbSelectArray[1]))) {
            this.superobj.selectEnd();
	    }
	});
	
    this.layer.add(this.shape);
	this.parent.addEndItem(this,dir,skipRedraw); //finally linking this item back to StrandItem
    },

    updateCounter: function(){ //get counter from model
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

    update: function() { //update graphics variables, everything is based on counter except for counter itself
        this.updateCounter();
        this.updateCenterX();
        this.pCounter = this.counter;
        this.shape.setX((this.counter-this.initcounter)*this.sqLength);
    },

    updateY: function() { //updates Y position
	var diff = this.parent.yCoord-this.centerY;
	this.centerY = this.parent.yCoord;
	this.shape.setY(this.shape.getY()+diff);
    },

    adjustCounter: function(n) { //limit counter range
	this.counter = Math.min(
            Math.max(this.minMaxIndices[0],n),
            this.minMaxIndices[1]
        );
    },

    selectStart: function(pos) {
	this.dragInit = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth+this.panel.scrollLeft)/this.phItem.parent.scaleFactor-5*this.sqLength)/this.sqLength); //should not be changed
	this.redBox = new Kinetic.Rect({ //temporary red box to show position while leaving strand layer untouched
	    x: this.centerX-this.sqLength/2,
	    y: this.centerY-this.sqLength/2,
	    width: this.sqLength,
	    height: this.sqLength,
	    fill: "transparent",
	    stroke: colours.red,
	    strokeWidth: 2,
	});
	this.redBox.superobj = this;
	this.redBox.on("mouseup", function(pos) {
	    var papa = this.superobj;
	    this.destroy();
	    papa.tempLayer.draw();
	});
	this.tempLayer.add(this.redBox);
	this.tempLayer.draw();
	this.minMaxIndices = this.parent.modelStrand.getLowHighIndices(this.prime);
    },

    selectMove: function(pos) {
	//we still want to keep track of the location (by counter in this case) so we know where we should draw the red square
	var tempCounter = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth+this.panel.scrollLeft)/this.phItem.parent.scaleFactor-5*this.sqLength)/this.sqLength);
	this.adjustCounter(tempCounter);
	if(this.counter !== this.pCounter) { //idea: only reset params and redraw when counter changes, and change params based on the change
	    //redrawing red box
	    this.redBox.setX(this.redBox.getX()+(this.counter-this.pCounter)*this.sqLength)
	    this.tempLayer.draw();
	    this.pCounter = this.counter;
	}
    },

    selectEnd: function() {
        //red box has finished its duty, to be deleted
        this.redBox.remove();
        this.tempLayer.draw();
        this.move();
    },

    /*
    itemSelectedP1: function() {
	this.phItem.parent.selectedItemsTemp.push(this);
    },

    itemSelected: function() {
	this.shape.setFill(colours.red);
	this.selectedIndex = this.phItem.parent.selectedItems.length;
	this.phItem.parent.selectedItems.push(this);
    },

    itemDeselected: function() {
	this.shape.setFill(this.itemColor);
	this.phItem.parent.selectedItems[this.selectedIndex] = undefined;
	this.selectedIndex = -1;
    },
    */

    move: function() {
        //redraw shape; wait for all elements to be adjusted to correct location before rendering
        //update counter and value in StrandItem
        if(this.dir === "L") {
            this.parent.xStart = this.counter;
        }
        else {
            this.parent.xEnd = this.counter;
        }
        //remove elements on final layer
        this.finalLayer.destroyChildren();
        this.finalLayer.draw();

        //send out the resize signal to the model.
        this.parent.modelStrand.resize(this.parent.xStart,
                this.parent.xEnd);
    },

    getRidOf:
    function(){
        this.shape.destroy();
        this.close();
    },

    createXover: 
    function() {
        console.log('attemping to create xover');
        var helixset = this.phItem.options.parent;
        if(helixset.pencilendpoint === undefined) {
            console.log('in 3 prime function');
            //clicking the first endpoint only stores its info
            helixset.pencilendpoint = this;
            if(this.prime !== 3)
                return;

            //a red shape that lies on top of original as indicator
            var pencilNotifier = helixset.pencilendpoint.shape.clone(); 

            pencilNotifier.off("mousedown");
            pencilNotifier.off("click");
            pencilNotifier.setFill(colours.red);

            this.tempLayer.add(pencilNotifier);
            this.tempLayer.draw();

            pencilNotifier.on("click", function() { //click again = cancel
                helixset.pencilendpoint.tempLayer.destroyChildren();
                pencilNotifier.destroy();
                helixset.pencilendpoint.tempLayer.draw();
                helixset.pencilendpoint = undefined;
            });
        }
        else {
            console.log('in 5 prime function');

            var s5p = helixset.pencilendpoint.parent.modelStrand;
            var s5pIdx = s5p.idx3Prime();
            var s3p = this.parent.modelStrand;
            var s3pIdx = s3p.idx5Prime();
            console.log(s5p);
            console.log(s3p);
            console.log(this.prime);
            console.log(s5p.strandSet.isScaffold());
            console.log(s3p.strandSet.isScaffold());

            if(this.prime !== 5 || 
            (s5p.strandSet.isScaffold()^s3p.strandSet.isScaffold())) 
                return;

            console.log('in 5 prime function passed checks');
            helixset.pencilendpoint.tempLayer.destroyChildren();
            helixset.pencilendpoint.tempLayer.draw();
            helixset.pencilendpoint = undefined;

            var part = s5p.strandSet.part;
            part.createXover(s5p, s5pIdx, s3p, s3pIdx);

            this.finalLayer.destroyChildren();
            this.finalLayer.draw();
            return;
        }
    },

    show: function(flag){
        this.shape.setVisible(flag);
    },
});
