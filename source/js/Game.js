// 3d controller: Controlls the 3d rendering for the application
// Arthur Wuterich
// 6-5-2014
// modified from: http://www.playfuljs.com/a-first-person-engine-in-265-lines/
// source       : http://www.playfuljs.com/demos/raycaster/
var CIRCLE = Math.PI * 2;
var MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent)

function GameLoop() {
	this.frame = this.frame.bind(this);
	this.lastTime = 0;
	this.callback = function() {};
}

GameLoop.prototype.start = function(callback) {
	this.callback = callback;
	requestAnimationFrame(this.frame);
};

GameLoop.prototype.frame = function(time) {
	var seconds = (time - this.lastTime) / 1000;
	this.lastTime = time;
	if (seconds < 0.2) this.callback(seconds);
	requestAnimationFrame(this.frame);
};

var display = null;
var player = null;
var map = null;
var controls = null;
var camera = null;
var loop = null;
var renderer = null;

$("document").ready( function(){
	display = document.getElementById('display');
	player = new Player(15.3, -1.2, Math.PI * 0.3 );
	player.camera = new Camera( player.position.x, player.position.y, player.direction, Math.PI * 0.4 );
	controls = new Controls();
	map = new Map(32);
	renderer = new Renderer( display, 300, 10 ); 
	loop = new GameLoop();

	map.randomize();

	loop.start(function frame(seconds) {
		player.update( controls, map, seconds );
		renderer.renderScene( player.camera, map );
	});
})
