var scene, camera, renderer, rotatingCube, clock;
var meshFloor, ambientLight, light, hitLight, ceiling;

var crate, crateTexture, crateNormalMap, crateBumpMap;
var aybuTexture, signTexture;

var hitcounter = 0;
var counter = 0;

var virusSize = 3;
var virusLevel = 0;

var wallSlider = false;
var walkLimit = -15;

var godmode = false;
var shootable = 50;

var keyboard = {};
var player = { height: 1.8, speed: 0.15, turnSpeed: Math.PI * 0.006, canShoot: 0 };
var USE_WIREFRAME = false;

var meshes = {};
var bullets = [];

//For character movement
let flag = true;

var loadingScreen = {
	scene: new THREE.Scene(),
	camera: new THREE.PerspectiveCamera(90, 1280 / 720, 0.1, 100),
	box: new THREE.Mesh(
		new THREE.BoxGeometry(0.5, 0.5, 0.5),
		new THREE.MeshBasicMaterial({ color: 0x4444ff })
	)
};
var loadingManager = null;
var RESOURCES_LOADED = false;

// Models index
var models = {
	virus: {
		obj: "models/virus.obj",
		mtl: "models/virus.mtl",
		mesh: null
	},
	syringe: {
		obj: "models/syringe.obj",
		mtl: "models/syringe.mtl",
		mesh: null,
		castShadow: false
	},
	injector: {
		obj: "models/injector.obj",
		mtl: "models/injector.mtl",
		mesh: null,
	},
	wall: {
		obj: "models/walls/brickWall.obj",
		mtl: "models/walls/brickWall.mtl",
		mesh: null,
		receiveShadow: true
	},
	windmill: {
		obj: "models/windmill.obj",
		mtl: "models/windmill.mtl",
		mesh: null,
		receiveShadow: true
	}

};

function init() {
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(90, 1280 / 720, 0.1, 1000);
	clock = new THREE.Clock();


	loadingScreen.box.position.set(0, 0, 5);
	loadingScreen.camera.lookAt(loadingScreen.box.position);
	loadingScreen.scene.add(loadingScreen.box);

	loadingManager = new THREE.LoadingManager();
	loadingManager.onProgress = function (item, loaded, total) {
		console.log(item, loaded, total);
	};
	loadingManager.onLoad = function () {
		console.log("loaded all resources");
		RESOURCES_LOADED = true;
		onResourcesLoaded();
	};
	var textureLoader = new THREE.TextureLoader(loadingManager);
	crateTexture = textureLoader.load("models/crate/crate0_diffuse.jpg");
	crateBumpMap = textureLoader.load("models/crate/crate0_bump.jpg");
	crateNormalMap = textureLoader.load("models/crate/crate0_normal.jpg");
	aybuTexture = textureLoader.load("photos/aybu.jpg");
	signTexture = textureLoader.load("photos/sign.png");


	//LIGHTS #################################################################################

	ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
	scene.add(ambientLight);

	light = new THREE.PointLight(0xFFFFCC, 0.8, 100);
	light.position.set(0, 9, 0);
	light.castShadow = true;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 25;
	scene.add(light);

	hitLight = new THREE.PointLight(0xFFFFFF, 0.8, 10);
	hitLight.position.set(0, 7, 18.8);
	hitLight.castShadow = true;
	hitLight.shadow.camera.near = 0.1;
	hitLight.shadow.camera.far = 25;
	scene.add(hitLight);

	roomLight = new THREE.PointLight(0xFFFFFF, 0.6, 30);
	roomLight.position.set(-17.6, 14, -5);
	roomLight.castShadow = true;
	roomLight.shadow.camera.near = 0.1;
	roomLight.shadow.camera.far = 25;
	scene.add(roomLight);

	roomLight2 = new THREE.PointLight(0xFFFFFF, 0.6, 30);
	roomLight2.position.set(-17.6, 14, 5);
	roomLight2.castShadow = true;
	roomLight2.shadow.camera.near = 0.1;
	roomLight2.shadow.camera.far = 25;
	scene.add(roomLight2);

	//OBJECTS #########################################################################
	meshFloor = new THREE.Mesh(
		new THREE.PlaneGeometry(62, 42, 100, 100),
		new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: USE_WIREFRAME })
	);
	meshFloor.rotation.x -= Math.PI / 2;
	meshFloor.position.x = -15
	meshFloor.receiveShadow = true;
	scene.add(meshFloor);

	ceiling = new THREE.Mesh(
		new THREE.PlaneGeometry(33, 44, 100, 100),
		new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: USE_WIREFRAME })
	);
	ceiling.rotation.x += Math.PI / 2;
	ceiling.position.set(0, 9.8, 0);
	ceiling.receiveShadow = true;
	ceiling.castShadow = true;
	scene.add(ceiling);

	ceilingRoom = new THREE.Mesh(
		new THREE.PlaneGeometry(33, 44, 100, 100),
		new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: USE_WIREFRAME })
	);
	ceilingRoom.rotation.x += Math.PI / 2;
	ceilingRoom.position.set(-30, 19.8, 0);
	ceilingRoom.receiveShadow = true;
	ceilingRoom.castShadow = true;
	scene.add(ceilingRoom);

	fenceDown = new THREE.Mesh(
		new THREE.BoxGeometry(32, player.height / 3, 0.5),
		new THREE.MeshPhongMaterial({
			color: 0xffcc00,
			map: crateTexture,
			bumpMap: crateBumpMap,
			normalMap: crateNormalMap
		})
	);
	scene.add(fenceDown);
	fenceDown.position.set(0, 1, -8.7);
	fenceDown.receiveShadow = true;
	fenceDown.castShadow = true;

	sphere = new THREE.Mesh(
		new THREE.SphereGeometry(0.5, 5, 5),
		new THREE.MeshPhongMaterial({
			color: 0xFFFFFF,
		})
	);
	scene.add(sphere);
	sphere.position.set(0, 10, 0);
	sphere.receiveShadow = true;
	sphere.castShadow = false;

	sphere2 = new THREE.Mesh(
		new THREE.SphereGeometry(0.5, 5, 5),
		new THREE.MeshPhongMaterial({
			color: 0xFFFFFF,
			castShadow: true,
			receiveShadow: true
		})
	);
	scene.add(sphere2);
	sphere2.position.set(0, 7, 19);
	sphere2.receiveShadow = true;
	sphere2.castShadow = false;

	sphere3 = new THREE.Mesh(
		new THREE.SphereGeometry(0.5, 5, 5),
		new THREE.MeshPhongMaterial({
			color: 0xFFFFFF,
			castShadow: true,
			receiveShadow: true
		})
	);
	scene.add(sphere3);
	sphere3.position.set(-16.5, 14, -5);
	sphere3.receiveShadow = false;
	sphere3.castShadow = false;

	sphere4 = new THREE.Mesh(
		new THREE.SphereGeometry(0.5, 5, 5),
		new THREE.MeshPhongMaterial({
			color: 0xFFFFFF,
			castShadow: true,
			receiveShadow: true
		})
	);
	scene.add(sphere4);
	sphere4.position.set(-16.5, 14, 5);
	sphere4.receiveShadow = false;
	sphere4.castShadow = false;

	rotatingCube = new THREE.Mesh(
		new THREE.BoxGeometry(1, 1, 1),
		new THREE.MeshPhongMaterial({ color: 0xff4444, wireframe: USE_WIREFRAME })
	);
	rotatingCube.position.set(-23, 1, 0);
	rotatingCube.position.y += 1;
	rotatingCube.receiveShadow = true;
	rotatingCube.castShadow = true;
	scene.add(rotatingCube);

	var geometry = new THREE.ConeGeometry(5, 20, 16);
	var material = new THREE.MeshPhongMaterial({ color: 0x207068 });
	cone = new THREE.Mesh(geometry, material);
	cone.castShadow = true;
	cone.receiveShadow = true;
	cone.position.set(-32, 0, -1.2);
	scene.add(cone);

	var geometry2 = new THREE.CylinderGeometry(0.22, 0.22, 2.5);
	var material2 = new THREE.MeshPhongMaterial({ color: 0x207068 });
	cone2 = new THREE.Mesh(geometry2, material2);
	cone2.castShadow = true;
	cone2.position.set(-30.5, 8.25, -1.2);
	cone2.rotation.z -= Math.PI / 2;
	scene.add(cone2);

	painting = new THREE.Mesh(
		new THREE.PlaneGeometry(12, 8, 12, 8),
		new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: USE_WIREFRAME, map: aybuTexture }),
	);
	painting.rotation.y -= Math.PI / 2;
	painting.rotation.y -= Math.PI;
	painting.position.set(-46.016, 5, -14);
	painting.receiveShadow = true;
	scene.add(painting);

	sign = new THREE.Mesh(
		new THREE.PlaneGeometry(15, 6, 12, 8),
		new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: USE_WIREFRAME, map: signTexture }),
	);
	sign.rotation.y -= Math.PI / 2;
	sign.rotation.y -= Math.PI;
	sign.position.set(-46.016, 5, 3);
	sign.receiveShadow = true;
	scene.add(sign);

	//OBJECTS #########################################################################

	// Load models
	for (var _key in models) {
		(function (key) {

			var mtlLoader = new THREE.MTLLoader(loadingManager);
			mtlLoader.load(models[key].mtl, function (materials) {
				materials.preload();

				var objLoader = new THREE.OBJLoader(loadingManager);

				objLoader.setMaterials(materials);
				objLoader.load(models[key].obj, function (mesh) {

					mesh.traverse(function (node) {
						if (node instanceof THREE.Mesh) {
							if ('castShadow' in models[key])
								node.castShadow = models[key].castShadow;
							else
								node.castShadow = true;

							if ('receiveShadow' in models[key])
								node.receiveShadow = models[key].receiveShadow;
							else
								node.receiveShadow = true;
						}
					});
					models[key].mesh = mesh;

				});
			});

		})(_key);
	}

	camera.position.set(0, player.height, -15);
	camera.lookAt(new THREE.Vector3(0, player.height, 0));

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(1280, 720);

	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.BasicShadowMap;

	document.body.appendChild(renderer.domElement);

	animate();
}

// Runs when all resources are loaded
function onResourcesLoaded() {

	// virus
	meshes["virus"] = models.virus.mesh.clone();
	meshes["virus"].scale.set(virusSize, virusSize, virusSize);
	meshes["virus"].position.set(3, -0.3, virusLevel);
	scene.add(meshes["virus"]);

	// syringe
	meshes["syringe"] = models.syringe.mesh.clone();
	meshes["syringe"].position.set(0, 2, 0);
	scene.add(meshes["syringe"]);

	// The wall we are facing
	meshes["wallFront"] = models.wall.mesh.clone();
	meshes["wallFront"].position.set(-15, 0, 22);
	meshes["wallFront"].scale.set(62, 14, 6);
	scene.add(meshes["wallFront"]);

	//Divides rooms
	meshes["wallRight"] = models.wall.mesh.clone();
	meshes["wallRight"].position.set(-13.9, 0, 0);
	meshes["wallRight"].rotation.y += Math.PI / 2
	meshes["wallRight"].scale.set(43, 14, 6);
	scene.add(meshes["wallRight"]);

	meshes["wallRightTop"] = models.wall.mesh.clone();
	meshes["wallRightTop"].position.set(-13.9, 9.88, -1.15);
	meshes["wallRightTop"].rotation.y += Math.PI / 2
	meshes["wallRightTop"].scale.set(40, 14, 6);
	scene.add(meshes["wallRightTop"]);

	meshes["wallFrontTop"] = models.wall.mesh.clone();
	meshes["wallFrontTop"].position.set(-15, 10, 22);
	meshes["wallFrontTop"].scale.set(62, 14, 6);
	scene.add(meshes["wallFrontTop"]);

	meshes["wallLeft"] = models.wall.mesh.clone();
	meshes["wallLeft"].position.set(18.5, 0, -1.15);
	meshes["wallLeft"].rotation.y += Math.PI / 2
	meshes["wallLeft"].scale.set(40, 14, 6);
	scene.add(meshes["wallLeft"]);

	meshes["wallBack"] = models.wall.mesh.clone();
	meshes["wallBack"].position.set(-15, 0, -19);
	meshes["wallBack"].scale.set(62, 14, 6);
	scene.add(meshes["wallBack"]);

	meshes["roomWallRight"] = models.wall.mesh.clone();
	meshes["roomWallRight"].position.set(-43.9, 0, 0);
	meshes["roomWallRight"].rotation.y += Math.PI / 2
	meshes["roomWallRight"].scale.set(43, 14, 6);
	scene.add(meshes["roomWallRight"]);

	meshes["roomWallRightTop"] = models.wall.mesh.clone();
	meshes["roomWallRightTop"].position.set(-43.9, 10, 0);
	meshes["roomWallRightTop"].rotation.y += Math.PI / 2
	meshes["roomWallRightTop"].scale.set(43, 14, 6);
	scene.add(meshes["roomWallRightTop"]);

	meshes["wallBackTop"] = models.wall.mesh.clone();
	meshes["wallBackTop"].position.set(-15, 10, -19);
	meshes["wallBackTop"].scale.set(62, 14, 6);
	scene.add(meshes["wallBackTop"]);

	meshes["windmill"] = models.windmill.mesh.clone();
	meshes["windmill"].position.set(-30, 8.2, -1.2);
	meshes["windmill"].scale.set(3, 3, 3);
	scene.add(meshes["windmill"]);
}

// Animates virus going left and right
function movement() {
	if (meshes["virus"].position.x >= 10) {
		flag = true;
		meshes["virus"].position.x -= 0.1;
	}
	if (meshes["virus"].position.x <= -10) {
		flag = false;
		meshes["virus"].position.x += 0.1
	}
	if (flag)
		meshes["virus"].position.x -= 0.05
	else
		meshes["virus"].position.x += 0.05
}

//Checks if player is inside movable area
function checkCollide() {
	if (camera.position.x < 15 && camera.position.x > walkLimit &&
		camera.position.z < -10 && camera.position.z > -20)
		return true;
	return false;
}

function distance(x1, y1, z1, x2, y2, z2) {
	return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((z1 - z2), 2) + Math.pow((y1 - y2), 2))
}

//Scans collision detection for virus and projectile syringe/injector
function checkHit() {
	var x1 = meshes["virus"].position.x;
	var y1 = meshes["virus"].position.y + player.height + 0.3;
	var z1 = meshes["virus"].position.z;
	for (var i = 0; i < bullets.length; i++) {
		var x2 = bullets[i].position.x
		var y2 = bullets[i].position.y
		var z2 = bullets[i].position.z
		if (distance(x1, y1, z1, x2, y2, z2) <= 1) {
			scene.remove(bullets[i]);
			bullets[i].position.set(22, 0, 0);

			if (++counter % 2 == 0) {
				virusSize *= 0.9;
			}
			if (virusSize < 2) {
				meshes["virus"].position.set(0, 15, 0);
				scene.remove(meshes["virus"]);
				setTimeout(function () {
					virusSize = 3;
					virusLevel += 5;
					if (virusLevel > 18) {
						virusLevel = 0;
						wallSlider = true;
						setTimeout(function () {
							walkLimit = -45;
						}, 3500);

					}
					meshes["virus"].position.set(3, -0.3, virusLevel);
					scene.add(meshes["virus"]);
				}, 2000);
			}

			hitLight.color.set(0x00ff00);
			setTimeout(function () {
				hitLight.color.set(0xFFFFFF);
			}, 1000);
			return hitcounter++;
		}

	}
	return "Waiting"
}

function animate() {

	// Play the loading screen until resources are loaded.
	if (RESOURCES_LOADED == false) {
		requestAnimationFrame(animate);

		loadingScreen.box.position.x -= 0.05;
		if (loadingScreen.box.position.x < -10) loadingScreen.box.position.x = 10;
		loadingScreen.box.position.y = Math.sin(loadingScreen.box.position.x);

		renderer.render(loadingScreen.scene, loadingScreen.camera);
		return;
	}

	requestAnimationFrame(animate);
	movement();
	checkHit();


	//console.log(camera.position);

	var time = Date.now() * 0.0005;
	var delta = clock.getDelta();

	rotatingCube.rotation.x += 0.01;
	rotatingCube.rotation.y += 0.02;
	meshes["virus"].rotation.y += 0.05;

	meshes["windmill"].rotation.x += 0.01;
	meshes["virus"].scale.set(virusSize, virusSize, virusSize);


	//Animates sliding of wallRight
	if (wallSlider) {
		if (meshes["wallRight"].position.z < 12)
			meshes["wallRight"].position.z += 0.01
	}

	// go through syringe bullets array and update position
	// remove syringes when appropriate
	for (var index = 0; index < bullets.length; index += 1) {
		if (bullets[index] === undefined) continue;
		if (bullets[index].alive == false) {
			bullets.splice(index, 1);
			continue;
		}

		bullets[index].position.add(bullets[index].velocity);
	}

	//Godmode cheat section, allows for fast shooting and noclip
	if (!godmode) {
		shootable = 50;
		if (camera.position.z > -10)
			camera.position.z = -9.9;
		if (camera.position.x > 15)
			camera.position.x = 14.9;
		if (camera.position.z < -20)
			camera.position.z = -19.9;
		if (camera.position.x < walkLimit)
			camera.position.x = walkLimit + 0.1;
	} else {
		shootable = 1;
	}

	//Keyboard inputs
	if (keyboard[87]) { // W key
		if (checkCollide) {
			camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
			camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
		}

	}
	if (keyboard[83]) { // S key
		if (checkCollide) {
			camera.position.x += Math.sin(camera.rotation.y) * player.speed;
			camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
		}

	}
	if (keyboard[65]) { // A key
		if (checkCollide) {
			camera.position.x += Math.sin(camera.rotation.y + Math.PI / 2) * player.speed;
			camera.position.z += -Math.cos(camera.rotation.y + Math.PI / 2) * player.speed;
		}

	}
	if (keyboard[68]) { // D key
		if (checkCollide) {
			camera.position.x += Math.sin(camera.rotation.y - Math.PI / 2) * player.speed;
			camera.position.z += -Math.cos(camera.rotation.y - Math.PI / 2) * player.speed;
		}

	}
	if (keyboard[37]) { // left arrow key
		camera.rotation.y -= player.turnSpeed;
	}
	if (keyboard[39]) { // right arrow key
		camera.rotation.y += player.turnSpeed;
	}
	if (keyboard[32] && player.canShoot <= 0) { // spacebar key
		// creates a bullet as a Mesh object
		var bullet = new THREE.Mesh(
			new THREE.SphereGeometry(0.05, 8, 8),
			new THREE.MeshBasicMaterial({ color: 0xff28 })
		);
		// this is silly.
		var bullet = models.injector.mesh.clone();
		bullet.scale.set(0.01, 0.01, 0.01);

		// position the bullet to come from the player's weapon
		bullet.position.set(
			meshes["syringe"].position.x,
			meshes["syringe"].position.y + 0.15,
			meshes["syringe"].position.z
		);
		bullet.rotation.set(
			camera.rotation.x,
			camera.rotation.y,
			camera.rotation.z
		);
		// set the velocity of the bullet
		bullet.velocity = new THREE.Vector3(
			-Math.sin(camera.rotation.y) * 0.15,
			0,
			Math.cos(camera.rotation.y) * 0.15
		);

		// after 1500ms, delete syringe bullet from scene
		bullet.alive = true;
		setTimeout(function () {
			bullet.alive = false;
			scene.remove(bullet);
		}, 1500);

		// add to scene, array, and set the delay to 10 frames
		bullets.push(bullet);
		scene.add(bullet);
		player.canShoot = shootable;
	}
	if (player.canShoot > 0) player.canShoot -= 1;

	// position the syringe in front of the camera
	meshes["syringe"].position.set(
		camera.position.x - Math.sin(camera.rotation.y + Math.PI / 6) * 0.75,
		camera.position.y - 0.5 + Math.sin(time * 4 + camera.position.x + camera.position.z) * 0.01,
		camera.position.z + Math.cos(camera.rotation.y + Math.PI / 6) * 0.75
	);
	meshes["syringe"].rotation.set(
		camera.rotation.x,
		camera.rotation.y - Math.PI,
		camera.rotation.z
	);

	renderer.render(scene, camera);
}

function keyDown(event) {
	keyboard[event.keyCode] = true;
}

function keyUp(event) {
	keyboard[event.keyCode] = false;
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);
window.onload = init;