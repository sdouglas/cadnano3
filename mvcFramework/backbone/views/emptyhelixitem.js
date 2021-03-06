var EmptyHelixSetItem = Backbone.View.extend({
    initialize: function(){
        this.handler = this.options.handler;
        this.part = this.options.part;
        this.emptyHelixHash = new Array();
        this.partItem = this.options.parent;
    },
    
    createEmptyHelix: function(coord){
        var view = new EmptyHelixItem({
            el: $('#sliceView'),
            handler: this.handler,
            part: this.part,
            row: coord.row,
            col: coord.col,
        });
        if(!this.emptyHelixHash[coord.row]){
            this.emptyHelixHash[coord.row] = new Array();
        }
        this.emptyHelixHash[coord.row][coord.col] = view;
    },

    render: function(){
        this.handler.shapeRender();
    },

    events: {
        "click" : "onMouseClick",
    },

    onMouseClick: function(e){
	if(!this.partItem.dontClickHelix) { //prevents triggering mouse click function two times
	    //console.log("clicked the vhsetitem.");
	    //Figure out which helix was clicked.
	    //console.log(this.part.currDoc);
	    var coord = this.part.latticePositionXYToCoord(e.pageX, e.pageY, this.partItem.zoomFactor);
	    if(coord.row === -1 || coord.col === -1) return;
	    if(coord.row >= this.part.getRows() || coord.col >= this.part.getCols()) return;
	    
	    var id = this.part.getStorageID(coord.row,coord.col);
	    var helixModel = this.part.getModelHelix(id);
	    //Do whatever you need to to the helix.
	    //if selected, then add staple/scaffold.
	    //if unselected, then create a helix model.
	    //var idx = this.part.activeBaseIndex();
	    if(!helixModel){
		//create a new vhmodel and insert it.
		helixModel = this.part.createVirtualHelix(coord.row,coord.col);
	    }
	    else if(this.part.getDoc().getKey() === 16) { //holding SHIFT = staple strand created
		var idx = this.part.activeBaseIndex();
		if (!helixModel.stapStrandSet.hasStrandAt(idx-1,idx+1)){
		    //console.log('creating staple strand at :' + idx);
		    if(idx === 0) { //if active slice item is at far left
			helixModel.stapStrandSet.createStrand(0,1);
		    }
		    else if(idx === 21*this.part.getStep()-1) { //active slice item is at far right; this only works for honeycomb lattice
			helixModel.stapStrandSet.createStrand(idx-1,idx);
		    }
		    else { //normal case
			helixModel.stapStrandSet.createStrand(idx-1,idx+1);
		    }
		}
	    }
	    else { //otherwise create scaffold strand
		var idx = this.part.activeBaseIndex();
		if (!helixModel.scafStrandSet.hasStrandAt(idx-1,idx+1)){
		    //console.log('creating scaffold strand at :' + idx);
		    if(idx === 0) {
			helixModel.scafStrandSet.createStrand(0,1);
		    }
		    else if(idx === 21*this.part.getStep()-1) { //again, this only works for honeycomb lattice
			helixModel.scafStrandSet.createStrand(idx-1,idx);
		    }
		    else {
			helixModel.scafStrandSet.createStrand(idx-1,idx+1);
		    }
		}
	    }
	}
	this.partItem.dontClickHelix = false;
    },

    remove: function(){
        delete this.emptyHelixHash;
        this.render();
    },
});

var EmptyHelixItem = Backbone.View.extend ({
    initialize: function(){
        this.part = this.options.part;
        this.row = this.options.row;
        this.col = this.options.col;
        var pos = this.part.latticeCoordToPositionXY(this.row,this.col);
        //console.log(this.row + ',' + this.col);
        this.handler = this.options.handler;

        //console.log(this.part);
        //console.log(pos.x + ',' + pos.y);
        var params = {
            fill: colours.grayfill,
            stroke: colours.graystroke,
            strokewidth: colours.strokewidth,
        };
        this.polygon = this.handler.createCircle(pos.x, 
            pos.y, this.part.radius, params);
    },
});
