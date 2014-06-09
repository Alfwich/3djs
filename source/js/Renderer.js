// Renderer.js: Renders a scene given a camera and a map object
// Arthur Wuterich
// 6/5/2014

// Constructor for renderer object
var Renderer = function( canvasContext, resolution )
{
	// Setup rendering attributes
	this.size = { "x": window.innerWidth * 0.5, "y": window.innerHeight * 0.5 };
	this.renderRange = 10;
	this.resolution = resolution;
	this.spacing = this.size.x/resolution;
	this.scale = (this.size.x+this.size.y)/1200;
	this.tracer = new RayTracer();
	this.renderZIndexes = new Float32Array( resolution );

	// Fog
	this.fogColor = "#000000";
	this.fogRange = 5;

	// Setup canvas
	this.canvasContext = canvasContext.getContext( "2d" );
	canvasContext.width = this.size.x;
	canvasContext.height = this.size.y;
}

Renderer.prototype.changeResolution = function( resolution ){
	this.resolution = resolution;
	this.renderZIndexes = new Float32Array( resolution );
	this.spacing = this.size.x/this.resolution;
}

// Draws the sky 
Renderer.prototype.drawSky = function(camera, map) {
	var width = this.size.x * (CIRCLE / camera.fov);
	var left = -width * camera.direction / CIRCLE;

	this.canvasContext.save();
	this.canvasContext.drawImage(map.skybox.image, left, 0, width, this.size.y);
	if (left < width - this.size.x) 
	{
		this.canvasContext.drawImage(map.skybox.image, left + width, 0, width, this.size.y);
	}

	this.canvasContext.restore();
};

// Draws faux 3d columns
Renderer.prototype.drawColumns = function(camera, map) {
	this.canvasContext.save();
	for (var column = 0; column < this.resolution; column++) {
		this.renderZIndexes[column] = Infinity;
		var angle = camera.fov * (column / this.resolution - 0.5);
		var ray = this.tracer.cast( map, camera, angle, this.renderRange);
		this.drawColumn(column, ray, angle, map);
	}
	this.canvasContext.restore();
};

Renderer.prototype.drawColumn = function(column, ray, angle, map) {
	var canvasContext = this.canvasContext;
	var texture = map.wallTexture;
	var left = Math.floor(column * this.spacing);
	var width = Math.ceil(this.spacing);
	var hit = -1;

	while (++hit < ray.length && ray[hit].height <= 0);

	for (var s = ray.length - 1; s >= 0; s--) {
		var step = ray[s];

		if (s === hit) {
			this.renderZIndexes[column] = step.distance;
			var textureX = Math.floor(texture.width * step.offset);
			var wall = this.project(step.height, angle, step.distance);

			canvasContext.globalAlpha = 1;
			canvasContext.drawImage(texture.image, textureX, 0, 1, texture.height, left, wall.top, width, wall.height);
			
			canvasContext.fillStyle = this.fogColor;
			canvasContext.globalAlpha = Math.max((step.distance + step.shading) / this.fogRange - map.light, 0);
			canvasContext.fillRect(left, wall.top, width, wall.height);
		}
	}
};

// Returns the required top and height of a wall column
Renderer.prototype.project = function(height, angle, distance) {
	var z = distance * Math.cos(angle);
	var wallHeight = this.size.y * height / z;
	var bottom = this.size.y / 2 * (1 + 1 / z);
	return {
		top: bottom - wallHeight,
		height: wallHeight
	}; 
};

// Will render a list of static objects
Renderer.prototype.render2dList = function( list ){
	if( list.hasObjects() )
	{
		var objects = list.getObjects();
		for( index in objects )
		{
			var sObj = objects[index]; 
			this.canvasContext.drawImage( 
				sObj.bitmap.image, 
				sObj.position.x + sObj.offset.x, 
				sObj.position.y + sObj.offset.y,
				sObj.bitmap.image.width  * sObj.scale.x, 
				sObj.bitmap.image.height * sObj.scale.y
			);
		}
	}
};

// Returns the proper offset for wrapped radians
Renderer.prototype.wrappedOffset = function( radian ){
	return (radian+Math.PI*2)%(2*Math.PI);
}

// Will render an object with respects to the zindex of the world
Renderer.prototype.render3dList = function( camera, list ){
	if( list.hasObjects() )
	{
		var objects = list.getObjects();
		for( index in objects )
		{
			var sObj = objects[index]; 

			// Find the distance from the camera
			var distance = Math.abs( Math.sqrt( 
				Math.pow( camera.position.x-sObj.position.x, 2 ) +
				Math.pow( camera.position.y-sObj.position.y, 2 )  ) );

			if( distance > this.renderRange )
				continue;
			//console.log( distance );

			// Find out if the object is in the viewframe of the player
			var angle = this.wrappedOffset(Math.atan2((sObj.position.y-camera.position.y),(sObj.position.x-camera.position.x)))-camera.direction;
			//console.log( this.wrappedOffset(Math.atan2((sObj.position.y-camera.position.y),(sObj.position.x-camera.position.x))), camera.direction );
			//console.log( angle );

			// If object is in viewframe then find relative x
			if( angle > -(.5*camera.fov) && angle < .5*camera.fov )
			{
				//console.log( "Render Object", angle );
				var relativeX = (angle+camera.fov*.5)/camera.fov;
				var bitmapWidth = (sObj.bitmap.image.width/distance);
				var bitmapHeight = (sObj.bitmap.image.height/distance);
				var firstColumn = Math.floor( ((relativeX*this.size.x)-bitmapWidth/2)/this.spacing );
				var lastColumn = Math.floor( firstColumn+(bitmapWidth/this.spacing) );
				var pixelsPerColumn = sObj.bitmap.image.width/(lastColumn-firstColumn);
				//console.log( firstColumn, lastColumn, pixelsPerColumn );

				//console.log( Math.floor(relativeX*this.resolution) );

				for( var column = firstColumn; column <= lastColumn; column++ )
				{

					//var zIndex = Math.floor(relativeX*this.resolution);
					//console.log( column );

					if( column<0 || column > this.resolution || this.renderZIndexes[column] < distance )
					{
						continue;
					}

					// Update the Z-Index to this objects index
					this.renderZIndexes[column] = distance;

					this.canvasContext.drawImage(
						sObj.bitmap.image,

						// Bitmap Clip X
						// Bitmap Clip Y
						(column-firstColumn)*pixelsPerColumn,
						0,

						// Width of cipped image
						// Height of clippled image
						pixelsPerColumn,
						sObj.bitmap.height,

						// x to position
						// y to position
						column*this.spacing,
						this.size.y/2-((sObj.bitmap.height/distance)/2),

						// width of dest
						// height of dest
						this.spacing,
						bitmapHeight

					);
				}
			}
		}
	}
};

// Will render a scene given a provided map and a camera
Renderer.prototype.renderScene = function( camera, map )
{
	if( camera == null || map == null )
	{
		console.log( "Cannot render through a null camera or map(camera,map): ", camera, map );
	}

	this.drawSky( camera, map );
	this.drawColumns( camera, map );
};
