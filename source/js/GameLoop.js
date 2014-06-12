// GameLoop.js: Object that is responsible for controling game function 
function GameLoop() {
	this.frame = this.frame.bind(this);
	this.lastTime = 0;
  this.seconds = 0.2;
	this.callback = function() {};
}

GameLoop.prototype.start = function(callback) {
	this.callback = callback;
	requestAnimationFrame(this.frame);
};

GameLoop.prototype.frame = function(time) {
	var seconds = (time - this.lastTime) / 1000;
	this.lastTime = time;
	if (seconds < this.seconds) this.callback(seconds);
	requestAnimationFrame(this.frame);
};


