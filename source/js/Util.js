// Util.js: Utility objects
// Arthur Wuterich
// 6/5/2014

var IMAGE_PATH = "source/img/";

// Generates a new bitmap object
var Bitmap = function (src, width, height) {

	this.name = src;

	// Check to see if the image has already been loaded
	if( typeof Bitmap.loadedImages[src] !== "undefined" )
	{
		this.src = Bitmap.loadedImages[src];

		// Add this object to the image load callback if the image has not been loaded
		if( !this.src.complete )
		{
			Bitmap.loadedCallBack[src].push( this );
		}
	}
	else
	{
		// Load the image as a new image
		Bitmap.loadedImages[src] = new Image();
		Bitmap.loadedCallBack[src] = [this];
		this.src = Bitmap.loadedImages[src];
		this.src.name = src;
		this.src.src = IMAGE_PATH + src;
		this.width = width;
		this.height = height;

		// Set image size on load
		this.src.onload = this.setSize;
	}
}


// Callback to set image sizes if needed from an unloaded image
Bitmap.prototype.setSize = function(){

	for( index in Bitmap.loadedCallBack[this.name] )
	{
		var imageObject = Bitmap.loadedCallBack[this.name][index];
		if( typeof imageObject.width === "undefined" )
		{
			imageObject.width = this.width;
		}

		if( typeof imageObject.height === "undefined" )
		{
			imageObject.height = this.height;
		}
	}

	// Remove the unneeded references
	delete Bitmap.loadedCallBack[this.name];
}


// Static Variables
Bitmap.loadedImages = {};
Bitmap.loadedCallBack = {};
