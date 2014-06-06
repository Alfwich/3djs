// Player.js: Player object
// Arthur Wuterich
// 6/5/2014

// Generates a new player object
function Player(x, y, direction, camera ) {
	
	if( typeof direction === "undefined" )
	{
		direction = 0;
	}

	if( typeof camera === "undefined" )
	{
		camera = null;
	}

	this.position  = { "x":x, "y":y };
	this.direction = direction;
	this.arm = new Bitmap( "cocktail_arm.png" );
	this.camera = camera;
}

// Rotates the player object by the provided angle
Player.prototype.rotate = function(angle) {
	this.direction = (this.direction + angle + CIRCLE) % (CIRCLE);
};

// Moves the player forward based on their rotation in the probided map
Player.prototype.walk = function(distance, map) {
	var dx = Math.cos(this.direction) * distance;
	var dy = Math.sin(this.direction) * distance;
	if (map.get(this.position.x + dx, this.position.y) <= 0) this.position.x += dx;
	if (map.get(this.position.x, this.position.y + dy) <= 0) this.position.y += dy;
};

// SideStep
Player.prototype.sidestep = function(distance, map) {
	var dx = Math.cos(this.direction-(Math.PI/2)) * distance;
	var dy = Math.sin(this.direction-(Math.PI/2)) * distance;
	if (map.get(this.position.x + dx, this.position.y) <= 0) this.position.x += dx;
	if (map.get(this.position.x, this.position.y + dy) <= 0) this.position.y += dy;
};

// Handler for controlling the player through control states
Player.prototype.update = function(controls, map, seconds) {

	// Rotation
	//if (controls.states.left) this.rotate(-Math.PI * seconds);
	//if (controls.states.right) this.rotate(Math.PI * seconds);

	this.rotate( Math.PI * controls.getMouseMovement() );

	if (controls.states.left) this.sidestep( 3 * seconds, map );
	if (controls.states.right) this.sidestep( -3 * seconds, map );


	// Walking
	if (controls.states.forward) this.walk(3 * seconds, map);
	if (controls.states.backward) this.walk(-3 * seconds, map);

	// Camera
	this.camera.position.x = this.position.x;
	this.camera.position.y = this.position.y;
	this.camera.direction = this.direction;
};


