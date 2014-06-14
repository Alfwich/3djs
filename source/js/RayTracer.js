// Raytracer.js: Recursive ray-tracer
// Arthur Wuterich
// 6/5/2014

// Constructor

var RayTracer = function(){
}

// Will return a ray object with all of the ray data
RayTracer.prototype.cast = function( map, camera, angle, distance )
{
	var sin = Math.sin( camera.direction + angle );
	var cos = Math.cos( camera.direction + angle );
	var noWall = { length2: Infinity };

	return ray({ x: camera.position.x, y: camera.position.y, height: 0, distance: 0, wall: map.get( camera.position.x, camera.position.y ) });

	// Recursive ray-tracing function
	// Returns an array of ray data for all unit distances from the cameras position
	function ray(origin) {
		var stepX = step(sin, cos, origin.x, origin.y);
		var stepY = step(cos, sin, origin.y, origin.x, true);
		var nextStep = stepX.length2 < stepY.length2
			? inspect(stepX, 1, 0, origin.distance, stepX.y)
			: inspect(stepY, 0, 1, origin.distance, stepY.x);

		if (nextStep.distance > distance) return [origin];
		return [origin].concat(ray(nextStep));
	}

	// Stepping for the ray-trace
	function step(rise, run, x, y, inverted) {
		if (run === 0) return noWall;
		var dx = run > 0 ? Math.floor(x + 1) - x : Math.ceil(x - 1) - x;
		var dy = dx * (rise / run);
		return {
			x: inverted ? y + dy : x + dx,
			y: inverted ? x + dx : y + dy,
			length2: dx * dx + dy * dy,
      wall:null
		};
	}

	// Returns the distance and height at a position
	function inspect(step, shiftX, shiftY, distance, offset) {
		var dx = cos < 0 ? shiftX : 0;
		var dy = sin < 0 ? shiftY : 0;
    step.wall = map.get(step.x - dx, step.y - dy);
		step.height = step.wall.height;
		step.distance = distance + Math.sqrt(step.length2);
		if (shiftX) step.shading = cos < 0 ? 2 : 0;
		else step.shading = sin < 0 ? 2 : 1;
		step.offset = offset - Math.floor(offset);
		return step;
	}
}
