// StaticObject.js: Represents a non animated object with position and a viewable surface
// Arthur Wuterich
// 6/6/2014

// Generates a new static object 
var StaticObject = function(  imageSrc ){
	this.position = { "x":0, "y":0 };
	this.offset = { "x":0, "y":0 };
	this.scale = { "x":1, "y":1 };
	this.image = new Bitmap( imageSrc );

	// Render attributes for the static object
	this.render = {};
	this.render.setZIndex = false;
}

StaticObject.prototype.setPosition = function( x, y ){
	this.position.x = x;
	this.position.y = y;
}

StaticObject.prototype.setOffset = function( x, y ){
	this.offset.x = x;
	this.offset.y = y;
}

StaticObject.prototype.setScale = function( x, y ){
	this.scale.x = x;
	this.scale.y = y;
}
