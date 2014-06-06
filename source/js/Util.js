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
}


