/* given a GeoJSON Feature, return a list of Vector2s
 * describing where to draw the feature, using the provided projection. */
function path(proj, feature) {
  if (feature.geometry.type == 'Polygon') {
	return polygonPath(proj, feature.geometry.coordinates);
  } else if (feature.geometry.type == 'MultiPolygon') {
	return multiPolygonPath(proj, feature.geometry.coordinates);
  }
}

/* a GeoJSON Polygon is a set of 'rings'.  The first ring is the shape of the polygon.
 * each subsequent ring is a hole inside that polygon. */
function polygonPath(proj, rings) {
  var list = [];
  var cur  = [];

  rings.forEach(function(ring, i) {
	cur = [];

	ring.forEach(function(coord, i) {
	  var pts = proj(coord);
	  cur.push(new THREE.Vector2(pts[0], pts[1]));
	});

	list.push(cur);
  });

  return list;
}

/* a GeoJSON MultiPolgyon is just a series of Polygons. */
function multiPolygonPath(proj, polys) {
  var list = [];
  polys.forEach(function(poly, i) {
	   list.push(polygonPath(proj, poly));
  });
  return list;
}

// Create lights for geo-points
function renderLights(proj, features) {
	if (groupLights !== null) return;
	groupLights = new THREE.Object3D();
	features.forEach(function(feature, i) {
		var pts = proj(feature.geometry.coordinates);
		var intensity = feature.properties.TempTrend;
		if (intensity !== null) {

			var color = (intensity < 0.30) ? 0x0055aa :
						(intensity > 0.42) ? 0xff3333 : 0xdddd00;

			var sphere = new THREE.Mesh(new THREE.SphereGeometry(1,1,1),
							new THREE.MeshBasicMaterial({ color: color }));
			sphere.overdraw = true;
			sphere.position.set(pts[0], 3, pts[1]);
			sphere.visible = false;
			groupLights.add( sphere );

			var light = new THREE.PointLight( color, 0.8 );
			light.position.set(pts[0], 3, pts[1]);
			light.visible = false;

			groupLights.add( light );
		}
	});
	scene.add( groupLights );
	groupLights.visible = false;
}

/* for each feature, find it's X/Y Path, create shape(s) with the required holes,
 * and extrude the shape */
function renderFeatures(proj, features, scene, material, isState) {
  var groupMap = [];
  features.forEach(function(feature, i) {
  	var polygons = path(proj, feature);
  	if (feature.geometry.type != 'MultiPolygon') {
  	  polygons = [polygons];
  	}
  	var geometry = null;
  	polygons.forEach(function(poly) {
  		var shape = new THREE.Shape(poly[0]);
  		//var centr = computeCentroid(poly[0]);
  		/*if (poly.length > 1) {
  			shape.holes = poly.slice(1).map(function(item) { return new THREE.Shape(item); });
  		}*/

  		var geoShape = new THREE.Mesh(
  				new THREE.ExtrudeGeometry(shape, {
  					amount: 1,
  					bevelEnabled: false
  				}),
  				material
        );

  		geoShape.matrixAutoUpdate = true;
  		geoShape.updateMatrix();
      geoShape.geometry.center();
  		scene.add(geoShape);

  		// Assign name to this group and save
  		geoShape.name = feature.properties.name;

      groupMap.push(geoShape);
  		if (geometry === null) { geometry = geoShape.geometry; }
  	});

	// // Create geometry from geoShape's bounding box
	// geometry.computeBoundingBox();
	// var widthX =  geometry.boundingBox.max.x - geometry.boundingBox.min.x;
	// var widthY =  geometry.boundingBox.max.y - geometry.boundingBox.min.y;
	// var centerX = geometry.boundingBox.min.x + 0.5 * widthX;
	// var centerY = geometry.boundingBox.min.y + 0.5 * widthY;
	// var points = [
	// 	new THREE.Vector3( geometry.boundingBox.min.x, geometry.boundingBox.min.y, 0 ),
	// 	new THREE.Vector3( geometry.boundingBox.min.x, geometry.boundingBox.max.y, 0 ),
	// 	new THREE.Vector3( geometry.boundingBox.max.x, geometry.boundingBox.max.y, 0 ),
	// 	new THREE.Vector3( geometry.boundingBox.max.x, geometry.boundingBox.min.y, 0 ),
	// 	new THREE.Vector3( centerX, centerY, -1 )
	// ];

	// // Set up geometry and configure material
	// var pGeometry = new THREE.ConvexGeometry(points);
	// var pMaterial = new THREE.MeshLambertMaterial({
	// 		color: 0xa95352
	// 	});
  //
	// var pyramid = new THREE.Mesh(pGeometry, pMaterial);
	// pyramid.rotation.x = Math.PI/2;
	// scene.add(pyramid);
	// pMaterial.opacity = 0;
  //
	// // Assign name to this pyramid and save
	// pyramid.name = feature.properties.name;
	// groupPyramids.push(pyramid);
  //
	// // Create a box the same size as the pyramid
	// var boxGeometry = new THREE.CubeGeometry(widthX, widthY, 1);
	// var boxMaterial = new THREE.MeshLambertMaterial({
	// 		color: 0xa95352, transparent: true, opacity: 0
	// 	});
	// var statbox = new THREE.Mesh(boxGeometry, boxMaterial);
	// statbox.rotation.x = Math.PI/2;
	// statbox.position.x = centerX;
	// statbox.position.z = centerY;
	// statbox.name = feature.properties.name;
	// scene.add(statbox);
	// groupStatbox.push(statbox);
  //
  });
  return groupMap;
}
