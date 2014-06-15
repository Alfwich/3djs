// Renderer.js: Renders a scene given a camera and a map object
// Arthur Wuterich
// 6/5/2014

// Constructor for renderer object
var Renderer = function( canvasContext, renderResolution )
{
	// Setup rendering attributes
	this._size = { "x": window.innerWidth * 0.5, "y": window.innerHeight * 0.5 };
	this._renderResolution = renderResolution;
	this._renderSpacing = this._size.x/renderResolution;
	this._zIndexes = new Float32Array( renderResolution );
	this._rayTracer = new RayTracer();
	this._canvasContext = canvasContext.getContext( "2d" );

	// Setup renderer render attributes
	this.render = {};
	// Modifyable render parameters
	this.render.range = 10;
	this.render.scale = 1;

	// Fog
	this.render.fog = {};
	this.render.fog.color = "#000000";
	this.render.fog.range = 5;

	// Setup canvas
	canvasContext.width = this._size.x;
	canvasContext.height = this._size.y;
}

Renderer.prototype.changeResolution = function( renderResolution ){
	this._renderResolution = renderResolution;
	this._zIndexes = new Float32Array( renderResolution );
	this._renderSpacing = this._size.x/renderResolution;
}

// Draws the sky 
Renderer.prototype.drawSky = function(camera, map) {
	var width = this._size.x * (Math.circle / camera.fov);
	var left = -width * camera.direction / Math.circle;

	this._canvasContext.save();
	this._canvasContext.drawImage(map.skybox.src, left, 0, width, this._size.y);
	if (left < width - this._size.x) 
	{
		this._canvasContext.drawImage(map.skybox.src, left + width, 0, width, this._size.y);
	}

	this._canvasContext.restore();
};

// Draws faux 3d columns
Renderer.prototype.drawColumns = function(camera, map) {
	this._canvasContext.save();
	for (var column = 0; column < this._renderResolution; column++) {
		this._zIndexes[column] = Infinity;
		var angle = camera.fov * (column / this._renderResolution - 0.5);
		var ray = this._rayTracer.cast( map, camera, angle, this.render.range);
		this.drawColumn(column, ray, angle, map);
	}
	this._canvasContext.restore();
};

Renderer.prototype.drawColumn = function(column, ray, angle, map) {
	var canvasContext = this._canvasContext;
	var left = Math.floor(column * this._renderSpacing);
	var width = Math.ceil(this._renderSpacing);
	var hit = -1;

	while (++hit < ray.length && ray[hit].height <= 0);

	for (var s = ray.length - 1; s >= 0; s--) {
		var step = ray[s];

		if (s === hit) {
      var texture = step.wall.image;
			this._zIndexes[column] = step.distance*this.render.scale;
			var textureX = Math.floor(texture.width * step.offset);
			var wall = this.project(step.height, angle, step.distance);

			canvasContext.globalAlpha = 1;
			canvasContext.drawImage(texture.src, textureX, 0, 1, texture.height, left, wall.top, width, wall.height);
			
			canvasContext.fillStyle = this.render.fog.color;
			canvasContext.globalAlpha = Math.max((step.distance + step.shading) / this.render.fog.range - ( map.light * this.render.scale ), 0);
			canvasContext.fillRect(left, wall.top, width, wall.height);
		}
	}
};

// Returns the required top and height of a wall column
Renderer.prototype.project = function(height, angle, distance) {
	var z = distance * Math.cos(angle)*this.render.scale;
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
			this._canvasContext.drawImage( 
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
			var xDistance = Math.pow( camera.position.x-sObj.position.x, 2 );
			var yDistance = Math.pow( camera.position.y-sObj.position.y, 2 );
			var distance = Math.sqrt( xDistance + yDistance )*this.render.scale;

			if( distance > this.render.range )
				continue;

			// Find out if the object is in the viewframe of the player
			var objectAngle = this.wrappedOffset(Math.atan2((sObj.position.y-camera.position.y),(sObj.position.x-camera.position.x)));

			// Get the difference between the camera angle and the object angle
			var angle = Math.atan2(Math.sin(objectAngle-camera.direction), Math.cos(objectAngle-camera.direction));

			// If object is in viewframe then find relative x and render
			if( angle > -(.5*camera.fov) && angle < .5*camera.fov )
			{
				//angle = Math.cos(angle);
				var relativeX = (angle+camera.fov*.5)/camera.fov;
				var bitmapWidth = (sObj.image.width/distance);
				var bitmapHalfWidth = bitmapWidth/2;
				var bitmapHeight = (sObj.image.height/distance);

				// Drawing variables
				var relativeSX = (relativeX*this._size.x);
				var drawX =  relativeSX - bitmapHalfWidth;
				var finalX = relativeSX + bitmapHalfWidth;
				var yOffset = (((sObj.image.height+sObj.offset.y)/distance)/2);
				var startX = drawX; 

				// Draw until we reach the end of the bitmap
				while( drawX < finalX )
				{
					// Get the next column for drawing
					var column = Math.floor(drawX/this._renderSpacing);
					var nextColumn = (column+1)*this._renderSpacing

					// Compute the slice to be drawn
					var drawSlice = nextColumn-drawX;

					// Sometimes floating point garbage causes 0 drawSlice issues
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

					// If the distance of this slice is less than the current z-index then draw the column
					if( !( column < 0 || column > this._renderResolution || this._zIndexes[column] < distance ) )
					{
						// Update the z-index if this object sets the z-index
						if( sObj.render.setZIndex )
						{
							this._zIndexes[column] = distance;
						}

						// Render the object
						this._canvasContext.drawImage(
							sObj.image.src,

							// Bitmap Clip X
							// Bitmap Clip Y
							(drawX-startX)*distance,
							0,

							// Width of cipped image
							// Height of clippled image
							drawSlice*distance,
							sObj.image.height,

							// x to position
							// y to position
							drawX,
							this._size.y/2-yOffset,

							// width of dest
							// height of dest
							drawSlice,
							bitmapHeight

						);
					}

					// Update the start of the next draw cycle
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


/* EOF */
