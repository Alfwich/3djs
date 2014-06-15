// Map.js: Represents the map of the currently loaded world
// Arthur Wuterich
// 6/5/2014

// Returns a map object of the current world
function Map(size) {
	this.size = size;
	this.wallArray = Wall.wallArray( size*size );
	this.skybox = new Bitmap('outdoor_background.png');
	this.light = 0;
}

// Returns the height at a given point
Map.prototype.get = function(x, y) {
	x = Math.floor(x);
	y = Math.floor(y);
	if (x < 0 || x > this.size - 1 || y < 1 || y > this.size - 1) return Wall.nullWall;
	return this.wallArray[y * this.size + x];
};

Map.prototype.set = function(x, y, wall) {
	if( typeof wall === "number" )
	{
		this.wallArray[y * this.size + x].height = wall;
	}
	else if ( typeof wall === "object" )
	{
		this.wallArray[y * this.size + x] = wall;
	}
}

// Randomizes the map with walls
Map.prototype.randomize = function() {
	for (var i = 0; i < this.size * this.size; i++) {
		this.wallArray[i].height = Math.random() < 0.3 ? 1 : 0;
		if( Math.random() < 0.5 )
		{
			this.wallArray[i].image = new Bitmap( "wall_texture.jpg" );
		}
		else
		{
				this.wallArray[i].image = new Bitmap( "wall_texture_metal.jpg" );
		}
	}
};

Map.prototype.update = function(seconds) {
};
