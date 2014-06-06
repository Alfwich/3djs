// RenderList.js: Represents a list of objects to render in order
// Arthur Wuterich
// 6/6/2014

// Generates a RenderList object
var RenderList = function(){
	this.objects = [];
}

RenderList.prototype.addObject = function(obj){
	this.objects.push( obj );
}

RenderList.prototype.hasObjects = function(){
	return this.objects.length>0;
}

RenderList.prototype.getObjects = function(){
	return this.objects;
}
