// Wall.js: Describes a wall in a map
// Arthur Wuterich
// 6/11/2014

var Wall = function( height, imageSrc ){
	this.height = height;
	this.image = null;

	if( typeof imageSrc !== "undefined" )
	{
		this.image = new Bitmap( imageSrc );
	}
}

// Returns an array of size of new walls
Wall.wallArray = function( size ){
	var result = [];
	for( var i = 0; i < size; i++ )
	{
		result.push( new Wall(0) );
	}
	return result;
}

Wall.nullWall = { "height":-1 };

