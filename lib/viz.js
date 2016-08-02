
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
loader.load('img/bg-2.png', onTextureLoaded);

function onTextureLoaded(texture) {
  var material = new THREE.MeshBasicMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    depthTest: false,
    fog: false,
    map: texture
  });
  var geometry = new THREE.SphereGeometry(10000, 64, 32);

  sky = new THREE.Mesh(geometry, material);
  scene.add(sky);

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


  // For high end VR devices like Vive and Oculus, take into account the stage
  // parameters provided.
  setupStage();
}


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
  
  // Update dataviz
  if (VIZ.ready) VIZ.render();

  // Render the scene through the manager.
  manager.render(scene, camera, timestamp);

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


/*
var a = {}; d3.json("data/oasi_5year.json", function (error, oasi_5year) { a=oasi_5year; })

for (var key in a.traffic) { b.push({ 'name': key + ' traffic', 'resolution': a.traffic[key].resolution, 'recs':[] }); a.traffic[key].locations[0].data.forEach(function(d) { b[b.length-1].recs.push({ 'date': d.date, 'USTRA': d.values[0].value }); }); }

*/

(function(){
  var VIZ ={};
  var rrenderer, sscene = new THREE.Scene();
  var width = window.innerWidth, height = window.innerHeight;

  // camera = new THREE.PerspectiveCamera(40, width/height , 1, 10000);
  // camera.position.z = 3000;
  // camera.setLens(30);

  VIZ.ready = false;

  VIZ.drawElements = function (data) {

    VIZ.count = data.length;

    var margin = {top: 17, right: 0, bottom: 16, left: 20},
        width  = 225 - margin.left - margin.right,
        height = 140 - margin.top  - margin.bottom;

    var legendArr = d3.keys(data[0].recs[0])
        .filter(function (key) { return key !== 'year';});

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], 0, 0)
        .domain(d3.range(2004,2014).map(function (d) { return d + ""; }))

    var y = d3.scale.linear().range([height, 0]).domain([0, 135]);

    var xAxis = d3.svg.axis().scale(x).orient("bottom");
    var yAxis = d3.svg.axis().scale(y).orient("left");

    var area = d3.svg.area()
        .interpolate("cardinal")
        .x(function (d) { return x(d.label) + x.rangeBand() / 2; })
        .y0(function (d) { return y(d.y0); })
        .y1(function (d) { return y(d.y0 + d.y); });

    var color = d3.scale.ordinal()
        .range(['rgb(166,206,227)','rgb(31,120,180)','rgb(178,223,138)','rgb(51,160,44)','rgb(251,154,153)','rgb(227,26,28)','rgb(253,191,111)','rgb(255,127,0)']);

    var elements = d3.selectAll('.element')
        .data(data).enter()
        .append('div')
        .attr('class', 'element')

    elements.append('div')
      .attr('class', 'chartTitle')
      .html(function (d) { return d.name; })
    
     elements.append('div')
       .attr('class', 'investData')
       .html(function (d, i) { return d.awards; })
    //
    // elements.append('div')
    //   .attr('class', 'investLabel')
    //   .html("Investments (10 Yrs)")

    elements.append("svg")
      .attr("width",  width  + margin.left + margin.right)
      .attr("height", height + margin.top  + margin.bottom)
    .append("g")
      .attr("class", "chartg")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    elements.select(".chartg")
      .append("g").attr("class", "seriesg")
      .selectAll("series")
      .data(function (d) { return prepData(d.recs); })
      .enter()
        .append("path")
        .attr("class", "series")
        .attr("d", function (d) { return area(d.values); })
        .style("fill", function (d) { return color(d.name); })

    elements.select(".chartg")
      .append("g")
      .attr("class", "legend")
      .attr("transform", "translate(15, -15)")
      .selectAll(".legendItem")
      .data(setLegend(legendArr))
      .enter()
        .append("g")
        .attr("class", "legendItem")
        .each(function (d) {
          d3.select(this).append("rect")
            .attr("x", function (d) { return d.x })
            .attr("y", function (d) { return d.y })
            .attr("width", 4)
            .attr("height",4)
            .style("fill", function (d) { return color(d.name); })

          // d3.select(this).append("text")
          //   .attr("class", "legendText")
          //   .attr("x", function (d) { return d.x + 5 })
          //   .attr("y", function (d) { return d.y + 4 })
          //   .text(function (d) { return d.name; });
       });

    elements.select(".chartg").append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    elements.select(".chartg").append("g")
      .attr("class", "y axis")
      .call(yAxis);
    // .append("text")
    //   .attr("transform", "rotate(-90)")
    //   .attr("y", 6)
    //   .attr("dy", ".71em")
    //   .style("text-anchor", "end")
    //   .text("Investments");

    elements.each(setData);
    elements.each(objectify);

    VIZ.ready = true;

    function prepData (data) {
      var stack = d3.layout.stack()
          .offset("zero")
          .values(function (d) { return d.values; })
          .x(function (d) { return x(d.label) + x.rangeBand() / 2; })
          .y(function (d) { return d.value; });

      var labelVar = 'year';
      var varNames = d3.keys(data[0])
          .filter(function (key) { return key !== labelVar;});

      var seriesArr = [], series = {};
      varNames.forEach(function (name) {
        series[name] = {name: name, values:[]};
        seriesArr.push(series[name]);
      });

      data.forEach(function (d) {
        varNames.map(function (name) {
          series[name].values.push({
            name: name,
            label: d[labelVar],
            value: +d[name]
          });
        });
      });
      return stack(seriesArr);
    }
  }

  function setLegend(arr) {
    return arr.map(function (n, i) {
      return {name: n, x: (i % 4) * 48, y: Math.floor(i / 4) * 8};
    });
  }

  function objectify(d) {
    var object = new THREE.CSS3DObject(this);
    object.position = d.random.position;
    sscene.add(object);
  }

  function setData(d, i) {
    var vector, phi, theta;

    var random = new THREE.Object3D();
    random.position.x = Math.random() * 4000 - 2000;
    random.position.y = Math.random() * 4000 - 2000;
    random.position.z = Math.random() * 4000 - 2000;
    d['random'] = random;

    var sphere = new THREE.Object3D();
    vector = new THREE.Vector3();
    phi = Math.acos(-1 + ( 2 * i ) / (VIZ.count - 1));
    theta = Math.sqrt((VIZ.count - 1) * Math.PI) * phi;
    sphere.position.x = 800 * Math.cos(theta) * Math.sin(phi);
    sphere.position.y = 800 * Math.sin(theta) * Math.sin(phi);
    sphere.position.z = 800 * Math.cos(phi);
    vector.copy(sphere.position).multiplyScalar(2);
    sphere.lookAt(vector);
    d['sphere'] = sphere;

    var helix = new THREE.Object3D();
    vector = new THREE.Vector3();
    phi = (i + 12) * 0.250 + Math.PI;
    helix.position.x = 1000 * Math.sin(phi);
    helix.position.y = - (i * 8) + 500;
    helix.position.z = 1000 * Math.cos(phi);
    vector.x = 0;
    vector.y = 0;
    vector.z = 0;
    helix.lookAt(vector);
    d['helix'] = helix;

    var grid = new THREE.Object3D();
    grid.position.x = (( i % 5 ) * 400) - 800;
    grid.position.y = ( - ( Math.floor( i / 5 ) % 5 ) * 400 ) + 800;
    grid.position.z = (Math.floor( i / 25 )) * 1000 - 2000;
    d['grid'] = grid;
  }

  VIZ.render = function () {
    rrenderer.render(sscene, camera);
  }

  d3.select("#menu").selectAll('button')
    .data(['sphere', 'helix', 'grid']).enter()
      .append('button')
      .html(function (d) { return d; })
      .on('click', function (d) { VIZ.transform(d); })

  VIZ.transform = function (layout) {
    var duration = 1000;

    TWEEN.removeAll();

    sscene.children.forEach(function (object){
      var newPos = object.element.__data__[layout].position;
      var coords = new TWEEN.Tween(object.position)
            .to({x: newPos.x, y: newPos.y, z: newPos.z}, duration)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .start();

      var newRot = object.element.__data__[layout].rotation;
      var rotate = new TWEEN.Tween(object.rotation)
            .to({x: newRot.x, y: newRot.y, z: newRot.z}, duration)
            .easing(TWEEN.Easing.Sinusoidal.InOut)
            .start();
    });

   var update = new TWEEN.Tween(this)
       .to({}, duration)
       .onUpdate(VIZ.render)
       .start();
  }

  VIZ.animate = function () {
    requestAnimationFrame(VIZ.animate);
    TWEEN.update();
    // controls.update();
  }

  rrenderer = new THREE.CSS3DRenderer();
  rrenderer.setSize(width, height);
  rrenderer.domElement.style.position = 'absolute';
  document.getElementById('container').appendChild(rrenderer.domElement);

  VIZ.onWindowResize = function () {
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    rrenderer.setSize(window.innerWidth, window.innerHeight);
    VIZ.render();
  }
  window.VIZ = VIZ;
}())
