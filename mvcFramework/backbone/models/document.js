/* MODELS HERE */

var Document = Backbone.Model.extend({
    LatticeType: 0,
    localStorage: new Backbone.LocalStorage("cadnano"),

    initialize: function(){
        this.parts = new Array();
        this.undostack = new Undo.Stack();
	this.pathTool = "select";
    },

    isSaved: function(){
        return true;
    },
    
    createHoneyCombPart: function(){
        var mypart = new HoneyCombPart({
            currDoc:this,
        });
        mypart.setDoc(this);
        this.addPart(mypart,this);
    },
    
    createSquarePart: function(){
        var mypart = new SquarePart({
            currDoc:this,
        });
        mypart.setDoc(this);
        this.addPart(mypart,this);
    },

    part: function(){
         return this.parts[0]; 
    },
    
    push: function(modelpart){
        this.parts.push(modelpart);
    },
    
    addPart: function(modelPart,modelDoc){
        this.undostack.execute(new AddPartCommand(modelPart, modelDoc));
    },
    
    undo: function(){
        console.log(this.undostack);
        this.undostack.canUndo() && this.undostack.undo();
    },
    
    redo: function(){
        console.log(this.undostack);
        this.undostack.canRedo() && this.undostack.redo();
    },
    
    stackStatus: function(){
        console.log(this.undostack);
    },
    
    removePart: function(){
        this.parts.pop();
    },
    
    numParts: function(){
        return this.parts.length;
    },

    setKey: function(key){
	this.key = key;
    },

    getKey: function(){
	return this.key;
    },

    moveSliceItemToFirst: function() {
	this.trigger(cadnanoEvents.moveSliceItemToFirstSignal);
    },

    moveSliceItemToLast: function() {
	this.trigger(cadnanoEvents.moveSliceItemToLastSignal);
    },

});

var AddPartCommand = new Undo.Command.extend({
    constructor: function(part,modelDoc){
        console.log('AddPartCommand Constructor');
        this.modelPart = part;
        this.modelDoc = modelDoc;
        this.redo();
    },
    undo: function(){
        console.log('AddPartCommand undo');
        this.modelDoc.removePart();
        this.modelPart.trigger(cadnanoEvents.partRemovedSignal);
        if(this.modelDoc.numParts() === 0)
            this.modelDoc.trigger(cadnanoEvents.documentClearSelectionsSignal);
        this.modelDoc.save();
    },
    redo: function(){
        console.log('AddPartCommand redo');
        this.modelDoc.push(this.modelPart);
        this.modelDoc.trigger(cadnanoEvents.documentPartAddedSignal, 
                this.modelPart);
        this.modelDoc.save();
    },
    execute: function(){},
});
