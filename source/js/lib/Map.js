// Map.js: Represents the map of the currently loaded world
// Arthur Wuterich
// 6/5/2014

// Returns a map object of the current world
function Map(size) {
	this.size = size;
	this.wallGrid = new Uint8Array(size * size);
	this.skybox = new Bitmap('deathvalley_panorama.jpg', 4000, 1290);
	this.wallTexture = new Bitmap('wall_texture.jpg', 1024, 1024);
	this.light = 0;
}

// Returns the status of the wall object in the map at a given (x,y)
Map.prototype.get = function(x, y) {
	x = Math.floor(x);
	y = Math.floor(y);
	if (x < 0 || x > this.size - 1 || y < 0 || y > this.size - 1) return -1;
	return this.wallGrid[y * this.size + x];
};

// Randomizes the map with walls
Map.prototype.randomize = function() {
	for (var i = 0; i < this.size * this.size; i++) {
		this.wallGrid[i] = Math.random() < 0.3 ? 1 : 0;
	}
};

Map.prototype.update = function(seconds) {
};
