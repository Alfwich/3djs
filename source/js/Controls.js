// Controls.js: Controls for application
// Arthur Wuterich
// 6/5/2014

// Creates a new control object which monitors the state of the controls in the 
// application
function Controls() {
	this.codes  = { 65: 'left', 68: 'right', 87: 'forward', 83: 'backward' };
	this.states = { 'left': false, 'right': false, 'forward': false, 'backward': false };
	this.mouseMoveX = 0;
	this.mouseSensitivity = 180;
	document.addEventListener('mousemove', this.onMouse.bind(this), false);
	document.addEventListener('keydown', this.onKey.bind(this, true), false);
	document.addEventListener('keyup', this.onKey.bind(this, false), false);
	document.addEventListener('touchstart', this.onTouch.bind(this), false);
	document.addEventListener('touchmove', this.onTouch.bind(this), false);
	document.addEventListener('touchend', this.onTouchEnd.bind(this), false);
}

// Touch controls
Controls.prototype.onTouch = function(e) {
	var t = e.touches[0];
	this.onTouchEnd(e);
	if (t.pageY < window.innerHeight * 0.5) this.onKey(true, { keyCode: 38 });
	else if (t.pageX < window.innerWidth * 0.5) this.onKey(true, { keyCode: 37 });
	else if (t.pageY > window.innerWidth * 0.5) this.onKey(true, { keyCode: 39 });
};

Controls.prototype.onTouchEnd = function(e) {
	this.states = { 'left': false, 'right': false, 'forward': false, 'backward': false };
	e.preventDefault();
	e.stopPropagation();
};

// Key handler
Controls.prototype.onKey = function(val, e) {
	var state = this.codes[e.keyCode];
	if (typeof state === 'undefined') return;
	this.states[state] = val;
	e.preventDefault && e.preventDefault();
	e.stopPropagation && e.stopPropagation();
};

// Mouse handler
Controls.prototype.onMouse = function(e) {
	this.mouseMoveX = e.webkitMovementX;
};

Controls.prototype.getMouseMovement = function(){
	var tmpMove = this.mouseMoveX / this.mouseSensitivity;
	this.mouseMoveX = 0;
	return tmpMove;
}


