// Renderer.js: Renders a scene given a camera and a map object
// Arthur Wuterich
// 6/5/2014

// Constructor for renderer object
var Renderer = function( canvasContext, _renderResolution )
{
	// Setup rendering attributes
	this._size = { "x": window.innerWidth * 0.5, "y": window.innerHeight * 0.5 };
	this._renderResolution = _renderResolution;
	this._renderSpacing = this._size.x/_renderResolution;
	this._zIndexes = new Float32Array( _renderResolution );
	this._rayTracer = new RayTracer();

	// Modifyable render parameters
	this.renderRange = 10;
	this.renderScale = 1;

	// Fog
	this.renderFogColor = "#000000";
	this.renderFogRange = 5;

	// Setup canvas
	this.canvasContext = canvasContext.getContext( "2d" );
	canvasContext.width = this._size.x;
	canvasContext.height = this._size.y;
}

Renderer.prototype.changeResolution = function( _renderResolution ){
	this._renderResolution = _renderResolution;
	this._zIndexes = new Float32Array( _renderResolution );
	this._renderSpacing = this._size.x/this._renderResolution;
}

// Draws the sky 
Renderer.prototype.drawSky = function(camera, map) {
	var width = this._size.x * (CIRCLE / camera.fov);
	var left = -width * camera.direction / CIRCLE;

	this.canvasContext.save();
	this.canvasContext.drawImage(map.skybox.image, left, 0, width, this._size.y);
	if (left < width - this._size.x) 
	{
		this.canvasContext.drawImage(map.skybox.image, left + width, 0, width, this._size.y);
	}

	this.canvasContext.restore();
};

// Draws faux 3d columns
Renderer.prototype.drawColumns = function(camera, map) {
	this.canvasContext.save();
	for (var column = 0; column < this._renderResolution; column++) {
		this._zIndexes[column] = Infinity;
		var angle = camera.fov * (column / this._renderResolution - 0.5);
		var ray = this._rayTracer.cast( map, camera, angle, this.renderRange);
		this.drawColumn(column, ray, angle, map);
	}
	this.canvasContext.restore();
};

Renderer.prototype.drawColumn = function(column, ray, angle, map) {
	var canvasContext = this.canvasContext;
	var texture = map.wallTexture;
	var left = Math.floor(column * this._renderSpacing);
	var width = Math.ceil(this._renderSpacing);
	var hit = -1;

	while (++hit < ray.length && ray[hit].height <= 0);

	for (var s = ray.length - 1; s >= 0; s--) {
		var step = ray[s];

		if (s === hit) {
			this._zIndexes[column] = step.distance*this.renderScale;
			var textureX = Math.floor(texture.width * step.offset);
			var wall = this.project(step.height, angle, step.distance);

			canvasContext.globalAlpha = 1;
			canvasContext.drawImage(texture.image, textureX, 0, 1, texture.height, left, wall.top, width, wall.height);
			
			canvasContext.fillStyle = this.renderFogColor;
			canvasContext.globalAlpha = Math.max((step.distance + step.shading) / this.renderFogRange - ( map.light * this.renderScale ), 0);
			canvasContext.fillRect(left, wall.top, width, wall.height);
		}
	}
};

// Returns the required top and height of a wall column
Renderer.prototype.project = function(height, angle, distance) {
	var z = distance * Math.cos(angle)*this.renderScale;
	var wallHeight = this._size.y * height / z;
	var bottom = this._size.y / 2 * (1 + 1 / z);
	return {
		top: bottom - wallHeight,
		height: wallHeight
	}; 
};

// Will render a list of static objects
Renderer.prototype.draw2dList = function( list ){
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
Renderer.prototype.draw3dList = function( camera, list ){
	if( list.hasObjects() )
	{
		var objects = list.getObjects();
		for( index in objects )
		{
			var sObj = objects[index]; 

			// Find the distance from the camera
			var distance = Math.abs( Math.sqrt( 
				Math.pow( camera.position.x-sObj.position.x, 2 ) +
				Math.pow( camera.position.y-sObj.position.y, 2 )  ) )*this.renderScale;

			if( distance > this.renderRange )
				continue;

			// Find out if the object is in the viewframe of the player
			var objectAngle = this.wrappedOffset(Math.atan2((sObj.position.y-camera.position.y),(sObj.position.x-camera.position.x)));

			// Get the difference between the camera angle and the object angle
			var angle = Math.atan2(Math.sin(objectAngle-camera.direction), Math.cos(objectAngle-camera.direction));

			// If object is in viewframe then find relative x
			if( angle > -(.5*camera.fov) && angle < .5*camera.fov )
			{
				//angle = Math.cos(angle);
				var relativeX = (angle+camera.fov*.5)/camera.fov;
				var bitmapWidth = (sObj.bitmap.image.width/distance);
				var bitmapHeight = (sObj.bitmap.image.height/distance);

				// Drawing variables
				var drawX =  ((relativeX*this._size.x)-bitmapWidth/2);
				var startX = drawX;
				var finalX = ((relativeX*this._size.x)+bitmapWidth/2);

				while( drawX < finalX )
				{
					var column = Math.floor(drawX/this._renderSpacing);
					var nextColumn = (column+1)*this._renderSpacing
					var drawSlice = nextColumn-drawX;

					// Sometimes the floating point garbage causes 0 drawSlice issues
					// resolve by forcing a draw of the column width
					if( drawSlice == 0 )
					{
						drawSlice = this._renderSpacing;
						nextColumn += this._renderSpacing;
					}

					// If this is the final draw then only draw to the end of the bitmap
					if( drawX+drawSlice > finalX )
					{
						drawSlice = finalX-drawX;	
					}

					if( column<0 || column > this._renderResolution || this._zIndexes[column] < distance )
					{
						drawX = nextColumn;
						continue;
					}

					this.canvasContext.drawImage(
						sObj.bitmap.image,

						// Bitmap Clip X
						// Bitmap Clip Y
						(drawX-startX)*distance,
						0,

						// Width of cipped image
						// Height of clippled image
						drawSlice*distance,
						sObj.bitmap.height,

						// x to position
						// y to position
						drawX,
						this._size.y/2-(((sObj.bitmap.height+sObj.offset.y)/distance)/2),

						// width of dest
						// height of dest
						drawSlice,
						bitmapHeight

					);
					drawX = nextColumn;
				}
			}
		}
	}
};

// Will render a scene given a provided map and a camera
Renderer.prototype.drawScene = function( camera, map )
{
	if( camera == null || map == null )
	{
		console.log( "Cannot render through a null camera or map(camera,map): ", camera, map );
	}

	this.drawSky( camera, map );
	this.drawColumns( camera, map );
};
