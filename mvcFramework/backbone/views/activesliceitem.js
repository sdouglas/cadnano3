//the reddish movable bar on top of PathHelixItems
var ActiveSliceItem = Backbone.View.extend({
    initialize: function(){
	this.parent = this.options.parent;
	this.layer = this.parent.activeslicelayer;
	this.panel = this.parent.panel;

	//graphics variables
	this.divLength = this.options.graphics.divLength;
	this.blkLength = this.options.graphics.blkLength;
	this.sqLength = this.options.graphics.sqLength;
	this.top = 3*this.sqLength;
	this.bot = 0;

	//counters
	this.initcounter = this.divLength*this.blkLength*this.parent.part.getStep()/2; //initial counter is used to determine absolute position
	this.counter = this.initcounter; //current counter
	this.pCounter = this.counter; //previous counter is used to determine when to update

	//signals sent from document.js
	this.listenTo(this.parent.part.currDoc,cadnanoEvents.moveSliceItemToFirstSignal,this.moveSliceItemToFirstSlot);
	this.listenTo(this.parent.part.currDoc,cadnanoEvents.moveSliceItemToLastSignal,this.moveSliceItemToLastSlot);

	this.rect = new Kinetic.Rect({
	    x: 5*this.sqLength+this.counter*this.sqLength,
	    y: this.top,
	    width: this.sqLength,
	    height: 0,
	    fill: colours.orangefill,
	    stroke: colours.black,
	    strokeWidth: 1,
	    opacity: 0.6
	});
	this.counterText = new Kinetic.Text({
	    x: 5*this.sqLength+(this.counter+0.5)*this.sqLength,
	    y: this.top-18,
	    text: this.counter,
	    fontSize: 16,
	    fontFamily: "Calibri",
	    fill: colours.black,
	    });
	this.counterText.setOffset({ //centering the text (note: align center doesn't work)
	    x: this.counterText.getWidth()/2
	});

	this.group = new Kinetic.Group({
	    draggable: true,
	    dragBoundFunc: function(pos) {
		/*
		  The group is not intended to be draggable; when we want to move its location we change its X in update()
		  But if we don't set draggable to true, we can't call dragmove. This method makes it easier to efficiently send signals.
		*/
		return {
		    x: this.getAbsolutePosition().x,
		    y: this.getAbsolutePosition().y
		}
	    }
	});
	this.group.superobj = this;
	this.group.on("dragmove", function(pos) {
	    //51 accounts for the slice button div width
	    //innerLayout.state.west.innerWidth accounts for the slice view div width
	    //panel.scrollLeft accounts for left-right scrolling
	    var tempCounter = Math.floor(((pos.x-51-innerLayout.state.west.innerWidth+this.superobj.panel.scrollLeft)/this.superobj.parent.scaleFactor)/this.superobj.sqLength-5);
	    this.superobj.adjustCounter(tempCounter); //counter should always be between 0 and grid length
	    if(this.superobj.counter !== this.superobj.pCounter) { //only draws when counter is changed; more efficient
		this.superobj.pCounter = this.superobj.counter;
		this.superobj.update();
		//throw out signals here
		//change the model object.
		this.superobj.parent.part.setActiveBaseIndex(this.superobj.counter);
	    }
	});
	this.group.add(this.rect);
	this.group.add(this.counterText);
	this.layer.add(this.group);
	this.group.hide();
    },

    update: function() { //puts group in correct location
        this.counterText.setText(this.counter);
	this.counterText.setOffset({x: this.counterText.getWidth()/2});
	this.group.setX((this.counter-this.initcounter)*this.sqLength);
	this.layer.draw();
    },

    moveSliceItemToFirstSlot: function() {
	if(this.parent.phItemArray.defined.length > 0) {
	    this.counter = 0;
	    this.pCounter = this.counter;
	    this.update();
	    this.parent.part.setActiveBaseIndex(this.superobj.counter);
	}
    },

    moveSliceItemToLastSlot: function() {
	if(this.parent.phItemArray.defined.length > 0) {
	    this.counter = this.divLength*this.blkLength*this.parent.part.getStep()-1;
	    this.pCounter = this.counter;
	    this.update();
	    this.parent.part.setActiveBaseIndex(this.superobj.counter);
	}
    },

    updateHeight: function() { //makes the bar span through all PathHelixItem
	var numItems = this.parent.phItemArray.defined.length;
	if(numItems >= 1){
	    this.group.show();
	    this.bot = 5*this.sqLength+4*this.sqLength*numItems;
	    this.rect.setHeight(this.bot-this.top);
	}
	else {
	    this.group.hide();
	}
	this.layer.draw();
    },

    adjustCounter: function(n) { //counter (and hence the bar itself) is limited to valid indices
	this.counter = Math.min(Math.max(0,n),this.blkLength*this.divLength*this.parent.part.getStep()-1);
    },
});
