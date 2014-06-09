// Raytracer.js: Recursive ray-tracer
// Arthur Wuterich
// 6/5/2014

// Constructor

var RayTracer = function()
{
}

RayTracer.prototype.floorToScale = function( val, scale ){
	return Math.floor( val/scale )*scale;
}

RayTracer.prototype.ceilToScale = function( val, scale ){
	return Math.ceil( val/scale )*scale;
}

RayTracer.prototype.deltaToNextUnitCeil = function( val, scale ){
	var result = (Math.floor(val/scale)*scale)-val;
	if( result==0 ){ return -scale; }
	return result;
}

RayTracer.prototype.deltaToNextUnitFloor = function( val, scale ){
	var result = (Math.floor((val/scale)+1)*scale)-val;
	if( result==0 ){ return scale; }
	return result;
}

// Will return a ray object with all of the ray data
RayTracer.prototype.cast = function( map, camera, angle, distance )
{
	var tracer = this;
	var sin = Math.sin(angle);
	var cos = Math.cos(angle);
	var noWall = { length2: Infinity };

	return ray({ x: camera.position.x, y: camera.position.y, height: 0, distance: 0 });

	// Recursive ray-tracing function
	// Returns an array of ray data for all unit distances from the cameras position
	function ray(origin) {
		var stepX = step(sin, cos, origin.x, origin.y);
		var stepY = step(cos, sin, origin.y, origin.x, true);
		var nextStep = stepX.length2 < stepY.length2
			? inspect(stepX, map.scale, 0, origin.distance, stepX.y)
			: inspect(stepY, 0, map.scale, origin.distance, stepY.x);

		if (nextStep.distance/map.scale > distance) return [origin];
		return [origin].concat(ray(nextStep));
	}

	// Stepping for the ray-trace
	function step(rise, run, x, y, inverted) {
		if (run === 0) return noWall;
		//var dx = run > 0 ? tracer.floorToScale(x + map.scale, map.scale) - x : tracer.ceilToScale(x - map.scale, map.scale) - x;
		var dx = ( run > 0 )?tracer.deltaToNextUnitFloor( x, map.scale ):tracer.deltaToNextUnitCeil( x, map.scale );
		var dy = dx * (rise / run);
		if( dx * dx + dy * dy == 0 )
		{
			console.log( "Zero distance!", run>0, x, dx, y, dy );
		}
		return {
			x: inverted ? y + dy : x + dx,
			y: inverted ? x + dx : y + dy,
			length2: dx * dx + dy * dy
		};
	}

	// Returns the distance and height at a position
	function inspect(step, shiftX, shiftY, distance, offset) {
		var dx = cos < 0 ? shiftX : 0;
		var dy = sin < 0 ? shiftY : 0;
		step.height = map.get(step.x - dx, step.y - dy);
		step.distance = distance + Math.sqrt(step.length2);
		if (shiftX) step.shading = cos < 0 ? 2 : 0;
		else step.shading = sin < 0 ? 2 : 1;
		step.offset = offset - Math.floor(offset);
		return step;
	}
}
