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

$("document").ready( function(){
	display = $("#display")[0];

	// Player Object
	player = new Player(15.3, -1.2, Math.PI * 1 );
	player.camera = new Camera( player.position.x, player.position.y, player.direction, Math.PI * 0.4 );
	controls = new Controls();

	// Map
	map = new Map(32);
	map.skybox = new Bitmap( "outdoor_background.png" );
	map.wallTexture = new Bitmap( "wall_texture.jpg" );
	map.set( 0, 0, 1 );
	//map.randomize();

	// Renderer
	renderer = new Renderer( display, 300 ); 
	renderer.renderRange = 20;
	renderer.lightRange = 5;
	renderer.fogColor = "#333333";
	loop = new GameLoop();

	// Render Lists
	backList = new RenderList();
	frontList = new RenderList();

	// 3d Object Render List
	mainList = new RenderList();

	// Player Arm
	/*
	playerWeapon = new StaticObject( "cocktail_arm.png" );
	playerWeapon.setPosition( display.width/1.75, display.height/1.60 );
	playerWeapon.setScale( 0.25, 0.25 );
	frontList.addObject( playerWeapon );
	*/
	var flairImages = [ "flower1.png", "flower2.png", "weed.png", "grass.png" ];
	for( var i = 0; i < 100; i++ )
	{
		var flair = new StaticObject( flairImages[Math.floor( Math.random()*flairImages.length)]);
		//flair.setPosition( -1, -1 );
		flair.setPosition( (Math.random() * 20)-10, (Math.random() * 20)-10 );
		flair.setOffset( 0, -225 );
		mainList.addObject( flair );
	}

	loop.start(function frame(seconds) {
		
		// Update the player
		player.update( controls, map, seconds );

		// Render the scene through the player's camera
		renderer.drawScene( player.camera, map );

		// Render 3d objects in the world
		renderer.draw3dList( player.camera, mainList );

		// Render static 2d objects
		renderer.draw2dList( frontList );
		renderer.draw2dList( backList );
	});
})
