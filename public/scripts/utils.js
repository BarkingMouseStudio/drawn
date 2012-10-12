(function() {

  D.random = function(min, max) {
    if (min == null) {
      min = -1;
    }
    if (max == null) {
      max = 1;
    }
    return Math.random() * (max - min) + min;
  };

  D.loadGeometry = function(url) {
    var deferred, loader;
    deferred = new Deferred();
    loader = new THREE.GeometryLoader();
    loader.addEventListener('error', function(event) {
      return deferred.reject(new Error(event.message));
    });
    loader.addEventListener('load', function(event) {
      return deferred.resolve(event.content);
    });
    loader.load(url);
    return deferred.promise();
  };

  D.degreesToRadians = function(degrees) {
    return degrees * (Math.PI / 180);
  };

  D.radiansToDegrees = function(radians) {
    return radians * (180 / Math.PI);
  };

  D.createBoundingCubeFromObject = function(mesh) {
    var boundingBox, boundingBoxMidpoint, cubeGeometry, cubeMaterial, cubeMesh, depth, geometry, height, width;
    geometry = mesh.geometry;
    geometry.computeBoundingBox();
    boundingBox = geometry.boundingBox;
    width = Math.abs(boundingBox.max.x - boundingBox.min.x);
    height = Math.abs(boundingBox.max.y - boundingBox.min.y);
    depth = Math.abs(boundingBox.max.z - boundingBox.min.z);
    boundingBoxMidpoint = boundingBox.min.clone().addSelf(boundingBox.max).divideScalar(2);
    cubeGeometry = new THREE.CubeGeometry(width, height, depth);
    cubeGeometry.applyMatrix(new THREE.Matrix4().setRotationFromEuler(mesh.parent.rotation).translate(boundingBoxMidpoint));
    cubeMaterial = new THREE.MeshBasicMaterial({
      color: 0x66ff88,
      wireframe: true
    });
    cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
    return cubeMesh;
  };

}).call(this);
