// Camera.js: Represents a camera object in the world
// Arthur Wuterich
// 6/5/2014

// Generates a new camera object
function Camera(x, y, direction, fov) {
	this.position = { "x":x, "y":y };
	this.direction = direction;
	this.fov = fov;
}
