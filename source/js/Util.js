// Util.js: Utility objects
// Arthur Wuterich
// 6/5/2014

var IMAGE_PATH = "source/img/";

// Generates a new bitmap object
function Bitmap(src, width, height) {
	this.image = new Image();
	this.image.src = IMAGE_PATH + src;
	this.width = width;
	this.height = height;

	// Set image size on load
	this.image.parent = this;
	this.image.onload = this.setSize.bind(this);
}

// Callback to set image sizes if a load is needed
Bitmap.prototype.setSize = function(){
	if( typeof this.width === "undefined" )
	{
		this.width = this.image.width;
	}

	if( typeof this.height === "undefined" )
	{
		this.height = this.image.height;
	}
}

