var PartItem = Backbone.View.extend({
    initialize: function(){
        this.who = this.options.who;
        this.params = this.options.params;
        this.handler = new viewHandler(this.who);
        this.handler.setParams(this.params);
        this.chosenHelixHash = new Array();
        this.connectSignalsSlots();
        console.log(this.handler);
    },

    connectSignalsSlots: function(){
        this.listenTo(this.part,
            cadnanoEvents.partVirtualHelixAddedSignal,
            this.partVirtualHelixAddedSlot
            );
        this.listenTo(this.part,
            cadnanoEvents.partHelicesInitializedSignal,
            this.partHelicesInitializedSlot
            );
    },

    createVirtualHelixItem: function(vh){
        //update the rendering of the item.
        this.vhItemSet.render();
    },

    isHelixSelected: function(row,col){
        if(this.chosenHelixHash[row][col])
            return true;
        return false;
    },
});

var SlicePartItem = PartItem.extend({
    initialize: function(){
        this.part = this.options.part;
        this._super({
            part:   this.options.part,
            param:  this.options.params,
            who:    this.options.who,
        });
        this.emptyItemSet = new EmptyHelixSetItem({
            el:$('#sliceView'),
            part: this.options.part,
            handler: this.handler,
        });
        console.log(this.handler);

        this.vhItemSet = new VirtualHelixSetItem({
            el: $('#sliceView'),
            part: this.options.part,
            handler: this.handler,
            collection: this.options.part.getVHSet(),
        });

        //console.log(this.el);
        //this.handler.addToDom(this.el);
        this.setLattice(this.part.generatorFullLattice());
    },
    
    render: function(){
        this.handler.render();
        console.log('just called render');
        console.log($('#sliceView'));
    },

    setLattice: function(newCoords){
        for (var i in newCoords){
            this.emptyItemSet.createEmptyHelix(newCoords[i]);
        }
        this.part.initializedHelices(true);
    },
    partHelicesInitializedSlot: function(){
        console.log('received helix added signal');
        this.emptyItemSet.render();
    },
    partVirtualHelixAddedSlot: function(virtualHelix){
        //Add the virtual helix item to a hash.
        //Change the color of the virtual helix item
        //to show selection.
        console.log("currently in partVirtualHelixAddedSlot");

        this.createVirtualHelixItem(virtualHelix);
    },
    //TODO
    //addScafifStapIsMissing
    //addStapifScafIsMissing

});

var PathPartItem = PartItem.extend({
    initialize: function(){
        this._super({
            part:   this.options.part,
            param:  this.options.params,
            who:    this.options.who,
        });
        this.connectPathSignalsSlots();
        //this.render();
    },
    connectPathSignalsSlots: function(){
        console.log(this.part);
        this.listenTo(this.part,
            cadnanoEvents.partActiveSliceResizedSignal,
            this.partActiveSliceResizedSlot
        );
    },

    partVirtualHelixAddedSlot: function(virtualHelix){
        //TODO
        //Add in a new path in the path view panel.
    },
    partActiveSliceResizedSlot: function(){
    },
});
