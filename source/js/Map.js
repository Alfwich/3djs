// Map.js: Represents the map of the currently loaded world
// Arthur Wuterich
// 6/5/2014

// Returns a map object of the current world
function Map(size) {
	this.size = size;
	this.heightMap = new Uint8Array(size * size);
	this.skybox = new Bitmap('outdoor_background.png');
	this.wallTexture = new Bitmap('wall_texture.jpg');
	this.light = 0;
}

// Returns the height at a given point
Map.prototype.get = function(x, y) {
	x = Math.floor(x);
	y = Math.floor(y);
	if (x < 0 || x > this.size - 1 || y < 0 || y > this.size - 1) return -1;
	return this.heightMap[y * this.size + x];
};

Map.prototype.set = function(x, y, wall) {
	this.heightMap[y * this.size + x] = wall;
}

// Randomizes the map with walls
Map.prototype.randomize = function() {
	for (var i = 0; i < this.size * this.size; i++) {
		this.heightMap[i] = Math.random() < 0.3 ? 1 : 0;
	}
};

Map.prototype.update = function(seconds) {
};
