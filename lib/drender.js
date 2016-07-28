
// Setup three.js WebGL renderer. Note: Antialiasing is a big performance hit.
// Only enable it if you actually need to.
var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setPixelRatio(window.devicePixelRatio);

// Append the canvas element created by the renderer to document body element.
document.body.appendChild(renderer.domElement);

// Create a three.js scene.
var scene = new THREE.Scene();

// Create a three.js camera.
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

// Apply VR headset positional data to camera.
var controls = new THREE.VRControls(camera);
controls.standing = true;

// Apply VR stereo rendering to renderer.
var effect = new THREE.VREffect(renderer);
effect.setSize(window.innerWidth, window.innerHeight);


// Add a repeating grid as a skybox.
var boxSize = 30;
var loader = new THREE.TextureLoader();
loader.load('img/box.png', onTextureLoaded);

function onTextureLoaded(texture) {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(boxSize, boxSize);

  var geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
  var material = new THREE.MeshBasicMaterial({
    map: texture,
    color: 0x01BE00,
    side: THREE.BackSide
  });

  // Align the skybox to the floor (which is at y=0).
  skybox = new THREE.Mesh(geometry, material);
  skybox.position.y = boxSize/2;
  scene.add(skybox);

  // Load data

  var manager = new THREE.LoadingManager();
	manager.onProgress = function ( item, loaded, total ) {

		console.log( item, loaded, total );

	};

	var texture = new THREE.Texture();

	var onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( Math.round(percentComplete, 2) + '% downloaded' );
		}
	};

	var onError = function ( xhr ) {
	};

  scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );

	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 1, 1, 1 ).normalize();
	scene.add( light );

  // var loader = new THREE.OBJLoader( manager );
	// loader.load( 'waves-4.obj', function ( object ) {
  //
	// 	object.traverse( function ( child ) {
  //
	// 		if ( child instanceof THREE.Mesh ) {
  //
	// 			child.material =  new THREE.MeshBasicMaterial( {
  //         color: 0xffffff,
  //         opacity: 0.5,
  //         transparent: true
  //       });
  //
	// 		}
  //
	// 	} );
  //
  //   object.position.y =object.position.y + 0.1;
  //   object.position.x =object.position.x - 3;
  //   object.position.x =object.position.x - 3;
	// 	object.rotation.y =-object.rotation.y;
	// 	scene.add( object );
  //
	// }, onProgress, onError );

  // For high end VR devices like Vive and Oculus, take into account the stage
  // parameters provided.
  setupStage();
}


var groupMap,
    groupBoxes = [],
    dataLen = null,
    oasidata, geodata;

d3.json("data/oasi_5year.json", function (error, oasi_5year) {
d3.json("data/swiss-cantons-ticino.json", function (error, map_ticino) {
loader.load('img/kgrs1000_ticino.jpg', function(texture) {

  geodata = map_ticino;

  oasidata = {};
  for (var dtype in oasi_5year) {
    oasidata[dtype] = { locs: [] };
    for (var key in oasi_5year[dtype]) {
      var record = {
        'recs': [],
        'name': key,
        'symb': oasi_5year[dtype][key].resolution,
        'max': 0, 'min': 999999999
      };
      dd = oasi_5year[dtype][key].locations[0].data;
      for (var i = 0; i < dd.length; i++) {
        var ddr = dd[i];
        var val = ddr.values[0].value;
        if (isNaN(val)) continue;
        record.recs.push({
          'year': ddr.date.split('-')[0] +
                  ddr.date.split('-')[1],
          'val': val
        });
        if (val > record.max) record.max = val;
        if (val < record.min) record.min = val;
      }
      if (dataLen === null) dataLen = dd.length;
      if (dataLen !== dd.length) console.warn('Mismatched data');
      oasidata[dtype].locs.push(record);
    }
  }
  console.log(oasidata);

  texture.offset.x = 0.5;
  texture.offset.y = 0.5;

  var material = new THREE.MeshBasicMaterial({
    map: texture,
    color: 0xffffff,
    opacity: 0.3,
    transparent: true,
    shading: THREE.FlatShading,
    overdraw: true,
    side: THREE.BackSide
  });

  projectorGeom = fitProjection(d3.geo.mercator(), geodata, [[0.5,0.5],[-0.5,-0.5]], true);
  groupMap = renderFeatures(projectorGeom, geodata.features, scene, material, false);

  groupMap[0].rotation.x = Math.PI/2;
  groupMap[0].position.set(0, 0, 0);
  var upupup = 24;
  groupMap[0].scale.set(upupup, upupup, 3);

  var geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );

  function shuffleGameObject(object, i) {
			object.Speed = Math.floor(Math.random()*7) + 1;
      object.Speed *= (Math.random()*2 >= 1) ? -1 : 1;
			object.Orientation = (Math.random()*2 >= 1);
			object.material.color.setHex( Math.random() * 0xffffff );
			object.position.z = -10 + Math.floor(Math.random()*20);
      object.position.x = -10 + i * 0.2;
    }

  for ( var i = 0; i < 400; i++ ) {

    var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( {
      color: Math.random() * 0xffffff,
      transparent: true,
      opacity: 1
    } ) );

    shuffleGameObject(object, i);
    groupBoxes.push(object);

    scene.add( object );
  }

});
});
});

function onDocumentMouseWheel( event ) {

    // dataPos += (event.wheelDeltaY > 0) ? 1 : -1;
    // if (dataPos < 0) dataPos = 0;
    // if (dataPos > dataLen) dataPos = dataLen;

    // console.log(dataPos);

}
window.addEventListener('mousewheel', onDocumentMouseWheel, false);

// Create a VR manager helper to enter and exit VR mode.
var params = {
  hideButton: false, // Default: false.
  isUndistorted: false // Default: false.
};
var manager = new WebVRManager(renderer, effect, params);



// Kick off animation loop
requestAnimationFrame(animate);

window.addEventListener('resize', onResize, true);
window.addEventListener('vrdisplaypresentchange', onResize, true);

// Request animation frame loop function
var lastRender = 0;
function animate(timestamp) {
  var delta = Math.min(timestamp - lastRender, 500);
  lastRender = timestamp;

  // Update VR headset position and apply to camera.
  controls.update();

  // Render the scene through the manager.
  manager.render(scene, camera, timestamp);

  var carBounds = 15;
  for (var i = 0; i < groupBoxes.length; i++) {
    var obj = groupBoxes[i];
    var px = obj.Orientation ? obj.position.x : obj.position.z;
  	px += obj.Speed * 0.02;
  	px = (px < -carBounds) ? carBounds : (px > carBounds) ? -carBounds : px;
    if (obj.Orientation) obj.position.x = px;
    if (!obj.Orientation) obj.position.z = px;
  }

  // Check position (year)
  pos = parseInt(dataLen * (camera.rotation.y+1.57)/3.14);

  // Traffic density
  if (typeof oasidata === 'undefined') return;
  min = oasidata.traffic[0].min;
  max = oasidata.traffic[0].max;
  maxTraffic = parseInt(400 * (oasidata.traffic[0].recs[pos]-min)/(max-min));
  for ( var j = 0; j < 400; j ++ ) {
    groupBoxes[i].material.opacity = (j < maxTraffic) ? 1 : 0;
  }

      // var dt = oasidata.traffic.Camignolo.locations[0].data.length;

  // Update dataviz
  VIZ.render();

  requestAnimationFrame(animate);
}

function onResize(e) {
  effect.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}

var display;

// Get the HMD, and if we're dealing with something that specifies
// stageParameters, rearrange the scene.
function setupStage() {
  navigator.getVRDisplays().then(function(displays) {
    if (displays.length > 0) {
      display = displays[0];
      if (display.stageParameters) {
        setStageDimensions(display.stageParameters);
      }
    }
  });
}

function setStageDimensions(stage) {
  // Make the skybox fit the stage.
  var material = skybox.material;
  scene.remove(skybox);

  // Size the skybox according to the size of the actual stage.
  var geometry = new THREE.BoxGeometry(stage.sizeX, boxSize, stage.sizeZ);
  skybox = new THREE.Mesh(geometry, material);

  // Place it on the floor.
  skybox.position.y = boxSize/2;
  scene.add(skybox);
}
